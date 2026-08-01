const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const anchor = `<div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto">
                    <span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'error' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}\`} title={healthStatus === 'connected' ? 'متصل' : healthStatus === 'error' ? 'غير متصل' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>`;
const replace = `<div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto">
                    <button onClick={handleClearCache} className="shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold" aria-label="مسح ذاكرة المنتجات" title="مسح ذاكرة المنتجات وتحديث الأسماء">مسح ذاكرة المنتجات</button>
                    <span className={\`shrink-0 w-2.5 h-2.5 rounded-full mx-1 \${healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'error' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}\`} title={healthStatus === 'connected' ? 'متصل' : healthStatus === 'error' ? 'غير متصل' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>`;

if (html.includes(anchor)) {
  html = html.replace(anchor, replace);
  console.log("Replaced cache button");
} else { console.log("Not found cache button"); }

fs.writeFileSync('index.html', html);
