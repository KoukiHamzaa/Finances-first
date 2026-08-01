const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_upload = `            if (result.duplicateNids && result.duplicateNids.length > 0) {
               setDuplicateNids(result.duplicateNids);
            }`;
const r_upload = `            if (result.duplicateNids && result.duplicateNids.length > 0) {
               setDuplicateNids(result.duplicateNids);
            }
            if (result.unrecognizedStatuses && result.unrecognizedStatuses.length > 0) {
               setUnrecognizedStatuses(result.unrecognizedStatuses);
            }`;
html = html.replace(s_upload, r_upload);
fs.writeFileSync('index.html', html);
console.log("fileUpload modified");
