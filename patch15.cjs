const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/min-h-\[32px\]/g, "min-h-[44px]");
html = html.replace(`className="text-[11px] text-brand hover:underline flex items-center gap-1"`, `className="text-[11px] text-brand hover:underline flex items-center gap-1 min-h-[44px] px-2"`);

// Banner dismiss button tap target
html = html.replace(`className="absolute left-3 top-3 opacity-60 hover:opacity-100 p-1"`, `className="absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center"`);

fs.writeFileSync('index.html', html);
console.log("Patch 15 successful");
