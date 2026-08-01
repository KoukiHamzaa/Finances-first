const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_status = `<span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'error' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}\`} title={healthStatus === 'connected' ? 'متصل' : healthStatus === 'error' ? 'غير متصل' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>`;

const r_status = `<span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${healthStatus === 'connected' ? 'bg-pos' : (healthStatus === 'offline' || healthStatus === 'endpoint_unknown') ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}\`} title={healthStatus === 'connected' ? 'متصل' : healthStatus === 'offline' ? 'غير متصل' : healthStatus === 'endpoint_unknown' ? 'تعذّر التحقق من الصحة — سيتم التأكد عند أول طلب' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>`;

if (html.includes(s_status)) {
  html = html.replace(s_status, r_status);
  console.log("Replaced health indicator");
} else { console.log("Not found health indicator"); }

fs.writeFileSync('index.html', html);
