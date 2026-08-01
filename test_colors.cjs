const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const matches = html.match(/stats\.netCarrier - stats\.netRule [><] 0 \? '[^']+' : \(stats\.netCarrier - stats\.netRule [><] 0 \? '[^']+' : '[^']+'\)/g);
console.log(matches);
