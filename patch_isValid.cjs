const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const s_valid = `const invalid = ["منتج بدون اسم","منتج غير معروف","بدون اسم","غير معروف","unknown","n/a","na","-","—"];`;
const r_valid = `const invalid = ["منتج بدون اسم","منتج غير معروف","بدون اسم","غير معروف","unknown","n/a","na","-","—","colis"];`;
html = html.replace(s_valid, r_valid);
fs.writeFileSync('index.html', html);
console.log("isValidName patched");
