const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_401 = `                  if (res.status === 401) {
                    setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                    setHealthStatus('unauthorized');
                    row.enrichState = 'error';
                    name = 'مفتاح API غير صالح';
                    row.hasError = true;
                    row.needsEnrichment = true;
                    row.productName = name;
                    
                    const batch = [...updatedRowsPart, row];
                    
                    if (zone === 'master') {
                       setMasterRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    } else if (zone === 'cakado') {
                       setCakadoRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    } else if (zone === 'balkis') {
                       setBalkisRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    }
                    
                    setIsEnriching(false);
                    return; // Stop processing entirely on 401
                  }`;
                  
const r_401 = `                  if (res.status === 401) {
                    setHealthStatus('unauthorized');
                    row.enrichState = 'blocked';
                    name = '— (بانتظار المفتاح)';
                    row.hasError = false;
                    row.needsEnrichment = true;
                    row.productName = name;
                    
                    const batch = [...updatedRowsPart, row];
                    
                    if (zone === 'master') {
                       setMasterRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    } else if (zone === 'cakado') {
                       setCakadoRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    } else if (zone === 'balkis') {
                       setBalkisRows(prev => prev.map(r => batch.find(b => b.id === r.id) || r));
                    }
                    
                    setIsEnriching(false);
                    return; // Stop processing entirely on 401
                  }`;

html = html.replace(s_401, r_401);
fs.writeFileSync('index.html', html);
console.log("401 handling patched");
