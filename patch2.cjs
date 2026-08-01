const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const replacement = `
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
           const norm = normalizeCity(row.barcode); // Just simple normalize
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
        return first !== '' && !first.toLowerCase().startsWith('total') && first.toLowerCase() !== 'code barres' && /\\d/.test(first);
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
             const norm = normalizeCity(barcode);
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
      
      const parsed = data
        .map(row => {
          const state = String(get(row, 'statut') ?? '').trim();
          const bucket = statusBucket(state);
          
          let phone = '';
          const phoneIdx = h.findIndex(x => x.includes('téléphone') || x.includes('telephone') || x === 'tel' || x.includes('phone'));
          if (phoneIdx > -1) {
            phone = String(row[phoneIdx] ?? '').trim();
          }
          
          const nid = String(get(row, 'nid') ?? '').trim();
          if (nid) {
             const norm = normalizeCity(nid);
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
`;

const detectTemplateStart = "function detectTemplate(rows) {";
const parseIntigoEnd = "return { rows: parsed, autoFees: null, isIntigo: true };\n    }";

const startIndex = html.indexOf(detectTemplateStart);
const endIndex = html.indexOf(parseIntigoEnd) + parseIntigoEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find parsers block");
  process.exit(1);
}

html = html.substring(0, startIndex) + replacement.trim() + html.substring(endIndex);
fs.writeFileSync('index.html', html);
