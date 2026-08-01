const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// BrandSummaryCard aria-live
const bscStart = `<div className="pt-4 mt-4 border-t border-line flex flex-col items-start gap-4">
            <div>`;
const bscNew = `<div className="pt-4 mt-4 border-t border-line flex flex-col items-start gap-4" aria-live="polite">
            <div>`;

if (html.includes(bscStart)) {
  html = html.replace(bscStart, bscNew);
}

// Command bar net figures aria-live
const cbStart = `<div className="flex flex-col items-end md:items-center shrink-0">
                    <span className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">صافي الإيرادات / NET</span>
                    <span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums">`;
const cbNew = `<div className="flex flex-col items-end md:items-center shrink-0" aria-live="polite">
                    <span className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">صافي الإيرادات / NET</span>
                    <span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums">`;
if (html.includes(cbStart)) {
  html = html.replace(cbStart, cbNew);
}

// Enrichment progress aria-live
const enrStart = `<div className="w-16 h-1 bg-surface-2 rounded-full overflow-hidden ml-2">`;
const enrNew = `<div className="w-16 h-1 bg-surface-2 rounded-full overflow-hidden ml-2" aria-live="polite" aria-label={\`جاري الجلب: \${enrichProgress.current} من \${enrichProgress.total}\`}>`;
if (html.includes(enrStart)) {
  html = html.replace(enrStart, enrNew);
}

fs.writeFileSync('index.html', html);
console.log("Patch 14 successful");
