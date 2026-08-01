const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update parseIntigo
const s_parseIntigo_start = `    function parseIntigo(rows) {
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
          const bucket = statusBucket(state);`;

const r_parseIntigo_start = `    function parseIntigo(rows) {
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
          const norm = state.normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().replace(/\\s+/g, ' ').trim();
          
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
             } else if (/^\\d+$/.test(state)) {
                bucket = 'in_progress';
             } else {
                bucket = 'unrecognized';
                unrecognizedList.push(state);
             }
          }`;

html = html.replace(s_parseIntigo_start, r_parseIntigo_start);

const s_parseIntigo_end = `        }).filter(Boolean);
      
      return { rows: parsed, autoFees: null, isIntigo: true, duplicateNids: [...new Set(duplicateNids)] };
    }`;
const r_parseIntigo_end = `        }).filter(Boolean);
      
      return { 
         rows: parsed, 
         autoFees: null, 
         isIntigo: true, 
         duplicateNids: [...new Set(duplicateNids)],
         unrecognizedStatuses: [...new Set(unrecognizedList)]
      };
    }`;
html = html.replace(s_parseIntigo_end, r_parseIntigo_end);
fs.writeFileSync('index.html', html);
console.log("parseIntigo modified");
