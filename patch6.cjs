const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const bsStart = "      const BrandSummaryCard = ({ title, stats }) => (";
const bsEnd = "        </div>\n      );";

const bsNew = `      const BrandSummaryCard = ({ title, stats }) => (
        <div className="bg-surface rounded-xl shadow-sm border border-line p-5 flex-1 flex flex-col justify-between surface-highlight transition-all">
          <h3 className="text-lg font-display text-ink mb-4">{title}</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">إجمالي المبيعات</span>
              <span className="font-medium text-ink tabular-nums">{formatTND(stats.totalSales)} د.ت</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">رسوم التوصيل</span>
              <span className="tabular-nums text-neg" dir="ltr">−{formatTND(stats.totalRuleFeeDelivery)} د.ت</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">رسوم الإرجاع</span>
              <span className="tabular-nums text-neg" dir="ltr">−{formatTND(stats.totalRuleFeeReturn)} د.ت</span>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-line flex flex-col items-start gap-4">
            <div>
               <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">صافي وفق القاعدة</span>
               <span className="text-4xl sm:text-5xl font-mono font-extrabold text-ink leading-tight tabular-nums tracking-tight"><AnimatedNumber value={stats.netRule} /></span>
            </div>
            {stats.hasCarrierFee && (
               <div className="w-full flex justify-between bg-surface-2 p-3 rounded-lg border border-line mt-2">
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">صافي وفق الفاتورة</span>
                     <span className="text-lg font-mono font-bold text-ink tabular-nums"><AnimatedNumber value={stats.netCarrier} /></span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">الفرق</span>
                     <span className={\`text-lg font-mono font-bold tabular-nums \${stats.netCarrier - stats.netRule < 0 ? 'text-neg' : (stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft')}\`} dir="ltr">
                        {stats.netCarrier - stats.netRule < 0 ? '−' : (stats.netCarrier - stats.netRule > 0 ? '+' : '')}
                        {formatTND(Math.abs(stats.netCarrier - stats.netRule))}
                     </span>
                  </div>
               </div>
            )}
          </div>
        </div>
      );`;

const s = html.indexOf(bsStart);
const e = html.indexOf(bsEnd, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + bsNew + html.substring(e + bsEnd.length);
  // Also update netTotalRevenue usages to use netRule
  html = html.replace("const netTotalRevenue = cakadoStats.netRevenue + balkisStats.netRevenue;", "const netTotalRevenue = cakadoStats.netRule + balkisStats.netRule;");
  fs.writeFileSync('index.html', html);
  console.log("Patch 6 successful");
} else {
  console.log("Could not find BrandSummaryCard block");
  process.exit(1);
}
