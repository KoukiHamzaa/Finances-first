const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// The babel script starts at line 163. Let's find it.
const babelStart = html.indexOf('<script type="text/babel">');
const babelContent = html.slice(babelStart);

// Let's dump all functions to a temp file to inspect
fs.writeFileSync('babel_content.js', babelContent);
console.log('Saved babel_content.js');
