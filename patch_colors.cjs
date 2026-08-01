const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s5 = `<span className={\`tabular-nums font-mono \${row.fee_delta < 0 ? 'text-neg' : (row.fee_delta > 0 ? 'text-pos' : 'text-ink-soft opacity-60')}\`}>`;
const r5 = `<span className={\`tabular-nums font-mono \${row.fee_delta > 0 ? 'text-neg' : (row.fee_delta < 0 ? 'text-pos' : 'text-ink-soft opacity-60')}\`}>`;

const s6 = `<span className={\`text-lg font-mono font-bold tabular-nums \${stats.netCarrier - stats.netRule < 0 ? 'text-neg' : (stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft')}\`} dir="ltr">`;
const r6 = `<span className={\`text-lg font-mono font-bold tabular-nums \${stats.netCarrier - stats.netRule > 0 ? 'text-neg' : (stats.netCarrier - stats.netRule < 0 ? 'text-pos' : 'text-ink-soft')}\`} dir="ltr">`;

if (html.includes(s5)) {
  html = html.replace(s5, r5);
  console.log("Replaced 5");
} else { console.log("Not found 5"); }

if (html.includes(s6)) {
  html = html.replace(s6, r6);
  console.log("Replaced 6");
} else { console.log("Not found 6"); }

fs.writeFileSync('index.html', html);
