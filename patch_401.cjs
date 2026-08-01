const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s = `                  if (res.status === 401) {
                    setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                    setIsEnriching(false);
                    return;
                  }`;

const r = `                  if (res.status === 401) {
                    setError('مفتاح API غير صالح. يرجى التحقق من الإعدادات.');
                    setHealthStatus('error');
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

                    const updateArr = (arr) => arr.map(pr => {
                       const updated = batch.find(ur => ur.id === pr.id);
                       return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState } : pr;
                    });
                    
                    setMasterRows(prev => updateArr(prev));
                    setCakadoRows(prev => updateArr(prev));
                    setBalkisRows(prev => updateArr(prev));
                    
                    setEnrichProgress({ current: current + 1, total: rowsToEnrich.length, errors: errors + 1 });
                    setIsEnriching(false);
                    return;
                  }`;

if (html.includes(s)) {
  html = html.replace(s, r);
  console.log("Replaced 401");
} else { console.log("Not found 401"); }

fs.writeFileSync('index.html', html);
