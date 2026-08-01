
    

    const round3 = (x) => {
      const n = Math.round((Number(x) || 0) * 1000) / 1000;
      return isNaN(n) ? 0 : n;
    };

    const formatTND = (x) => round3(x).toFixed(3).replace(".", ",");

    const parseMoney = (raw) => {
      if (raw == null) return { value: 0, bad: false };
      let s = String(raw).trim();
      s = s.replace(/DT|TND|د\.?ت\.?|دينار|\$|€|\s|\u00A0/g, "");
      if (s === "") return { value: 0, bad: false };
      
      if (s.includes(",") && s.includes(".")) {
        const firstComma = s.indexOf(",");
        const firstDot = s.indexOf(".");
        if (firstComma < firstDot) {
          s = s.replace(/,/g, "");
        } else {
          s = s.replace(/\./g, "").replace(/,/g, ".");
        }
      } else if (s.includes(",")) {
        const lastComma = s.lastIndexOf(",");
        const afterComma = s.substring(lastComma + 1);
        if (afterComma.length >= 1 && afterComma.length <= 3) {
          s = s.substring(0, lastComma).replace(/,/g, "") + "." + afterComma;
        } else {
          s = s.replace(/,/g, "");
        }
      }
      
      const n = Number(s.replace(/[^0-9.\-]/g, ""));
      if (!isFinite(n) || isNaN(n)) return { value: 0, bad: true };
      return { value: round3(n), bad: false };
    };

    const normalizeId = (raw) => String(raw ?? '').trim().replace(/\s+/g,' ').toLowerCase();
    const normalizeCity = (raw) => {
      if (!raw) return "";
      return String(raw)
        .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[.,/#!$%\^&\*;:{}=\-_~()]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const GOV_ALIASES = {
      "GRAND_TUNIS.TUNIS": ["tunis", "tunez", "tunes", "تونس", "تونس المدينة", "la marsa", "المرسى", "marsa", "carthage", "قرطاج", "le bardo", "باردو", "bardo", "sidi hassine", "el omrane", "ettadhamen", "hrairia", "jebel jelloud", "el kabaria", "sidi el bechir", "bab bhar", "bab souika", "la goulette", "حلق الوادي", "goulette", "kram", "الكرم", "sidi bou said", "سيدي بوسعيد"],
      "GRAND_TUNIS.ARIANA": ["ariana", "أريانة", "aryanah", "arianah", "la soukra", "السوكرة", "soukra", "raoued", "رواد", "روّاد", "kalaat el andalous", "sidi thabet", "mnihla", "المنيهلة", "اريانة المدينة", "ariana ville", "ariana medina"],
      "GRAND_TUNIS.BEN_AROUS": ["ben arous", "بن عروس", "بنعرس", "el mourouj", "المروج", "mourouj", "hammam-lif", "hammam lif", "حمام الانف", "hammam chott", "ezzahra", "rades", "رادس", "megrine", "megarine", "mornag", "fouchana", "mohamedia", "bou mhel el bassatine"],
      "GRAND_TUNIS.MANNOUBA": ["mannouba", "manouba", "la manouba", "منوبة", "المنوبة", "oued ellil", "وادي الليل", "mornaguia", "borj el amri", "douar hicher", "el batan", "tebourba", "طبربة", "jedaida", "الجديدة"]
    };

    const REVERSE_GOV = new Map();
    for (const [id, aliases] of Object.entries(GOV_ALIASES)) {
      for (const alias of aliases) {
        REVERSE_GOV.set(normalizeCity(alias), id);
      }
    }

    const resolveGov = (raw) => {
      const norm = normalizeCity(raw);
      if (!norm) return { canonical: "OTHER", isGrandTunis: false, unknown: false, raw: raw };
      const id = REVERSE_GOV.get(norm);
      return { 
        canonical: id ?? "OTHER", 
        isGrandTunis: !!id && id.startsWith("GRAND_TUNIS"), 
        unknown: id == null,
        raw: raw
      };
    };

    const statusBucket = (codeOrLabel) => {
      const s = String(codeOrLabel).trim().toLowerCase();
      if (["5000", "livre", "livré", "delivered", "تم التسليم", "مسلم", "مسلّم"].includes(s)) return "delivered";
      if (["6900", "retourne", "retourné", "returned", "retour reçu", "مسترجع", "مرتجع", "تم الارجاع"].includes(s)) return "returned";
      if (["1100", "1101", "1102", "9000", "9001", "9002", "9003", "9004", "annule", "annulé", "cancelled", "ملغى", "ملغي"].includes(s)) return "cancelled";
      if (["6500", "exchange", "تبادل"].includes(s)) return "exchange";
      if (["6000", "6001", "3201", "return_in_progress"].includes(s)) return "return_in_progress";
      return "in_progress";
    };


    // Detect template type
    function findHeaderAndScore(rows) {
      if (!rows || rows.length === 0) return { template: 'UNKNOWN', headerIdx: 0 };
      
      let bestScore = 0;
      let bestTemplate = 'UNKNOWN';
      let bestIdx = 0;

      const scanLimit = Math.min(8, rows.length);
      for (let i = 0; i < scanLimit; i++) {
        const r = rows[i];
        if (!r) continue;
        const h = r.map(c => String(c ?? '').trim().toLowerCase());
        
        let convertyScore = 0;
        if (h.includes('designation')) convertyScore++;
        if (h.includes('prix')) convertyScore++;
        if (h.includes('etat')) convertyScore++;
        
        let intigoScore = 0;
        if (h.includes('nid')) intigoScore++;
        if (h.includes('ville')) intigoScore++;
        if (h.includes('statut')) intigoScore++;
        if (h.some(x => x.includes('prix cod'))) intigoScore++;
        if (h.includes('frais')) intigoScore++;
        
        const firstCell = String(r[0] ?? '').trim().toLowerCase();
        let logistaScore = 0;
        if (firstCell.startsWith('détails paiement') || firstCell.startsWith('details paiement')) logistaScore = 5;

        if (logistaScore >= 5 && logistaScore > bestScore) { bestScore = logistaScore; bestTemplate = 'LOGISTA'; bestIdx = i; }
        else if (intigoScore >= 4 && intigoScore > bestScore) { bestScore = intigoScore; bestTemplate = 'INTIGO'; bestIdx = i; }
        else if (convertyScore >= 3 && convertyScore > bestScore) { bestScore = convertyScore; bestTemplate = 'CONVERTY'; bestIdx = i; }
      }
      
      return { template: bestTemplate, headerIdx: bestIdx };
    }

    function detectTemplate(rows) {
      return findHeaderAndScore(rows).template;
    }

    function parseConverty(rows) {
      const { headerIdx } = findHeaderAndScore(rows);
      const header = rows[headerIdx];
      const data = rows.slice(headerIdx + 1);
      
      const h = header.map(c => String(c ?? '').trim().toLowerCase());
      const get = (row, col) => row[h.indexOf(col)];
      const getFlexible = (row, cols) => {
        for (let col of cols) {
          const idx = h.findIndex(c => c.includes(col));
          if (idx > -1 && row[idx] !== undefined) return row[idx];
        }
        return undefined;
      };
      
      const duplicateNids = [];
      const seenNids = new Set();

      const parsed = data
        .filter(row => {
          const state = String(get(row, 'etat') ?? '').trim().toLowerCase();
          const bucket = statusBucket(state);
          return bucket === 'delivered' || bucket === 'returned' || bucket === 'cancelled' || bucket === 'exchange' || bucket === 'return_in_progress' || state.includes('livré') || state.includes('livre') || state.includes('retour') || state.includes('annul');
        })
        .map(row => {
          const state = String(get(row, 'etat') ?? '').trim().toLowerCase();
          const bucket = statusBucket(state);
          // For legacy compatibility where bucket doesn't map directly, fallback
          const isDelivered = bucket === 'delivered' || state.includes('livré') || state.includes('livre');
          const isReturned = bucket === 'returned' || (state.includes('retour') && !state.includes('en cours'));
          
          let parsedBucket = bucket;
          if (bucket === 'in_progress' || bucket === 'other') {
             if (isDelivered) parsedBucket = 'delivered';
             else if (isReturned) parsedBucket = 'returned';
             else if (state.includes('annul')) parsedBucket = 'cancelled';
          }
          
          let phone = String(getFlexible(row, ['téléphone', 'telephone', 'tel', 'phone']) ?? '').trim();
          let priceObj = parseMoney(get(row, 'prix'));
          
          return {
            id: crypto.randomUUID(),
            barcode: String(getFlexible(row, ['code', 'tracking', 'nid']) ?? '').trim(),
            productName: String(get(row, 'designation') ?? '—').trim() || '—',
            phone: phone,
            totalSales: parsedBucket === 'delivered' ? priceObj.value : 0,
            status: parsedBucket,
            carrier_fee: null,
            rule_fee: 0,
            fee_delta: null,
            moneyParseError: priceObj.bad,
            city: ''
          };
        })
        .filter(row => {
           if (!row.barcode) return true;
           const norm = normalizeId(row.barcode); // Just simple normalize
           if (seenNids.has(norm)) {
             duplicateNids.push(row.barcode);
             return false;
           }
           seenNids.add(norm);
           return true;
        });
        
      return { rows: parsed, autoFees: null, duplicateNids: [...new Set(duplicateNids)] };
    }

    function parseLogista(rows) {
      const { headerIdx: globalHeaderIdx } = findHeaderAndScore(rows);
      
      const findRow = (startIdx, kw1, kw2) => {
        const idx = rows.slice(startIdx).findIndex(r =>
          r && r.some(c => String(c ?? '').toLowerCase().includes(kw1.toLowerCase())) &&
          (!kw2 || r.some(c => String(c ?? '').toLowerCase().includes(kw2.toLowerCase())))
        );
        return idx > -1 ? startIdx + idx : -1;
      };
      
      const findRowSingle = (startIdx, kw) => {
        const idx = rows.slice(startIdx).findIndex(r =>
          r && String(r[0] ?? '').trim().toLowerCase().startsWith(kw.toLowerCase())
        );
        return idx > -1 ? startIdx + idx : -1;
      };

      const deliveredHeaderIdx = findRow(globalHeaderIdx, 'Code Barres', 'TTC');
      if (deliveredHeaderIdx === -1) throw new Error('لم يتم العثور على جدول التسليم في ملف Logista');
      const deliveredEndIdx = findRowSingle(deliveredHeaderIdx, 'total liv');
      
      const isDataRow = (r) => {
        if (!r) return false;
        const first = String(r[0] ?? '').trim();
        return first !== '' && !first.toLowerCase().startsWith('total') && first.toLowerCase() !== 'code barres' && /\d/.test(first);
      };
      
      const deliveredData = rows
        .slice(deliveredHeaderIdx + 1, deliveredEndIdx > -1 ? deliveredEndIdx : undefined)
        .filter(isDataRow);

      let returnHeaderIdx = findRow(deliveredEndIdx > -1 ? deliveredEndIdx : deliveredHeaderIdx, 'Code Barres', 'frais ret');
      if (returnHeaderIdx === -1 && deliveredEndIdx > -1) {
        const relIdx = rows.slice(deliveredEndIdx).findIndex(r => r && r.some(c => String(c ?? '').toLowerCase().includes('code barres')));
        if (relIdx > -1) returnHeaderIdx = deliveredEndIdx + relIdx;
      }
      const returnEndIdx = returnHeaderIdx > -1 ? findRowSingle(returnHeaderIdx, 'total ret') : -1;
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
      
      const duplicateNids = [];
      const seenNids = new Set();
      
      const processRow = (row, isDelivered) => {
          const barcode = String(row[0] ?? '').trim();
          if (barcode) {
             const norm = normalizeId(barcode);
             if (seenNids.has(norm)) { duplicateNids.push(barcode); return null; }
             seenNids.add(norm);
          }
          
          let ttcStr = String(row[8] ?? '');
          let ttcObj = parseMoney(ttcStr);
          if (ttcObj.bad || ttcObj.value === 0) {
             ttcObj = parseMoney(String(row[9] ?? ''));
          }
          let phone = (isDelivered && delPhoneIdx > -1) ? String(row[delPhoneIdx] ?? '').trim() :
                      (!isDelivered && retPhoneIdx > -1) ? String(row[retPhoneIdx] ?? '').trim() : '';
          
          return {
            id: crypto.randomUUID(),
            barcode: barcode,
            productName: String(row[2] ?? '—').trim() || '—',
            phone: phone,
            totalSales: isDelivered ? ttcObj.value : 0,
            status: isDelivered ? 'delivered' : 'returned',
            carrier_fee: null,
            rule_fee: 0,
            fee_delta: null,
            moneyParseError: isDelivered ? ttcObj.bad : false,
            city: ''
          };
      };

      const parsedDelivered = deliveredData.map(r => processRow(r, true)).filter(Boolean);
      const parsedReturned = returnData.map(r => processRow(r, false)).filter(Boolean);

      let deliveryFee = 0;
      if (deliveredData.length > 0) {
        deliveryFee = parseMoney(deliveredData[0][10]).value;
      }
      let returnFee = 0;
      if (returnData.length > 0) {
        returnFee = parseMoney(returnData[0][10]).value;
      }

      return {
        rows: [...parsedDelivered, ...parsedReturned],
        autoFees: (deliveryFee || returnFee) ? { delivery: deliveryFee, return: returnFee } : null,
        duplicateNids: [...new Set(duplicateNids)]
      };
    }

    function parseIntigo(rows) {
      const { headerIdx } = findHeaderAndScore(rows);
      const header = rows[headerIdx];
      const data = rows.slice(headerIdx + 1);
      
      const h = header.map(c => String(c ?? '').trim().toLowerCase());
      
      const get = (row, colSubstring) => {
        const idx = h.findIndex(x => x === colSubstring || x.includes(colSubstring));
        return idx > -1 ? row[idx] : undefined;
      };
      
      const duplicateNids = [];
      const seenNids = new Set();
      const unrecognizedList = [];
      
      const parsed = data
        .map(row => {
          const state = String(get(row, 'statut') ?? '').trim();
          const norm = state.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
          
          let bucket = statusBucket(state);
          if (bucket === 'in_progress' && statusBucket(norm) !== 'in_progress') {
             bucket = statusBucket(norm);
          }
          
          if (bucket === 'in_progress') {
             if (norm.includes('livre') || norm.includes('livré') || norm.includes('delivered') || norm.includes('تم التسليم') || norm.includes('مسلم')) {
                bucket = 'delivered';
             } else if ((norm.includes('retour') || norm.includes('returned') || norm.includes('مرتجع') || norm.includes('مسترجع')) && 
                        !['en cours', 'cours', 'préparation', 'preparation', 'prêt', 'pret', 'transfert retour', '3201', '6000', '6001'].some(sub => norm.includes(sub))) {
                bucket = 'returned';
             } else if (norm.includes('annul') || norm.includes('cancelled') || norm.includes('ملغ')) {
                bucket = 'cancelled';
             } else if (norm.includes('échange') || norm.includes('echange') || norm.includes('exchange') || norm.includes('تبادل') || norm.includes('6500')) {
                bucket = 'exchange';
             } else if (/^\d+$/.test(state)) {
                bucket = 'in_progress';
             } else {
                bucket = 'unrecognized';
                unrecognizedList.push(state);
             }
          }
          
          let phone = '';
          const phoneIdx = h.findIndex(x => x.includes('téléphone') || x.includes('telephone') || x === 'tel' || x.includes('phone'));
          if (phoneIdx > -1) {
            phone = String(row[phoneIdx] ?? '').trim();
          }
          
          const nid = String(get(row, 'nid') ?? '').trim();
          if (nid) {
             const norm = normalizeId(nid);
             if (seenNids.has(norm)) { duplicateNids.push(nid); return null; }
             seenNids.add(norm);
          }
          
          let priceObj = parseMoney(get(row, 'prix cod'));
          let carrierFeeObj = parseMoney(get(row, 'frais'));
          let carrier_fee = get(row, 'frais') !== undefined ? carrierFeeObj.value : null;

          return {
            id: crypto.randomUUID(),
            nid: nid,
            city: String(get(row, 'ville') ?? '').trim(),
            productName: 'جاري التحميل...',
            phone: phone,
            totalSales: bucket === 'delivered' ? priceObj.value : 0,
            status: bucket,
            carrier: 'INTIGO',
            needsEnrichment: true,
            carrier_fee: carrier_fee,
            rule_fee: 0,
            fee_delta: null,
            moneyParseError: priceObj.bad || carrierFeeObj.bad,
            originalStatusText: state
          };
        }).filter(Boolean);
        
      return { rows: parsed, autoFees: null, isIntigo: true, duplicateNids: [...new Set(duplicateNids)] };
    }
const APP_VERSION = 'v1.0';
const CACHE_KEY_PREFIX = 'intigo_nid_';
const isValidName = (name) => {
         if (!name || typeof name !== 'string') return false;
         const t = name.replace(/^\[GENERATED_NAME\]\s*/i, '').trim().toLowerCase();
         if (!t) return false;
         const invalid = ["منتج بدون اسم","منتج غير معروف","بدون اسم","غير معروف","unknown","n/a","na","-","—","colis"];
         return !invalid.includes(t);
      }
const getCachedName = (nid) => {
        try {
           const val = localStorage.getItem(CACHE_KEY_PREFIX + nid);
           if (val) {
              const obj = JSON.parse(val);
              if (obj && Date.now() - obj.fetchedAt < 7 * 24 * 60 * 60 * 1000) {
                 if (isValidName(obj.description)) return obj;
                 else localStorage.removeItem(CACHE_KEY_PREFIX + nid);
              }
           }
        } catch (e) {}
        return null;
      }
const setCachedName = (nid, data) => {
         if (!isValidName(data.description)) return;
         try {
            localStorage.setItem(CACHE_KEY_PREFIX + nid, JSON.stringify({ ...data, fetchedAt: Date.now() }));
         } catch(e) {}
      }
const calculateStats = (rows, fees) => {
        let totalSales = 0;
        let totalRuleFeeDelivery = 0;
        let totalRuleFeeReturn = 0;
        let totalCarrierFee = 0;
        let hasCarrierFee = false;
        
        let prepaidCount = 0;
        let counts = { delivered: 0, returned: 0, in_progress: 0, cancelled: 0, exchange: 0 };
        
        const newUnknownGovs = [];

        rows.forEach(row => {
          if (counts[row.status] !== undefined) counts[row.status]++;
          
          if (row.carrier_fee != null) {
            hasCarrierFee = true;
            totalCarrierFee += row.carrier_fee;
          }
          
          if (row.status === 'delivered') {
             if (row.totalSales === 0) prepaidCount++;
             totalSales += row.totalSales;
             
             let rf = (row.carrier === 'INTIGO') ? 7 : (fees.delivery || 0);
             row.rule_fee = rf;
             totalRuleFeeDelivery += rf;
          } else if (row.status === 'returned') {
             let rf = fees.return || 0;
             if (row.carrier === 'INTIGO') {
                const govInfo = resolveGov(row.city);
                rf = govInfo.isGrandTunis ? 1 : 2;
                if (govInfo.unknown) newUnknownGovs.push(govInfo.raw);
             }
             row.rule_fee = rf;
             totalRuleFeeReturn += rf;
          } else {
             row.rule_fee = 0;
          }
          
          if (row.carrier_fee != null) {
             row.fee_delta = round3(row.carrier_fee - row.rule_fee);
          }
        });
        
        const netRule = totalSales - totalRuleFeeDelivery - totalRuleFeeReturn;
        const netCarrier = hasCarrierFee ? (totalSales - totalCarrierFee) : null;
        
        return { 
           totalSales: round3(totalSales), 
           totalRuleFeeDelivery: round3(totalRuleFeeDelivery), 
           totalRuleFeeReturn: round3(totalRuleFeeReturn), 
           netRule: round3(netRule), 
           netCarrier: hasCarrierFee ? round3(netCarrier) : null,
           hasCarrierFee,
           count: rows.length,
           counts,
           prepaidCount,
           newUnknownGovs: [...new Set(newUnknownGovs)]
        };
      }

const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId, callbacks) => {
        const { setIsEnriching, setEnrichProgress, setError, setHealthStatus, onBatchResolved, checkIsCancelled } = callbacks;
        setIsEnriching(true);
        progressStore.set({ current: 0, total: 0, errors: 0 });
        
        let current = 0;
        let errors = 0;
        let updatedRowsPart = [];
        let isFirstSuccess = true;
        let throttleDelay = 30;
        
        
        
        for (let i = 0; i < rowsToEnrich.length; i++) {
          if (checkIsCancelled()) break;
          
          const row = { ...rowsToEnrich[i] };
          if (!row.needsEnrichment) continue;
          
          let success = false;
          let name = 'منتج غير معروف';
          let phoneToSet = '';
          
          if (false) {} else {
             const cached = getCachedName(row.nid);
             if (cached) {
                name = cached.description;
                phoneToSet = cached.phone || '';
                success = true;
             }
          }
          
          if (!success) {
              await new Promise(r => setTimeout(r, throttleDelay));
              
              let retries = 3;
              while (retries > 0 && !success) {
                if (checkIsCancelled()) break;
                try {
                  const res = await fetch(`https://api.intigo.net/api/v3/parcels/${encodeURIComponent(row.nid)}`, {
                    headers: { 'X-API-Key': apiKey }
                  });
                  
                  if (res.status === 401) {
                    setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                    setHealthStatus('unauthorized');
                    row.enrichState = 'error';
                    name = 'مفتاح API غير صالح';
                    row.hasError = true;
                    row.needsEnrichment = true;
                    row.productName = name;
                    
                    const batch = [...updatedRowsPart, row];
                    
                    // also mark any remaining rows in rowsToEnrich as error
                    for (let j = i + 1; j < rowsToEnrich.length; j++) {
                       const rem = { ...rowsToEnrich[j], enrichState: 'error', hasError: true, needsEnrichment: true, productName: 'توقف بسبب خطأ في المفتاح' };
                       batch.push(rem);
                    }

                    onBatchResolved(batch);
                    progressStore.set({ current, total: rowsToEnrich.length, errors });
                    setIsEnriching(false);
                    return;
                  }
                  if (res.status === 429 || res.status >= 500) {
                     throttleDelay = Math.min(throttleDelay * 2, 2000);
                     throw new Error(`Rate ${res.status}`);
                  }
                  
                  if (res.status === 404) {
                     const fallbackRes = await fetch(`https://api.intigo.net/parcels/${encodeURIComponent(row.nid)}`, {
                        headers: { 'X-API-Key': apiKey }
                     });
                     if (fallbackRes.ok) {
                        // Successfully fetched with fallback
                        const data = await fallbackRes.json();
                        let fn = isValidName(data.description) ? data.description :
                                 isValidName(data.product_name) ? data.product_name :
                                 isValidName(data.name) ? data.name :
                                 isValidName(data.content) ? data.content :
                                 isValidName(data.item_name) ? data.item_name : '';
                        
                        if (fn) {
                           name = typeof fn === 'string' ? fn.replace(/^\[GENERATED_NAME\]\s*/i, '') : fn;
                           row.enrichState = 'done';
                        } else {
                           name = 'بدون اسم (فارغ)';
                           row.enrichState = 'done';
                        }
                        // Update phone if missing
                        if (!row.phone || row.phone.trim() === '') {
                           row.phone = data.phone || data.receiver_phone || data.customer_phone || row.phone;
                        }
                        success = true;
                        break;
                     } else {
                        row.enrichState = 'error';
                        name = 'لم يتم العثور عليه';
                        row.hasError = true;
                        success = true;
                        break;
                     }
                  } else if (res.ok) {
                    const jsonData = await res.json();
                    const parcelData = jsonData.data || jsonData.parcel || jsonData.result || jsonData;
                    const _rawName = parcelData.description || parcelData.product_name || parcelData.name || parcelData.content || parcelData.item_name || '';
const productName = typeof _rawName === 'string' ? _rawName.replace(/^\[GENERATED_NAME\]\s*/i, '') : null;
                    const fetchedPhone = parcelData.client_phone || parcelData.customer_phone || parcelData.phone || parcelData.receiver_phone || parcelData.telephone || '';
                    
                    if (isFirstSuccess) {
                      console.log('🔍 Intigo API Debug - First Response Structure:', jsonData);
                      console.log('🔍 Intigo API Debug - Extracted Product Name:', productName);
                      isFirstSuccess = false;
                    }
                    
                    if (isValidName(productName)) {
                       name = productName.trim();
                       phoneToSet = fetchedPhone;
                       success = true;
                       row.enrichState = 'fetched';
                       setCachedName(row.nid, { description: name, phone: fetchedPhone });
                    } else {
                       row.enrichState = 'error';
                       name = 'خطأ في الجلب';
                       success = false;
                       errors++;
                    }
                    throttleDelay = Math.max(30, throttleDelay * 0.9);
                    break;
                  } else {
                    throw new Error(`Status ${res.status}`);
                  }
                } catch (err) {
                  retries--;
                  if (retries === 0) {
                    errors++;
                    row.enrichState = 'error';
                    name = 'خطأ في الجلب';
                  } else {
                    await new Promise(r => setTimeout(r, Math.max(500, throttleDelay)));
                  }
                }
              }
          }
          
          if (success && !row.enrichState) {
             row.enrichState = 'fetched';
          }
          if (!success && !row.enrichState) {
             row.enrichState = 'error';
          }
          
          row.hasError = row.enrichState === 'error';
          row.needsEnrichment = row.enrichState === 'error' || row.enrichState === 'not_found';
          row.productName = name;
          if (!row.phone && phoneToSet) row.phone = phoneToSet;
          
          updatedRowsPart.push(row);
          current++;
          
          if (updatedRowsPart.length >= 10 || current === rowsToEnrich.length) {
            const batch = [...updatedRowsPart];
            
            onBatchResolved(batch);
            
            updatedRowsPart = [];
            progressStore.set({ current, total: rowsToEnrich.length, errors });
          }
        }
        
        if (uploadId === currentUploadId.current) {
           setIsEnriching(false);
        }
      }

const progressStore = {
  listeners: new Set(),
  state: { current: 0, total: 0, errors: 0 },
  emit() { this.listeners.forEach(l => l()); },
  subscribe(l) { this.listeners.add(l); return () => this.listeners.delete(l); },
  set(state) { this.state = state; this.emit(); },
  get() { return this.state; }
};

async function checkHealth(key, setHealthStatus) {

        if (!key) { setHealthStatus('unauthorized'); return; }
        setHealthStatus('checking');
        try {
           let res = await fetch('https://api.intigo.net/api/v3/health', { headers: { 'X-API-Key': key } });
           if (res.status === 401) {
              setHealthStatus('unauthorized');
              return;
           }
           if (res.ok) {
              setHealthStatus('connected');
              return;
           }
           if (res.status === 404) {
              res = await fetch('https://api.intigo.net/health', { headers: { 'X-API-Key': key } });
              if (res.ok) {
                 setHealthStatus('connected');
                 return;
              }
              if (res.status === 404) {
                 setHealthStatus('endpoint_unknown');
                 return;
              }
           }
           setHealthStatus('offline');
        } catch (e) {
           setHealthStatus('offline');
        }
      
}
