const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const getBlock = (html, startMarker, endMarker) => {
    const start = html.indexOf(startMarker);
    if (start === -1) return null;
    const end = html.indexOf(endMarker, start);
    if (end === -1) return null;
    return html.substring(start, end + endMarker.length);
};

console.log("Functions found:");
console.log("parseConverty:", html.includes("const parseConverty ="));
console.log("parseLogista:", html.includes("const parseLogista ="));
console.log("parseIntigo:", html.includes("const parseIntigo ="));
console.log("enrichIntigoRows:", html.includes("const enrichIntigoRows ="));

// Let's print out the start of the App component to see what's inside
const appStart = html.indexOf('const App = () => {');
console.log("App starts at index:", appStart);
const calculateStatsIdx = html.indexOf('const generateBrandStats =');
console.log("generateBrandStats inside App:", calculateStatsIdx > appStart);

