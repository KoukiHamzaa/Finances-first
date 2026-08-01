const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const cbStart2 = `<span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums">
                      <AnimatedNumber value={netTotalRevenue} />
                    </span>`;
const cbNew2 = `<span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums" dir="ltr">
                      <AnimatedNumber value={netTotalRevenue} />
                    </span>`;
                    
if (html.includes(cbStart2)) {
  html = html.replace(cbStart2, cbNew2);
  fs.writeFileSync('index.html', html);
  console.log("Patch 20 successful");
}
