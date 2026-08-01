const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const deltaStart = `                            {row.hasError && (
                              <button onClick={(e) => handleRetryEnrichment(e, row)} className="text-[11px] text-brand hover:underline flex items-center gap-1">
                                ⚠ إعادة المحاولة
                              </button>
                            )}
                          </div>`;

const deltaNew = `                            {row.hasError && (
                              <button onClick={(e) => handleRetryEnrichment(e, row)} className="text-[11px] text-brand hover:underline flex items-center gap-1">
                                ⚠ إعادة المحاولة
                              </button>
                            )}
                          </div>
                          
                          {row.carrier_fee != null && (
                            <div className="flex flex-col text-[10px] items-end" dir="ltr">
                               <span className={\`tabular-nums font-mono \${row.fee_delta < 0 ? 'text-neg' : (row.fee_delta > 0 ? 'text-pos' : 'text-ink-soft opacity-60')}\`}>
                                 {row.fee_delta < 0 ? '−' : (row.fee_delta > 0 ? '+' : '')}{formatTND(Math.abs(row.fee_delta))}
                               </span>
                            </div>
                          )}
                          `;

const s = html.indexOf(deltaStart);
if (s > -1) {
  html = html.substring(0, s) + deltaNew + html.substring(s + deltaStart.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 8 successful");
} else {
  console.log("Could not find delta insertion point");
  process.exit(1);
}
