const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const anchor2 = `          if (listJoinMap.has(row.nid)) {
             const m = listJoinMap.get(row.nid);
             name = (m.description && m.description.trim() !== '') ? m.description : 'منتج بدون اسم';
             phoneToSet = m.phone;
             success = true;
          } else {
             const cached = getCachedName(row.nid);
             if (cached) {
                name = cached.description || 'منتج بدون اسم';
                phoneToSet = cached.phone || '';
                success = true;
             }
          }`;

const replace2 = `          if (listJoinMap.has(row.nid)) {
             const m = listJoinMap.get(row.nid);
             name = m.description;
             phoneToSet = m.phone;
             success = true;
          } else {
             const cached = getCachedName(row.nid);
             if (cached) {
                name = cached.description;
                phoneToSet = cached.phone || '';
                success = true;
             }
          }`;

if (html.includes(anchor2)) {
  html = html.replace(anchor2, replace2);
  fs.writeFileSync('index.html', html);
  console.log("Patch enrich2 successful");
} else {
  console.log("Could not find anchor2");
}
