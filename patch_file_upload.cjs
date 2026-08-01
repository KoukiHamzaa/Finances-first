const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s = `            if (result.isIntigo) {
              if (!intigoApiKey) {
                setError('تنبيه: يرجى إدخال مفتاح Intigo API في الأعلى لجلب أسماء المنتجات، تمت إضافة الطلبات بدون أسماء.');
              } else {
                enrichIntigoRows(result.rows, intigoApiKey, thisUploadId);
              }
            }`;

const r = `            if (result.isIntigo) {
              if (!intigoApiKey || !intigoApiKey.trim()) {
                setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
                const blockedRows = result.rows.map(r => ({ ...r, enrichState: 'blocked', productName: '— (بانتظار المفتاح)', needsEnrichment: true, hasError: false }));
                setMasterRows(blockedRows);
              } else {
                const pendingRows = result.rows.map(r => ({ ...r, enrichState: 'pending', needsEnrichment: true, hasError: false, productName: 'جاري الجلب...' }));
                setMasterRows(pendingRows);
                enrichIntigoRows(pendingRows, intigoApiKey, thisUploadId);
              }
            }`;

if (html.includes(s)) {
  html = html.replace(s, r);
  console.log("Replaced file upload block");
} else { console.log("Not found file upload block"); }

// Also fix handleRetryEnrichment
const sRetry = `      const handleRetryEnrichment = (e, row) => {
        e.stopPropagation();
        if (!intigoApiKey) {
          setError('الرجاء إدخال مفتاح API أولاً');
          return;
        }
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current);
      };`;

const rRetry = `      const handleRetryEnrichment = (e, row) => {
        e.stopPropagation();
        if (!intigoApiKey || !intigoApiKey.trim()) {
          setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
          return;
        }
        
        const updateArr = (arr) => arr.map(r => r.id === row.id ? { ...r, enrichState: 'pending', productName: 'جاري الجلب...', hasError: false, needsEnrichment: true } : r);
        setMasterRows(prev => updateArr(prev));
        setCakadoRows(prev => updateArr(prev));
        setBalkisRows(prev => updateArr(prev));

        enrichIntigoRows([{ ...row, needsEnrichment: true }], intigoApiKey, currentUploadId.current);
      };`;

if (html.includes(sRetry)) {
  html = html.replace(sRetry, rRetry);
  console.log("Replaced handleRetry");
} else { console.log("Not found handleRetry"); }

fs.writeFileSync('index.html', html);
