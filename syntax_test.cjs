const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<script type="text/babel">') + '<script type="text/babel">'.length;
const end = html.lastIndexOf('</script>');
const scriptContent = html.substring(start, end);

// Stub React
const scriptToRun = `
const React = { useState: ()=>[], useCallback: ()=>{}, useMemo: ()=>{}, useRef: ()=>{}, useEffect: ()=>{} };
const crypto = { randomUUID: ()=>'' };
const XLSX = {};
const ReactDOM = { createRoot: ()=>({ render: ()=>{} }) };
const document = { getElementById: ()=>{} };
` + scriptContent.replace(/<[^>]+>/g, ''); // strip JSX roughly

try {
  // We can't really execute it because of JSX, so we just compile it with babel core if available
  console.log('Skipping real execution since it has JSX. Try babel parse.');
} catch (e) {
  console.error(e);
}
