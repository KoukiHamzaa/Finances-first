const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_name1 = `const productName = parcelData.description || parcelData.product_name || parcelData.name || parcelData.content || parcelData.item_name || null;`;
const r_name1 = `const _rawName = parcelData.description || parcelData.product_name || parcelData.name || parcelData.content || parcelData.item_name || '';
const productName = typeof _rawName === 'string' ? _rawName.replace(/^\\[GENERATED_NAME\\]\\s*/i, '') : null;`;

html = html.replace(s_name1, r_name1);

const s_name2 = `let fn = isValidName(data.description) ? data.description :
                                 isValidName(data.product_name) ? data.product_name :
                                 isValidName(data.name) ? data.name :
                                 isValidName(data.content) ? data.content :
                                 isValidName(data.item_name) ? data.item_name : '';
                        
                        if (fn) {
                           name = fn;`;
                           
const r_name2 = `let fn = isValidName(data.description) ? data.description :
                                 isValidName(data.product_name) ? data.product_name :
                                 isValidName(data.name) ? data.name :
                                 isValidName(data.content) ? data.content :
                                 isValidName(data.item_name) ? data.item_name : '';
                        
                        if (fn) {
                           name = typeof fn === 'string' ? fn.replace(/^\\[GENERATED_NAME\\]\\s*/i, '') : fn;`;
html = html.replace(s_name2, r_name2);

const s_name3 = `const productName = p.description || p.product_name || p.name || p.content || p.item_name || null;`;
const r_name3 = `const _rn = p.description || p.product_name || p.name || p.content || p.item_name || '';
const productName = typeof _rn === 'string' ? _rn.replace(/^\\[GENERATED_NAME\\]\\s*/i, '') : null;`;
html = html.replace(s_name3, r_name3);

fs.writeFileSync('index.html', html);
console.log("Stripped GENERATED_NAME");
