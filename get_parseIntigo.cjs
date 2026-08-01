const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('function parseIntigo(rows)');
const end = html.indexOf('function detectTemplate');
console.log(html.slice(start, end));
