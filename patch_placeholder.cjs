const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s = `placeholder="مفتاح Intigo"`;
const r = `placeholder="ألصق مفتاح Intigo API هنا"`;

if (html.includes(s)) {
  html = html.replace(s, r);
  console.log("Replaced placeholder");
} else { console.log("Not found placeholder"); }

fs.writeFileSync('index.html', html);
