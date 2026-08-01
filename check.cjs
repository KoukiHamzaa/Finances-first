const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('<script type="text/babel">');
const end = html.lastIndexOf('</script>');
const babelCode = html.substring(start + 26, end);

try {
  const acorn = require('acorn');
  // acorn doesn't parse JSX natively, let's use Babel
} catch(e) {}
