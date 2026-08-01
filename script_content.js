  <script type="text/babel">
    const { useState, useCallback, useMemo, useRef, useEffect } = React;

    // Detect template type
    function detectTemplate(rows) {
      if (!rows || rows.length < 2) return 'UNKNOWN';
      const h = rows[0].map(c => String(c ?? '').trim().toLowerCase());
      if (h.includes('designation') && h.includes('prix') && h.includes('etat')) return 'CONVERTY';
      
      const firstCell = String(rows[0][0] ?? '').trim().toLowerCase();
      if (firstCell.startsWith('détails paiement') || firstCell.startsWith('details paiement')) return 'LOGISTA';
      
      if (h.includes('nid') && h.includes('ville') && h.includes('statut') && h.some(x => x.includes('prix cod')) && h.includes('frais')) return 'INTIGO';

      return 'UNKNOWN';
    }

    // Parse Converty
    function parseConverty(rows) {
      const [header, ...data] = rows;
      const h = header.map(c => String(c ?? '').trim().toLowerCase());
      const get = (row, col) => row[h.indexOf(col)];
      const getFlexible = (row, cols) => {
        for (let col of cols) {
          const idx = h.findIndex(c => c.includes(col));
          if (idx > -1 && row[idx] !== undefined) return row[idx];
        }
        return undefined;
      };

      const parsed = data
        .filter(row => {
          const state = String(get(row, 'etat') ?? '').trim().toLowerCase();
          return state.includes('livré') || state.includes('livre') || state.includes('retour') || state.includes('annul');
        })
        .map(row => {
          const state = String(get(row, 'etat') ?? '').trim().toLowerCase();
          const isDelivered = state.includes('livré') || state.includes('livre');
          let phone = String(getFlexible(row, ['téléphone', 'telephone', 'tel', 'phone']) ?? '').trim();
          
          return {
            id: crypto.randomUUID(),
            barcode: String(getFlexible(row, ['code', 'tracking', 'nid']) ?? '').trim(),
            productName: String(get(row, 'designation') ?? '—').trim() || '—',
            phone: phone,
            totalSales: isDelivered ? (parseFloat(String(get(row, 'prix') ?? '0').replace(/,/g, '')) || 0) : 0,
            status: isDelivered ? 'delivered' : 'returned'
          };
        });
      return { rows: parsed, autoFees: null };
    }

    // Parse Logista
    function parseLogista(rows) {
      // Dynamic section detection (case-insensitive)
      const findRow = (kw1, kw2) => rows.findIndex(r =>
        r.some(c => String(c ?? '').toLowerCase().includes(kw1.toLowerCase())) &&
        (!kw2 || r.some(c => String(c ?? '').toLowerCase().includes(kw2.toLowerCase())))
      );
      const findRowSingle = (kw) => rows.findIndex(r =>
        String(r[0] ?? '').trim().toLowerCase().startsWith(kw.toLowerCase())
      );

      const deliveredHeaderIdx = findRow('Code Barres', 'TTC');
      if (deliveredHeaderIdx === -1) throw new Error('لم يتم العثور على جدول التسليم في ملف Logista');

      const deliveredEndIdx = findRowSingle('total liv');
      
      const isDataRow = (r) => {
        const first = String(r[0] ?? '').trim();
        // A valid row has something in the first cell, contains digits, and is not a "Total" row or header
        return first !== '' && !first.toLowerCase().startsWith('total') && first.toLowerCase() !== 'code barres' && /\d/.test(first);
      };

      const deliveredData = rows
        .slice(deliveredHeaderIdx + 1, deliveredEndIdx > -1 ? deliveredEndIdx : undefined)
        .filter(isDataRow);

      // Robust return header detection
      let returnHeaderIdx = findRow('Code Barres', 'frais ret');
      if (returnHeaderIdx === -1 && deliveredEndIdx > -1) {
        // Fallback: Find 'Code Barres' after the delivered section
        const remaining = rows.slice(deliveredEndIdx);
        const relIdx = remaining.findIndex(r => r.some(c => String(c ?? '').toLowerCase().includes('code barres')));
        if (relIdx > -1) returnHeaderIdx = deliveredEndIdx + relIdx;
      }

      const returnEndIdx = findRowSingle('total ret');
      const returnData = returnHeaderIdx > -1
        ? rows.slice(returnHeaderIdx + 1, returnEndIdx > -1 ? returnEndIdx : undefined).filter(isDataRow)
        : [];

      const getPhoneIndex = (headerRow) => {
        if (!headerRow) return -1;
        return headerRow.findIndex(c => {
          const s = String(c ?? '').toLowerCase();
          return s.includes('téléphone') || s.includes('telephone') || s === 'tel' || s.includes('tél') || s.includes('phone');
        });
      };
      const delPhoneIdx = getPhoneIndex(rows[deliveredHeaderIdx]);
      const retPhoneIdx = returnHeaderIdx > -1 ? getPhoneIndex(rows[returnHeaderIdx]) : -1;

      const parsedDelivered = deliveredData.map(row => {
        // TTC Fallback: Read index 8, fallback to 9
        let ttc = parseFloat(row[8]);
        if (isNaN(ttc) || ttc == null) ttc = parseFloat(row[9]) || 0;
        let phone = delPhoneIdx > -1 ? String(row[delPhoneIdx] ?? '').trim() : '';
        return {
          id: crypto.randomUUID(),
          barcode: String(row[0] ?? '').trim(),
          productName: String(row[2] ?? '—').trim() || '—',
          phone: phone,
          totalSales: ttc,
          status: 'delivered'
        };
      });

      const parsedReturned = returnData.map(row => {
        let phone = retPhoneIdx > -1 ? String(row[retPhoneIdx] ?? '').trim() : '';
        return {
          id: crypto.randomUUID(),
          barcode: String(row[0] ?? '').trim(),
          productName: String(row[2] ?? '—').trim() || '—',
          phone: phone,
          totalSales: 0,
          status: 'returned'
        };
      });

      // Auto-Fee Computation
      let deliveryFee = 0;
      if (deliveredData.length > 0) {
        // Column 10 of delivered sub-table
        deliveryFee = parseFloat(deliveredData[0][10]) || 0;
      }

      let returnFee = 0;
      if (returnData.length > 0) {
        // Column 8 of returns sub-table
        returnFee = parseFloat(returnData[0][8]) || 0;
      }

      return { 
        rows: [...parsedDelivered, ...parsedReturned], 
        autoFees: { delivery: deliveryFee, return: returnFee } 
      };
    }

    // Parse Intigo
    function parseIntigo(rows) {
      const [header, ...data] = rows;
      const h = header.map(c => String(c ?? '').trim().toLowerCase());
      
      const get = (row, colSubstring) => {
        const idx = h.findIndex(x => x === colSubstring || x.includes(colSubstring));
        return idx > -1 ? row[idx] : undefined;
      };

      const parsed = data
        .filter(row => {
          const state = String(get(row, 'statut') ?? '').trim().toLowerCase();
          return state === 'livre' || state === 'retourne' || state === 'livré' || state === 'retourné';
        })
        .map(row => {
          const state = String(get(row, 'statut') ?? '').trim().toLowerCase();
          const isDelivered = state === 'livre' || state === 'livré';
          
          let phone = '';
          const phoneIdx = h.findIndex(x => x.includes('téléphone') || x.includes('telephone') || x === 'tel' || x.includes('phone'));
          if (phoneIdx > -1) {
            phone = String(row[phoneIdx] ?? '').trim();
          }
          
          return {
            id: crypto.randomUUID(),
            nid: String(get(row, 'nid') ?? '').trim(),
            city: String(get(row, 'ville') ?? '').trim(),
            productName: 'جاري التحميل...', // Placeholder until enriched
            phone: phone,
            totalSales: isDelivered ? (parseFloat(String(get(row, 'prix cod') ?? '0').replace(/,/g, '')) || 0) : 0,
            status: isDelivered ? 'delivered' : 'returned',
            carrier: 'INTIGO',
            needsEnrichment: true
          };
        });
        
      return { rows: parsed, autoFees: null, isIntigo: true };
    }

    function useCountUp(val, duration = 400) {
      const [current, setCurrent] = useState(val);
      useEffect(() => {
        if (current === val) return;
        const start = performance.now();
        const startVal = current;
        const endVal = val;
        
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCurrent(startVal + (endVal - startVal) * easeOut);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, [val, duration]);
      return current;
    }

    function App() {
      // Three separate state arrays
      const [masterRows, setMasterRows] = useState([]);
      const [cakadoRows, setCakadoRows] = useState([]);
      const [balkisRows, setBalkisRows] = useState([]);
      
      const [selectedIds, setSelectedIds] = useState(new Set());
      const [error, setError] = useState(null);
      const [autoFeesInfo, setAutoFeesInfo] = useState(null);

      // Presentational Derived View States
      const [searchQuery, setSearchQuery] = useState('');
      const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'delivered', 'returned', 'error'
      const [sortOption, setSortOption] = useState('default'); // 'default', 'price-desc', 'price-asc', 'city', 'status', 'product'
      const [activeCarrier, setActiveCarrier] = useState(null);

      // Theme toggle
      const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('recon-theme');
        if (stored) return stored;
        return 'light';
      });

      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('recon-theme', theme);
      }, [theme]);

      const toggleTheme = () => setTheme(t => t === 'light' ? 'console' : 'light');

      // Intigo State
      const [intigoApiKey, setIntigoApiKey] = useState(localStorage.getItem('intigoApiKey') || '');
      const [isEnriching, setIsEnriching] = useState(false);
      const [enrichProgress, setEnrichProgress] = useState({ current: 0, total: 0, errors: 0 });
      const currentUploadId = useRef(0);
      const [showResetModal, setShowResetModal] = useState(false);

      // Per-Brand Fee Structure
      const [cakadoFees, setCakadoFees] = useState({ delivery: 0, return: 0 });
      const [balkisFees, setBalkisFees] = useState({ delivery: 0, return: 0 });

      const resetSession = useCallback(() => {
        currentUploadId.current += 1;
        setMasterRows([]);
        setCakadoRows([]);
        setBalkisRows([]);
        setActiveCarrier(null);
        setAutoFeesInfo(null);
        setError(null);
        setSearchQuery('');
        setFilterStatus('all');
        setSortOption('default');
        setSelectedIds(new Set());
        setIsEnriching(false);
        setEnrichProgress({ current: 0, total: 0, errors: 0 });
        setCakadoFees({ delivery: 0, return: 0 });
        setBalkisFees({ delivery: 0, return: 0 });
        setShowResetModal(false);
      }, []);

      const handleNewCompanyClick = () => {
        const isDirty = masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0 || activeCarrier || isEnriching;
        if (isDirty) {
          setShowResetModal(true);
        } else {
          resetSession();
        }
      };

      const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId) => {
        setIsEnriching(true);
        setEnrichProgress({ current: 0, total: rowsToEnrich.length, errors: 0 });
        
        let current = 0;
        let errors = 0;
        let updatedRowsPart = [];
        let isFirstSuccess = true;
        
        for (let i = 0; i < rowsToEnrich.length; i++) {
          if (uploadId !== currentUploadId.current) break; // Abort on new upload
          
          const row = { ...rowsToEnrich[i] };
          if (!row.needsEnrichment) continue;
          
          let retries = 3;
          let success = false;
          let name = 'منتج غير معروف';
          
          while (retries > 0 && !success) {
            if (uploadId !== currentUploadId.current) break;
            try {
              const res = await fetch(`https://api.intigo.net/api/v3/parcels/${encodeURIComponent(row.nid)}`, {
                headers: { 'X-API-Key': apiKey }
              });
              
              if (res.status === 401) {
                setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                setIsEnriching(false);
                return;
              }
              
              if (res.status === 404) {
                name = 'منتج غير معروف';
                success = true;
              } else if (res.ok) {
                const jsonData = await res.json();
                
                const parcelData = jsonData.data || jsonData.parcel || jsonData.result || jsonData;
                
                const productName =
                  parcelData.description ||
                  parcelData.product_name ||
                  parcelData.name ||
                  parcelData.content ||
                  parcelData.item_name ||
                  'منتج بدون اسم';
                  
                const fetchedPhone = parcelData.client_phone || parcelData.customer_phone || parcelData.phone || parcelData.receiver_phone || parcelData.telephone || '';
                  
                const finalProductName = (productName && productName.trim() !== '') ? productName : 'منتج بدون اسم';
                
                if (isFirstSuccess) {
                  console.log('🔍 Intigo API Debug - First Response Structure:', jsonData);
                  console.log('🔍 Intigo API Debug - Extracted Product Name:', finalProductName);
                  console.log('🔍 Intigo API Debug - Extracted Phone:', fetchedPhone);
                  isFirstSuccess = false;
                }
                
                name = finalProductName;
                if (!row.phone && fetchedPhone) row.phone = fetchedPhone;
                success = true;
              } else {
                throw new Error(`Status ${res.status}`);
              }
            } catch (err) {
              retries--;
              if (retries === 0) {
                errors++;
                name = 'خطأ في الجلب';
              } else {
                await new Promise(r => setTimeout(r, 200));
              }
            }
          }
          
          if (!success) {
            row.hasError = true;
            row.needsEnrichment = true;
            row.productName = 'خطأ في الجلب';
          } else {
            row.hasError = false;
            row.needsEnrichment = false;
            row.productName = name;
          }
          
          updatedRowsPart.push(row);
          current++;
          
          if (current % 5 === 0 || current === rowsToEnrich.length) {
            setEnrichProgress(p => ({ ...p, current, errors }));
            
            if (updatedRowsPart.length > 0) {
                const part = [...updatedRowsPart];
                updatedRowsPart = [];
                const updateArr = (arr) => arr.map(pr => {
                   const updated = part.find(ur => ur.id === pr.id);
                   return updated ? { ...pr, productName: updated.productName, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError } : pr;
                });
                
                setMasterRows(prev => updateArr(prev));
                setCakadoRows(prev => updateArr(prev));
                setBalkisRows(prev => updateArr(prev));
            }
          }
          
          await new Promise(r => setTimeout(r, 80)); // Rate limit
        }
        
        if (uploadId === currentUploadId.current) {
           setIsEnriching(false);
        }
      };

      // Drag and drop mechanics
      const handleDragStart = (e, id) => {
        e.dataTransfer.setData('text/plain', id);
      };

      const handleDrop = (e, targetZone) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;

        // Locate row across all three arrays
        let row = masterRows.find(r => r.id === id) || 
                  cakadoRows.find(r => r.id === id) || 
                  balkisRows.find(r => r.id === id);

        if (!row) return;

        // Remove from all three simultaneously
        setMasterRows(prev => prev.filter(r => r.id !== id));
        setCakadoRows(prev => prev.filter(r => r.id !== id));
        setBalkisRows(prev => prev.filter(r => r.id !== id));

        // Append to the target zone's array
        if (targetZone === 'master') {
          setMasterRows(prev => [...prev, row]);
        } else if (targetZone === 'cakado') {
          setCakadoRows(prev => [...prev, row]);
        } else if (targetZone === 'balkis') {
          setBalkisRows(prev => [...prev, row]);
        }
      };

      const handleDragOver = (e) => {
        e.preventDefault();
      };

      const handleRetryEnrichment = (e, row) => {
        e.stopPropagation();
        if (!intigoApiKey) {
          setError('الرجاء إدخال مفتاح API أولاً');
          return;
        }
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current);
      };

      const handleFileUpload = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            const template = detectTemplate(rawRows);
            let result;

            if (template === 'CONVERTY') result = parseConverty(rawRows);
            else if (template === 'LOGISTA') result = parseLogista(rawRows);
            else if (template === 'INTIGO') result = parseIntigo(rawRows);
            else {
              setError('خطأ: تنسيق الملف غير معروف. يُقبل ملفات Converty أو Logista أو Intigo فقط.');
              return;
            }

            if (result.rows.length === 0) {
              setError('خطأ: الملف لا يحتوي على أي بيانات تخص التوصيل أو الإرجاع.');
              return;
            }

            resetSession();
            
            const thisUploadId = currentUploadId.current;
            
            // Full State Reset: On every file upload, reset all state before loading new data
            setMasterRows(result.rows);
            setActiveCarrier(template);
            
            if (result.autoFees) {
              setAutoFeesInfo(result.autoFees);
              setCakadoFees(result.autoFees);
              setBalkisFees(result.autoFees);
            }
            
            if (result.isIntigo) {
              if (!intigoApiKey) {
                setError('تنبيه: يرجى إدخال مفتاح Intigo API في الأعلى لجلب أسماء المنتجات، تمت إضافة الطلبات بدون أسماء.');
              } else {
                enrichIntigoRows(result.rows, intigoApiKey, thisUploadId);
              }
            }
          } catch (err) {
            setError('خطأ: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      }, [intigoApiKey]);

      const onFileInputChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileUpload(e.target.files[0]);
          e.target.value = '';
        }
      }, [handleFileUpload]);

      const onDropFile = useCallback((e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files[0]);
        }
      }, [handleFileUpload]);

      // Number Formatting
      const formatTND = (val) => val.toLocaleString('ar-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 });

      const calculateStats = (rows, fees) => {
        let totalSales = 0;
        let totalDeliveryFees = 0;
        let totalReturnFees = 0;

        rows.forEach(row => {
          if (row.carrier === 'INTIGO') {
            if (row.status === 'delivered') {
              totalSales += row.totalSales;
              totalDeliveryFees += 7;
            } else if (row.status === 'returned') {
              const grandTunis = ['ariana', 'tunis', 'mannouba', 'ben arous'];
              const city = String(row.city || '').trim().toLowerCase();
              if (grandTunis.includes(city)) {
                totalReturnFees += 1;
              } else {
                totalReturnFees += 2;
              }
            }
          } else {
            if (row.status === 'delivered') {
              totalSales += row.totalSales;
              totalDeliveryFees += fees.delivery || 0;
            } else if (row.status === 'returned') {
              totalReturnFees += fees.return || 0;
            }
          }
        });
        
        const netRevenue = totalSales - totalDeliveryFees - totalReturnFees;
        return { totalSales, totalDeliveryFees, totalReturnFees, netRevenue, count: rows.length };
      };

      const getDerivedView = (sourceArray) => {
        return useMemo(() => {
          let res = [...sourceArray];
          
          // Apply Search
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            res = res.filter(r => 
              (r.productName && r.productName.toLowerCase().includes(q)) || 
              (r.nid && String(r.nid).toLowerCase().includes(q)) ||
              (r.barcode && String(r.barcode).toLowerCase().includes(q)) ||
              (r.phone && String(r.phone).includes(q))
            );
          }
          
          // Apply Filter
          if (filterStatus === 'delivered') res = res.filter(r => r.status === 'delivered');
          if (filterStatus === 'returned') res = res.filter(r => r.status === 'returned');
          if (filterStatus === 'error') res = res.filter(r => r.hasError);
          
          // Apply Sort
          if (sortOption === 'price-desc') res.sort((a, b) => b.totalSales - a.totalSales);
          if (sortOption === 'price-asc') res.sort((a, b) => a.totalSales - b.totalSales);
          if (sortOption === 'city') res.sort((a, b) => String(a.city || '').localeCompare(String(b.city || '')));
          if (sortOption === 'status') res.sort((a, b) => a.status.localeCompare(b.status));
          if (sortOption === 'product') res.sort((a, b) => a.productName.localeCompare(b.productName, 'ar', { sensitivity: 'base' }));
          
          return res;
        }, [sourceArray, searchQuery, filterStatus, sortOption]);
      };
      
      const viewMaster = getDerivedView(masterRows);
      const viewCakado = getDerivedView(cakadoRows);
      const viewBalkis = getDerivedView(balkisRows);

      const cakadoStats = calculateStats(cakadoRows, cakadoFees);
      const balkisStats = calculateStats(balkisRows, balkisFees);

      const toggleSelectAll = (rowsToToggle) => {
        const rowIds = rowsToToggle.map(r => r.id);
        const allSelected = rowIds.length > 0 && rowIds.every(id => selectedIds.has(id));
        if (allSelected) {
          const newSet = new Set(selectedIds);
          rowIds.forEach(id => newSet.delete(id));
          setSelectedIds(newSet);
        } else {
          const newSet = new Set(selectedIds);
          rowIds.forEach(id => newSet.add(id));
          setSelectedIds(newSet);
        }
      };

      const toggleSelect = (e, id) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
      };

      const moveSelected = (targetZone) => {
        const toMove = [];
        const newMaster = [];
        masterRows.forEach(r => selectedIds.has(r.id) ? toMove.push(r) : newMaster.push(r));
        
        const newCakado = [];
        cakadoRows.forEach(r => selectedIds.has(r.id) ? toMove.push(r) : newCakado.push(r));
        
        const newBalkis = [];
        balkisRows.forEach(r => selectedIds.has(r.id) ? toMove.push(r) : newBalkis.push(r));

        if (targetZone === 'master') setMasterRows([...newMaster, ...toMove]);
        else setMasterRows(newMaster);

        if (targetZone === 'cakado') setCakadoRows([...newCakado, ...toMove]);
        else setCakadoRows(newCakado);

        if (targetZone === 'balkis') setBalkisRows([...newBalkis, ...toMove]);
        else setBalkisRows(newBalkis);

        setSelectedIds(new Set());
      };

      const moveSelectedDirectly = (row, targetZone) => {
        setMasterRows(prev => prev.filter(r => r.id !== row.id));
        setCakadoRows(prev => prev.filter(r => r.id !== row.id));
        setBalkisRows(prev => prev.filter(r => r.id !== row.id));
        if (targetZone === 'master') setMasterRows(prev => [row, ...prev]);
        if (targetZone === 'cakado') setCakadoRows(prev => [row, ...prev]);
        if (targetZone === 'balkis') setBalkisRows(prev => [row, ...prev]);
      };

      const renderTable = (rows, title, zone, selectable = false, accentColor = '') => {
        const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
        return (
          <div 
            className="bg-surface rounded-xl shadow-sm border border-line flex flex-col h-full min-h-[400px] relative overflow-hidden transition-transform duration-200"
            onDrop={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
              handleDrop(e, zone);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = accentColor ? `0 -2px 10px ${accentColor}33` : '0 -2px 10px rgba(0,0,0,0.05)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {accentColor && <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }}></div>}
            
            <div className="bg-surface-2 p-4 border-b border-line flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectable && (
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded cursor-pointer accent-brand" 
                    checked={allSelected}
                    onChange={() => toggleSelectAll(rows)}
                  />
                )}
                <span className="font-display text-lg text-ink">{title}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-line text-ink text-xs px-2 py-0.5 rounded-full tabular-nums font-bold">{rows.length}</span>
                <span className="text-[10px] text-ink-faint mt-1 tabular-nums">مسلّم {rows.filter(r=>r.status==='delivered').length} • مسترجع {rows.filter(r=>r.status==='returned').length}</span>
              </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative">
              {rows.length === 0 && (
                <div className="absolute inset-4 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-center p-4">
                  <span className="text-sm text-ink-soft">اسحب الطلبات إلى هنا، أو حدّدها ثم انقر للتعيين</span>
                </div>
              )}
              {rows.map((row, i) => {
                const isGrandTunis = ['ariana', 'tunis', 'mannouba', 'ben arous'].includes(String(row.city || '').trim().toLowerCase());
                return (
                  <div
                    key={row.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.id)}
                    onClick={selectable ? (e) => toggleSelect(e, row.id) : undefined}
                    className={`bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative
                      ${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md'} 
                      ${selectedIds.has(row.id) ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line'}
                    `}
                    style={i < 12 ? { animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` } : {}}
                  >
                    <div className="flex items-start gap-3">
                      {selectable && (
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 mt-0.5 rounded cursor-pointer accent-brand"
                          checked={selectedIds.has(row.id)}
                          onChange={(e) => toggleSelect(e, row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-[14px] text-ink leading-tight">{row.productName}</span>
                          <span className="font-mono font-bold text-ink tabular-nums whitespace-nowrap text-[14px]" dir="ltr">
                            {row.status === 'delivered' ? formatTND(row.totalSales) : <span className="text-ink-faint">—</span>}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono text-ink-faint uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 rounded" dir="ltr">{row.nid || row.barcode || 'N/A'}</span>
                          {row.city && (
                            <span className={`px-1.5 py-0.5 rounded ${row.carrier === 'INTIGO' ? (isGrandTunis ? 'bg-brand/10 text-brand' : 'bg-warn/10 text-warn') : 'bg-surface-2 text-ink-soft'}`}>
                              {row.city}
                            </span>
                          )}
                          {row.phone && (
                            <span className="text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded" dir="ltr">{row.phone}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${row.status === 'delivered' ? 'bg-pos/10 text-pos' : 'bg-neg/10 text-neg'}`}>
                              {row.status === 'delivered' ? 'مُسلّم' : 'مسترجع'}
                            </span>
                            {row.hasError && (
                              <button onClick={(e) => handleRetryEnrichment(e, row)} className="text-[11px] text-brand hover:underline flex items-center gap-1">
                                ⚠ إعادة المحاولة
                              </button>
                            )}
                          </div>
                          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            {zone === 'master' ? (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); moveSelectedDirectly(row, 'cakado'); }} className="text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[32px]">→ كاكادو</button>
                                <button onClick={(e) => { e.stopPropagation(); moveSelectedDirectly(row, 'balkis'); }} className="text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[32px]">→ بلقيس</button>
                              </>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); moveSelectedDirectly(row, 'master'); }} className="text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[32px]">↩ إلغاء</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      };

      const renderFeeInputs = (fees, setFees, isLocked = false) => (
        <div className="mt-4 bg-surface p-4 rounded-xl shadow-sm border border-line flex flex-col gap-3">
          <h4 className="text-sm font-bold text-ink flex items-center justify-between">
            <span>إعدادات الرسوم</span>
            {isLocked && <span className="text-[10px] uppercase tracking-wider text-warn bg-warn/10 px-2 py-0.5 rounded font-mono">تلقائية 7/1/2</span>}
          </h4>
          {!isLocked && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide">رسوم التوصيل (TND)</label>
                <input
                  type="number" step="0.001" min="0" dir="ltr"
                  className="w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums"
                  value={fees.delivery || 0}
                  onChange={e => setFees(prev => ({ ...prev, delivery: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide">رسوم الإرجاع (TND)</label>
                <input
                  type="number" step="0.001" min="0" dir="ltr"
                  className="w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums"
                  value={fees.return || 0}
                  onChange={e => setFees(prev => ({ ...prev, return: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )}
        </div>
      );

      const AnimatedNumber = ({ value }) => {
        const displayValue = useCountUp(value, 400);
        return <>{formatTND(displayValue)}</>;
      };

      const BrandSummaryCard = ({ title, stats }) => (
        <div className="bg-surface rounded-xl shadow-sm border border-line p-5 flex-1 flex flex-col justify-between surface-highlight">
          <h3 className="text-lg font-display text-ink mb-4">{title}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">إجمالي المبيعات</span>
              <span className="font-medium text-ink tabular-nums">{formatTND(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">رسوم التوصيل</span>
              <span className="tabular-nums text-neg" dir="ltr">−{stats.totalDeliveryFees.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">رسوم الإرجاع</span>
              <span className="tabular-nums text-neg" dir="ltr">−{stats.totalReturnFees.toFixed(3)} TND</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-line flex flex-col items-start">
            <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">صافي الإيرادات / NET</span>
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-ink leading-tight tabular-nums tracking-tight"><AnimatedNumber value={stats.netRevenue} /></span>
          </div>
        </div>
      );

      const netTotalRevenue = cakadoStats.netRevenue + balkisStats.netRevenue;
      
      const carrierBadge = activeCarrier === 'CONVERTY' ? 'First Delivery' :
                           activeCarrier === 'LOGISTA' ? 'BigBoss' :
                           activeCarrier === 'INTIGO' ? 'Intigo' :
                           activeCarrier || 'لا يوجد';

      const isIntigoLocked = activeCarrier === 'INTIGO';

      return (
        <div className="flex flex-col min-h-screen pb-24 text-ink transition-colors duration-250">
          
          {/* Sticky Header Group */}
          <div className="sticky top-0 z-40 flex flex-col">
            {/* Command Bar */}
            <header className="bg-surface/95 backdrop-blur shadow-sm border-b border-line sheen">
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Row A on mobile, Left on desktop */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="bg-surface-2 border border-line text-ink-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      {carrierBadge}
                    </span>
                    {isEnriching && (
                       <div className="w-16 h-1 bg-surface-2 rounded-full overflow-hidden ml-2">
                         <div className="bg-brand h-full transition-all duration-300" style={{ width: `${Math.max(5, (enrichProgress.current / (enrichProgress.total||1)) * 100)}%` }}></div>
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end md:items-center shrink-0">
                    <span className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">صافي الإيرادات / NET</span>
                    <span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums">
                      <AnimatedNumber value={netTotalRevenue} />
                    </span>
                  </div>
                </div>

                {/* Row B & C on mobile, Right on desktop */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
                  
                  {/* Row B: API Key */}
                  <div className="w-full md:w-auto flex items-center">
                    <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-full border border-line w-full md:w-48">
                      <input
                        type="password"
                        value={intigoApiKey}
                        onChange={(e) => {
                          setIntigoApiKey(e.target.value);
                          localStorage.setItem('intigoApiKey', e.target.value);
                        }}
                        placeholder="مفتاح Intigo"
                        className="bg-transparent border-none outline-none text-xs w-full text-ink font-mono tracking-widest"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Row C: Controls */}
                  <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto">
                    <span className={`shrink-0 w-2.5 h-2.5 rounded-full mx-1 ${intigoApiKey ? (error ? 'bg-warn animate-pulse' : 'bg-pos') : 'bg-neg'}`} title={intigoApiKey ? (error ? 'خطأ في الاتصال' : 'متصل') : 'غير متصل'}></span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={theme === 'console'}
                      aria-label={theme === 'console' ? "الوضع النهاري" : "الوضع الليلي"}
                      title={theme === 'console' ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
                      onClick={toggleTheme}
                      className="relative inline-flex shrink-0 items-center min-h-[44px] px-1 select-none cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] bg-transparent border-none"
                      style={{ transition: "background-color 250ms ease, border-color 250ms ease" }}
                    >
                      <span
                        className="relative flex w-14 h-8 shrink-0 items-center rounded-full border"
                        style={{
                          backgroundColor: theme === 'console' ? "var(--surface-2)" : "#E2E7EE",
                          borderColor: "var(--line)",
                          transition: "background-color 250ms ease"
                        }}
                      >
                        <span dir="ltr" className="absolute inset-inline-start-1.5 text-[12px] leading-none" style={{ color: theme === 'console' ? "var(--ink-faint)" : "var(--warn)" }} aria-hidden="true">☀</span>
                        <span dir="ltr" className="absolute inset-inline-end-1.5 text-[12px] leading-none" style={{ color: theme === 'console' ? "var(--brand)" : "var(--ink-faint)" }} aria-hidden="true">☾</span>
                        <span
                          className="absolute top-1 h-6 w-6 rounded-full shadow-sm flex items-center justify-center"
                          style={{
                            insetInlineStart: theme === 'console' ? "calc(100% - 1.75rem)" : "0.25rem",
                            backgroundColor: theme === 'console' ? "var(--brand)" : "#FFFFFF",
                            transition: "inset-inline-start 220ms cubic-bezier(.34,1.56,.64,1), background-color 250ms ease"
                          }}
                          aria-hidden="true"
                        />
                      </span>
                    </button>

                    <button onClick={handleNewCompanyClick} className="shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold" aria-label="مسح الجلسة الحالية والبدء بشركة توصيل أخرى" title="مسح الجلسة الحالية والبدء بشركة توصيل أخرى">
                      <span>شركة جديدة</span>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Search/Filter Bar */}
            <div className="bg-bg/95 backdrop-blur border-b border-line px-4 md:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="flex-1 flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-1.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all">
                <span className="text-ink-soft text-sm">🔍</span>
                <input 
                  type="text" 
                  className="bg-transparent border-none outline-none w-full text-sm text-ink placeholder-ink-faint"
                  placeholder="بحث عن منتج، باركود، هاتف..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {['all', 'delivered', 'returned', 'error'].map(status => {
                  const label = status === 'all' ? 'الكل' : status === 'delivered' ? 'مُسلّم' : status === 'returned' ? 'مسترجع' : '⚠ خطأ';
                  const active = filterStatus === status;
                  return (
                    <button 
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <select 
                  className="text-xs bg-surface border border-line rounded-lg px-3 py-2 text-ink outline-none focus:border-brand"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">الترتيب الافتراضي</option>
                  <option value="price-desc">السعر (الأعلى)</option>
                  <option value="price-asc">السعر (الأقل)</option>
                  <option value="city">الولاية</option>
                  <option value="status">الحالة</option>
                  <option value="product">الاسم (أ - ي)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

          <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
            {/* Upload Zone */}
            {(!masterRows.length && !cakadoRows.length && !balkisRows.length) && (
              <label 
                className="border-2 border-dashed border-line bg-surface hover:bg-surface-2 transition-colors rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer text-center group"
                onDrop={onDropFile}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <span className="font-display text-xl text-ink mb-2">اسحب الطلبات إلى هنا</span>
                <span className="text-sm text-ink-soft">أو انقر لاختيار ملف (.xlsx, .csv)</span>
                <input type="file" accept=".xlsx,.csv" className="hidden" onChange={onFileInputChange} />
              </label>
            )}

            {/* Toasts / Errors */}
            {error && (
              <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {autoFeesInfo && (
              <div className="bg-pos/10 text-pos border border-pos/20 rounded-lg p-4 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm font-medium">تم ضبط الرسوم تلقائياً من Logista.</p>
              </div>
            )}

            {(masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) && (
              <>
                {/* Instruments */}
                <div className="flex flex-col md:flex-row gap-6">
                  <BrandSummaryCard title="كاكادو (CAKADO)" stats={cakadoStats} />
                  <BrandSummaryCard title="بلقيس (Balkis)" stats={balkisStats} />
                </div>

                {/* Trays */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="order-1 lg:order-none">{renderTable(viewMaster, 'غير مصنفة', 'master', true, '')}</div>
                  <div className="order-2 lg:order-none">
                    {renderTable(viewCakado, 'كاكادو', 'cakado', true, 'var(--brand)')}
                    {renderFeeInputs(cakadoFees, setCakadoFees, isIntigoLocked)}
                  </div>
                  <div className="order-3 lg:order-none">
                    {renderTable(viewBalkis, 'بلقيس', 'balkis', true, '#3b82f6')}
                    {renderFeeInputs(balkisFees, setBalkisFees, isIntigoLocked)}
                  </div>
                </div>
              </>
            )}

            {/* Floating Selection Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
                <div className="max-w-3xl mx-auto bg-surface border border-line text-ink rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto surface-highlight">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm bg-brand text-white px-2.5 py-0.5 rounded-full shadow-sm">{selectedIds.size}</span>
                      <span className="text-ink-soft font-medium text-sm">محدد</span>
                    </div>
                    <button onClick={() => setSelectedIds(new Set())} className="text-ink-faint hover:text-ink text-sm font-medium px-2 py-1 rounded transition-colors">إلغاء</button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    <button onClick={() => moveSelected('master')} className="flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-surface-2 hover:bg-line text-ink rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5">
                      إلى غير مصنفة
                    </button>
                    <button onClick={() => moveSelected('cakado')} className="flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-brand/20">
                      تعيين كاكادو
                    </button>
                    <button onClick={() => moveSelected('balkis')} className="flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20">
                      تعيين بلقيس
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reset Modal */}
            {showResetModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[#0B1220]/60 backdrop-blur-sm transition-opacity" onClick={() => setShowResetModal(false)}></div>
                <div className="relative bg-surface border border-line rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
                  <h2 className="font-display text-xl text-ink mb-2">بدء جلسة جديدة؟</h2>
                  <p className="text-ink-soft text-sm mb-6 leading-relaxed">
                    سيتم مسح جميع الطلبات المصنّفة والنتائج الحالية لشركة التوصيل هذه. لا يمكن التراجع عن هذا الإجراء.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowResetModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 border border-transparent transition-colors">إلغاء</button>
                    <button onClick={resetSession} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-neg hover:bg-neg/90 transition-colors shadow-sm shadow-neg/20">مسح والبدء</button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
