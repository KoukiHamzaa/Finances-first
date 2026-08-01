const babel = require('@babel/core');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script type="text/babel">') + 26;
const scriptEnd = html.lastIndexOf('</script>');
const code = html.slice(scriptStart, scriptEnd);

try {
  babel.transformSync(code, {
    presets: ['@babel/preset-react'],
    filename: 'index.jsx'
  });
  console.log('Babel syntax check passed!');
} catch (e) {
  console.error('Babel syntax check failed:', e.message);
  process.exit(1);
}
