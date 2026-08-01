const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const anchor = "const CACHE_KEY_PREFIX = 'intigo_nid_';";
const replacement = `const CACHE_KEY_PREFIX = 'intigo_nid_';
      
      const isValidName = (name) => {
         if (!name || typeof name !== 'string') return false;
         const t = name.trim().toLowerCase();
         if (!t) return false;
         const invalid = ["منتج بدون اسم","منتج غير معروف","بدون اسم","غير معروف","unknown","n/a","na","-","—"];
         return !invalid.includes(t);
      };

      const handleClearCache = () => {
         const keysToRemove = [];
         for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
               keysToRemove.push(key);
            }
         }
         keysToRemove.forEach(k => localStorage.removeItem(k));
         
         if (activeCarrier === 'INTIGO') {
            if (!intigoApiKey || !intigoApiKey.trim()) {
               setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
               return;
            }
            const updateArr = (arr) => arr.map(r => ({ ...r, needsEnrichment: true, enrichState: 'pending', productName: 'جاري الجلب...' }));
            let allToEnrich = [];
            setMasterRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });
            setCakadoRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });
            setBalkisRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });
            
            setTimeout(() => enrichIntigoRows(allToEnrich, intigoApiKey, currentUploadId.current), 0);
         }
      };`;

html = html.replace(anchor, replacement);
fs.writeFileSync('index.html', html);
console.log("Patch isValid successful");
