const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_404 = `                  if (res.status === 404) {
                    row.enrichState = 'not_found';
                    name = 'لم يُعثر عليه';
                    success = true;
                    break;
                  } else if (res.ok) {`;
                  
const r_404 = `                  if (res.status === 404) {
                     const fallbackRes = await fetch(\`https://api.intigo.net/parcels/\${encodeURIComponent(row.nid)}\`, {
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
                           name = fn;
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
                  } else if (res.ok) {`;

html = html.replace(s_404, r_404);
fs.writeFileSync('index.html', html);
console.log("404 fallback patched");
