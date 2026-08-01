const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const anchor1 = `              for (const p of arr) {
                 if (!p) continue;
                 const n = String(p.nid || p.id || p.tracking || '').trim();
                 if (!n) continue;
                 const productName = p.description || p.product_name || p.name || p.content || p.item_name || 'منتج بدون اسم';
                 const fetchedPhone = p.client_phone || p.customer_phone || p.phone || p.receiver_phone || p.telephone || '';
                 listJoinMap.set(n, { description: productName, phone: fetchedPhone });
              }
           }
        } catch (e) {}`;

const replace1 = `              let loggedList = false;
              for (const p of arr) {
                 if (!p) continue;
                 
                 if (!loggedList) {
                    try {
                       console.log('🔍 Intigo LIST shape:', JSON.stringify(jsonData).slice(0,800));
                       console.log('🔍 Intigo LIST first parcel keys:', Object.keys(p));
                    } catch(e) {}
                    loggedList = true;
                 }
                 
                 const n = String(p.nid || p.id || p.tracking || '').trim();
                 if (!n) continue;
                 const productName = p.description || p.product_name || p.name || p.content || p.item_name || null;
                 const fetchedPhone = p.client_phone || p.customer_phone || p.phone || p.receiver_phone || p.telephone || '';
                 if (isValidName(productName)) {
                    listJoinMap.set(n, { description: productName.trim(), phone: fetchedPhone });
                 }
              }
           }
        } catch (e) {}`;

if (html.includes(anchor1)) {
  html = html.replace(anchor1, replace1);
  fs.writeFileSync('index.html', html);
  console.log("Patch enrich1 successful");
} else {
  console.log("Could not find anchor1");
}
