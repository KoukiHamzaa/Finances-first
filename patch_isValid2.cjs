const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_valid = `      const isValidName = (name) => {
         if (!name || typeof name !== 'string') return false;
         const t = name.trim().toLowerCase();
         if (!t) return false;`;
         
const r_valid = `      const isValidName = (name) => {
         if (!name || typeof name !== 'string') return false;
         const t = name.replace(/^\\[GENERATED_NAME\\]\\s*/i, '').trim().toLowerCase();
         if (!t) return false;`;

html = html.replace(s_valid, r_valid);
fs.writeFileSync('index.html', html);
console.log("isValidName patched 2");
