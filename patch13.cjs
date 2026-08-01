const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const derivedViewStart = "          // Apply Filter";
const derivedViewEnd = "          // Apply Sort";

const newDerivedView = `          // Apply Filter
          if (filterStatus === 'delivered') res = res.filter(r => r.status === 'delivered');
          if (filterStatus === 'returned') res = res.filter(r => r.status === 'returned');
          if (filterStatus === 'in_progress') res = res.filter(r => r.status === 'in_progress' || r.status === 'return_in_progress');
          if (filterStatus === 'cancelled') res = res.filter(r => r.status === 'cancelled');
          if (filterStatus === 'error') res = res.filter(r => r.hasError);
          
          // Apply Sort`;

let s = html.indexOf(derivedViewStart);
let e = html.indexOf(derivedViewEnd, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newDerivedView + html.substring(e + derivedViewEnd.length);
  console.log("Patch 13.1 successful");
} else {
  console.log("Could not find derivedView block");
  process.exit(1);
}

const buttonsStart = "{['all', 'delivered', 'returned', 'error'].map(status => {";
const buttonsEnd = "onClick={() => setFilterStatus(status)}";

const newButtons = `{['all', 'delivered', 'returned', 'in_progress', 'cancelled', 'error'].map(status => {
                  const label = status === 'all' ? 'الكل' : status === 'delivered' ? 'مُسلّم' : status === 'returned' ? 'مسترجع' : status === 'in_progress' ? 'قيد التنفيذ' : status === 'cancelled' ? 'ملغي' : '⚠ خطأ';
                  const active = filterStatus === status;
                  return (
                    <button 
                      key={status}
                      aria-pressed={active}
                      onClick={() => setFilterStatus(status)}
                      className={\`focus-visible:ring-2 focus-visible:ring-brand focus:outline-none whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors \${active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2'}\`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>`;

s = html.indexOf(buttonsStart);
e = html.indexOf("</div>", s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newButtons + html.substring(e + 6);
  fs.writeFileSync('index.html', html);
  console.log("Patch 13.2 successful");
} else {
  console.log("Could not find buttons block");
  process.exit(1);
}
