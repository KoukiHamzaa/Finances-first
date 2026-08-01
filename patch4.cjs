const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const enrichStart = "      const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId) => {";
const enrichEndStr = `        if (uploadId === currentUploadId.current) {
           setIsEnriching(false);
        }
      };`;

const newEnrich = `      const CACHE_KEY_PREFIX = 'intigo_nid_';
      const getCachedName = (nid) => {
        try {
           const val = localStorage.getItem(CACHE_KEY_PREFIX + nid);
           if (val) {
              const obj = JSON.parse(val);
              if (obj && Date.now() - obj.fetchedAt < 7 * 24 * 60 * 60 * 1000) return obj;
           }
        } catch (e) {}
        return null;
      };
      
      const setCachedName = (nid, data) => {
         try {
            localStorage.setItem(CACHE_KEY_PREFIX + nid, JSON.stringify({ ...data, fetchedAt: Date.now() }));
         } catch(e) {}
      };

      const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId) => {
        setIsEnriching(true);
        setEnrichProgress({ current: 0, total: rowsToEnrich.length, errors: 0 });
        
        let current = 0;
        let errors = 0;
        let updatedRowsPart = [];
        let isFirstSuccess = true;
        let throttleDelay = 30;
        
        const listJoinMap = new Map();
        try {
           const res = await fetch(\`https://api.intigo.net/api/v3/parcels/\`, { headers: { 'X-API-Key': apiKey }});
           if (res.ok) {
              const jsonData = await res.json();
              let arr = jsonData.data || jsonData.parcels || jsonData.result || [];
              if (!Array.isArray(arr)) arr = [arr];
              for (const p of arr) {
                 if (!p) continue;
                 const n = String(p.nid || p.id || p.tracking || '').trim();
                 if (!n) continue;
                 const productName = p.description || p.product_name || p.name || p.content || p.item_name || 'منتج بدون اسم';
                 const fetchedPhone = p.client_phone || p.customer_phone || p.phone || p.receiver_phone || p.telephone || '';
                 listJoinMap.set(n, { description: productName, phone: fetchedPhone });
              }
           }
        } catch (e) {}
        
        for (let i = 0; i < rowsToEnrich.length; i++) {
          if (uploadId !== currentUploadId.current) break;
          
          const row = { ...rowsToEnrich[i] };
          if (!row.needsEnrichment) continue;
          
          let success = false;
          let name = 'منتج غير معروف';
          let phoneToSet = '';
          
          if (listJoinMap.has(row.nid)) {
             const m = listJoinMap.get(row.nid);
             name = (m.description && m.description.trim() !== '') ? m.description : 'منتج بدون اسم';
             phoneToSet = m.phone;
             success = true;
          } else {
             const cached = getCachedName(row.nid);
             if (cached) {
                name = cached.description || 'منتج بدون اسم';
                phoneToSet = cached.phone || '';
                success = true;
             }
          }
          
          if (!success) {
              await new Promise(r => setTimeout(r, throttleDelay));
              
              let retries = 3;
              while (retries > 0 && !success) {
                if (uploadId !== currentUploadId.current) break;
                try {
                  const res = await fetch(\`https://api.intigo.net/api/v3/parcels/\${encodeURIComponent(row.nid)}\`, {
                    headers: { 'X-API-Key': apiKey }
                  });
                  
                  if (res.status === 401) {
                    setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                    setIsEnriching(false);
                    return;
                  }
                  if (res.status === 429 || res.status >= 500) {
                     throttleDelay = Math.min(throttleDelay * 2, 2000);
                     throw new Error(\`Rate \${res.status}\`);
                  }
                  
                  if (res.status === 404) {
                    name = 'منتج غير معروف';
                    success = true;
                    setCachedName(row.nid, { description: name, phone: '' });
                  } else if (res.ok) {
                    const jsonData = await res.json();
                    const parcelData = jsonData.data || jsonData.parcel || jsonData.result || jsonData;
                    const productName = parcelData.description || parcelData.product_name || parcelData.name || parcelData.content || parcelData.item_name || 'منتج بدون اسم';
                    const fetchedPhone = parcelData.client_phone || parcelData.customer_phone || parcelData.phone || parcelData.receiver_phone || parcelData.telephone || '';
                    const finalProductName = (productName && productName.trim() !== '') ? productName : 'منتج بدون اسم';
                    
                    if (isFirstSuccess) {
                      console.log('🔍 Intigo API Debug - First Response Structure:', jsonData);
                      console.log('🔍 Intigo API Debug - Extracted Product Name:', finalProductName);
                      isFirstSuccess = false;
                    }
                    
                    name = finalProductName;
                    phoneToSet = fetchedPhone;
                    success = true;
                    setCachedName(row.nid, { description: name, phone: fetchedPhone });
                    throttleDelay = Math.max(30, throttleDelay * 0.9);
                  } else {
                    throw new Error(\`Status \${res.status}\`);
                  }
                } catch (err) {
                  retries--;
                  if (retries === 0) {
                    errors++;
                    name = 'خطأ في الجلب';
                  } else {
                    await new Promise(r => setTimeout(r, Math.max(500, throttleDelay)));
                  }
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
            if (!row.phone && phoneToSet) row.phone = phoneToSet;
          }
          
          updatedRowsPart.push(row);
          current++;
          
          if (updatedRowsPart.length >= 10 || current === rowsToEnrich.length) {
            const batch = [...updatedRowsPart];
            
            const updateArr = (arr) => arr.map(pr => {
               const updated = batch.find(ur => ur.id === pr.id);
               return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError } : pr;
            });
            
            setMasterRows(prev => updateArr(prev));
            setCakadoRows(prev => updateArr(prev));
            setBalkisRows(prev => updateArr(prev));
            
            updatedRowsPart = [];
            setEnrichProgress({ current, total: rowsToEnrich.length, errors });
          }
        }
        
        if (uploadId === currentUploadId.current) {
           setIsEnriching(false);
        }
      };`;

const s = html.indexOf(enrichStart);
const e = html.indexOf(enrichEndStr, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newEnrich + html.substring(e + enrichEndStr.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 4 successful");
} else {
  console.log("Could not find enrichIntigoRows block");
  process.exit(1);
}
