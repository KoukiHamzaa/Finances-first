import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_move_direct = """      const moveSelectedDirectly = (row, targetZone) => {
        // Remove from all
        setMasterRows(prev => prev.filter(r => r.id !== row.id));
        setCakadoRows(prev => prev.filter(r => r.id !== row.id));
        setBalkisRows(prev => prev.filter(r => r.id !== row.id));
        
        // Add to target
        if (targetZone === 'master') setMasterRows(prev => [row, ...prev]);
        if (targetZone === 'cakado') setCakadoRows(prev => [row, ...prev]);
        if (targetZone === 'balkis') setBalkisRows(prev => [row, ...prev]);
      };"""

new_move_direct = """      const moveSelectedDirectly = useCallback((row, targetZone) => {
        // Remove from all
        setMasterRows(prev => prev.filter(r => r.id !== row.id));
        setCakadoRows(prev => prev.filter(r => r.id !== row.id));
        setBalkisRows(prev => prev.filter(r => r.id !== row.id));
        
        // Add to target
        if (targetZone === 'master') setMasterRows(prev => [row, ...prev]);
        if (targetZone === 'cakado') setCakadoRows(prev => [row, ...prev]);
        if (targetZone === 'balkis') setBalkisRows(prev => [row, ...prev]);
      }, []);"""

html = html.replace(old_move_direct, new_move_direct)

old_retry = """      const handleRetryEnrichment = (e, row) => {
        e.stopPropagation();
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current, {
           onProgress: (current, total, errors) => setEnrichProgress({ current, total, errors }),
           onUpdate: (updatedRow) => {
              setMasterRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
              setCakadoRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
              setBalkisRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
           },
           onFinish: () => {}
        });
      };"""

new_retry = """      const handleRetryEnrichment = useCallback((e, row) => {
        e.stopPropagation();
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current, {
           onProgress: (current, total, errors) => setEnrichProgress({ current, total, errors }),
           onUpdate: (updatedRow) => {
              setMasterRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
              setCakadoRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
              setBalkisRows(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
           },
           onFinish: () => {}
        });
      }, [intigoApiKey]);"""

html = html.replace(old_retry, new_retry)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
