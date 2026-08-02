const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const rootIdx = html.indexOf('<div id="root" dir="rtl"></div>');
const start2 = html.indexOf('<script type="text/babel">');
const end2 = html.indexOf('</script>', start2);
const plain = html.substring(start2 + 26, end2);
fs.writeFileSync('app.jsx', plain);
