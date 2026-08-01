const fs = require('fs');
const code = fs.readFileSync('babel_content.js', 'utf8');

const appStart = code.indexOf('function App() {');
const appContent = code.slice(appStart);
fs.writeFileSync('app_content.js', appContent);
