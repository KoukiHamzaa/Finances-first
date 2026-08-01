
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
