import re

with open('refactored_part3.html', 'r', encoding='utf-8') as f:
    html = f.read()

enrich_callbacks = r"""{
    setIsEnriching,
    setHealthStatus,
    setError,
    checkIsCancelled: () => \3 !== currentUploadId.current,
    onBatchResolved: (batch) => {
        const updateArr = (arr) => arr.map(pr => {
            const updated = batch.find(ur => ur.id === pr.id);
            return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState } : pr;
        });
        setMasterRows(prev => updateArr(prev));
        setCakadoRows(prev => updateArr(prev));
        setBalkisRows(prev => updateArr(prev));
    }
}"""

html = re.sub(r'enrichIntigoRows\(([^,]+),\s*([^,]+),\s*([^,)]+)\);', r'enrichIntigoRows(\1, \2, \3, ' + enrich_callbacks + r');', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

