const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(`className={\`focus-visible:ring-2 focus-visible:ring-brand focus:outline-none whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors \${active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2'}\`}`,
`className={\`focus-visible:ring-2 focus-visible:ring-brand focus:outline-none whitespace-nowrap px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors \${active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2'}\`}`);

fs.writeFileSync('index.html', html);
console.log("Patch 16 successful");
