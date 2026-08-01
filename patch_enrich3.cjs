const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s1 = `                  if (res.status === 404) {
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
                  }`;

const r1 = `                  if (res.status === 404) {
                    row.enrichState = 'not_found';
                    name = 'لم يُعثر عليه';
                    success = true;
                    break;
                  } else if (res.ok) {
                    const jsonData = await res.json();
                    const parcelData = jsonData.data || jsonData.parcel || jsonData.result || jsonData;
                    const productName = parcelData.description || parcelData.product_name || parcelData.name || parcelData.content || parcelData.item_name || null;
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
                    throw new Error(\`Status \${res.status}\`);
                  }`;

if (html.includes(s1)) {
  html = html.replace(s1, r1);
  console.log("Replaced 1");
} else { console.log("Not found 1"); }

const s2 = `                } catch (err) {
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
          }`;

const r2 = `                } catch (err) {
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
          if (!row.phone && phoneToSet) row.phone = phoneToSet;`;

if (html.includes(s2)) {
  html = html.replace(s2, r2);
  console.log("Replaced 2");
} else { console.log("Not found 2"); }

fs.writeFileSync('index.html', html);
