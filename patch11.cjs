const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const strToReplace = `<span className="text-sm text-ink-soft">أو انقر لاختيار ملف (.xlsx, .csv)</span>`;
const newStr = `<span className="text-sm text-ink-soft">أو انقر لاختيار ملف (.xlsx, .csv)</span>
                <span className="text-xs text-ink-faint mt-4 bg-surface-2 px-3 py-1.5 rounded-full">الحالات محدّثة حتى تاريخ تصدير الملف — أعد رفع الملف لتحديثها.</span>`;

if (html.includes(strToReplace)) {
  html = html.replace(strToReplace, newStr);
  fs.writeFileSync('index.html', html);
  console.log("Patch 11 successful");
} else {
  console.log("Could not find upload zone");
  process.exit(1);
}
