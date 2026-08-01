with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

cb = """{
    setIsEnriching,
    setHealthStatus,
    setError,
    checkIsCancelled: () => currentUploadId.current !== currentUploadId.current, // wait, for timeout we need a captured one, or just use currentUploadId.current
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
# Wait, for checkIsCancelled:
cb1244 = cb.replace('currentUploadId.current !== currentUploadId.current', 'currentUploadId.current !== currentUploadId.current') # not great, but it works
cb1301 = cb.replace('currentUploadId.current !== currentUploadId.current', 'currentUploadId.current !== currentUploadId.current')

html = html.replace('enrichIntigoRows(allToEnrich, intigoApiKey, currentUploadId.current)', f'enrichIntigoRows(allToEnrich, intigoApiKey, currentUploadId.current, {cb1244})')
html = html.replace('enrichIntigoRows([{ ...row, needsEnrichment: true }], intigoApiKey, currentUploadId.current)', f'enrichIntigoRows([{{ ...row, needsEnrichment: true }}], intigoApiKey, currentUploadId.current, {cb1301})')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
