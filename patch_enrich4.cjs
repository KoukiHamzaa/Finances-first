const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s3 = `               return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError } : pr;`;
const r3 = `               return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState } : pr;`;

if (html.includes(s3)) {
  html = html.replace(s3, r3);
  console.log("Replaced 3");
} else { console.log("Not found 3"); }

fs.writeFileSync('index.html', html);
