const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const normId = "const normalizeId = (raw) => String(raw ?? '').trim().replace(/\\s+/g,' ').toLowerCase();\n    const normalizeCity =";
html = html.replace('const normalizeCity =', normId);

html = html.replace('const norm = normalizeCity(row.barcode); // Just simple normalize', 'const norm = normalizeId(row.barcode); // Just simple normalize');
html = html.replace('const norm = normalizeCity(barcode);', 'const norm = normalizeId(barcode);');
html = html.replace('const norm = normalizeCity(nid);', 'const norm = normalizeId(nid);');

fs.writeFileSync('index.html', html);
console.log("NID normalization modified");
