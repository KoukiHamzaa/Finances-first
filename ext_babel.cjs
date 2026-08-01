const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('<script type="text/babel">');
const end = html.lastIndexOf('</script>');
const babelCode = html.substring(start + 26, end);
fs.writeFileSync('app.jsx', babelCode);
