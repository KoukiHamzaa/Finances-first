const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const uploadStart = `            setMasterRows(result.rows);
            setActiveCarrier(template);`;

const uploadNew = `            setMasterRows(result.rows);
            setActiveCarrier(template);
            
            if (result.duplicateNids && result.duplicateNids.length > 0) {
               setDuplicateNids(result.duplicateNids);
            }`;

if (html.includes(uploadStart)) {
  html = html.replace(uploadStart, uploadNew);
  fs.writeFileSync('index.html', html);
  console.log("Patch 18 successful");
} else {
  console.log("Could not find upload start");
  process.exit(1);
}
