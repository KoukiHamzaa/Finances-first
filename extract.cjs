const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log("parseIntigo function:", html.includes("function parseIntigo"));
console.log("parseIntigo =>:", html.includes("parseIntigo = ("));
console.log("function enrich:", html.includes("async function enrichIntigoRows"));
console.log("App component:", html.includes("function App()"));

