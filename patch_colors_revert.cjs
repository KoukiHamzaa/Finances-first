const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s6 = `stats.netCarrier - stats.netRule > 0 ? 'text-neg' : (stats.netCarrier - stats.netRule < 0 ? 'text-pos' : 'text-ink-soft')`;
const r6 = `stats.netCarrier - stats.netRule < 0 ? 'text-neg' : (stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft')`;

if (html.includes(s6)) {
  html = html.replace(s6, r6);
  console.log("Reverted 6");
} else { console.log("Not found 6"); }

fs.writeFileSync('index.html', html);
