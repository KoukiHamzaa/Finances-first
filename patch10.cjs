const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const dotStart = `<span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${intigoApiKey ? (error ? 'bg-warn animate-pulse' : 'bg-pos') : 'bg-neg'}\`} title={intigoApiKey ? (error ? 'خطأ في الاتصال' : 'متصل') : 'غير متصل'}></span>`;

const dotNew = `<span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'error' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}\`} title={healthStatus === 'connected' ? 'متصل' : healthStatus === 'error' ? 'غير متصل' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>`;

if (html.includes(dotStart)) {
  html = html.replace(dotStart, dotNew);
  fs.writeFileSync('index.html', html);
  console.log("Patch 10 successful");
} else {
  console.log("Could not find health dot block");
  process.exit(1);
}
