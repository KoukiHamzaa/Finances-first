const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_app = `    function App() {`;
const r_app = `    const APP_VERSION = 'v1.0';
    function App() {`;

html = html.replace(s_app, r_app);

const s_commandBar = `<h1 className="text-xl md:text-2xl font-black tracking-tight text-ink">المصالحة المالية</h1>`;
const r_commandBar = `<div className="flex items-center gap-2"><h1 className="text-xl md:text-2xl font-black tracking-tight text-ink">المصالحة المالية</h1><span className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full">{APP_VERSION}</span></div>`;

html = html.replace(s_commandBar, r_commandBar);
fs.writeFileSync('index.html', html);
console.log("APP_VERSION patched");
