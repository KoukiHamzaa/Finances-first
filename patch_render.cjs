const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s4 = `                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-[14px] text-ink leading-tight">{row.productName}</span>`;
const r4 = `                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            {row.carrier === 'INTIGO' && (
                               <span className="flex-shrink-0 mt-0.5" title={row.enrichState === 'fetched' ? 'تم جلب الاسم' : row.enrichState === 'blocked' ? 'بانتظار المفتاح' : row.enrichState === 'not_found' ? 'لم يُعثر على المنتج' : row.enrichState === 'error' ? 'فشل الطلب — أعد المحاولة' : 'جاري الجلب...'}>
                                  {row.enrichState === 'fetched' ? <span className="text-pos">✓</span> :
                                   (row.enrichState === 'blocked' || row.enrichState === 'not_found') ? <span className="text-warn">⚠</span> :
                                   row.enrichState === 'error' ? <span className="text-neg">✗</span> :
                                   <span className="text-brand animate-pulse">⏳</span>}
                               </span>
                            )}
                            <span className="font-medium text-[14px] text-ink leading-tight flex flex-wrap items-center gap-1">
                               {row.productName}
                               {row.carrier === 'INTIGO' && String(row.productName).trim().toLowerCase() === 'colis' && (
                                  <span className="text-warn text-[10px] ml-1 flex items-center" title="الوصف افتراضي من Intigo — لم يُحدَّد اسم منتج">⚠</span>
                               )}
                            </span>
                          </div>`;

if (html.includes(s4)) {
  html = html.replace(s4, r4);
  console.log("Replaced 4");
} else { console.log("Not found 4"); }

fs.writeFileSync('index.html', html);
