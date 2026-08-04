import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix handleDrop
old_drop = """      const handleDrop = (e, targetZone) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;

        // Locate row across all three arrays
        let row = masterRows.find(r => r.id === id) || 
                  cakadoRows.find(r => r.id === id) || 
                  balkisRows.find(r => r.id === id);

        if (!row) return;

        // Remove from all three simultaneously
        setMasterRows(prev => prev.filter(r => r.id !== id));
        setCakadoRows(prev => prev.filter(r => r.id !== id));
        setBalkisRows(prev => prev.filter(r => r.id !== id));

        // Append to the target zone's array
        if (targetZone === 'master') {
          setMasterRows(prev => [...prev, row]);
        } else if (targetZone === 'cakado') {
          setCakadoRows(prev => [...prev, row]);
        } else if (targetZone === 'balkis') {
          setBalkisRows(prev => [...prev, row]);
        }
      };"""

new_drop = """      const handleDrop = (e, targetZone) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;

        // Locate row across all three arrays
        let row = masterRows.find(r => r.id === id) || 
                  cakadoRows.find(r => r.id === id) || 
                  balkisRows.find(r => r.id === id);

        if (!row) return;

        const updateZone = (prev, zoneName) => {
          const present = prev.some(r => r.id === id);
          if (zoneName === targetZone) return present ? prev : [...prev, row];
          return present ? prev.filter(r => r.id !== id) : prev;
        };

        setMasterRows(prev => updateZone(prev, 'master'));
        setCakadoRows(prev => updateZone(prev, 'cakado'));
        setBalkisRows(prev => updateZone(prev, 'balkis'));
      };"""

html = html.replace(old_drop, new_drop)

# Fix moveSelected
old_move_selected = """      const moveSelected = (targetZone) => {
        const idsToMove = new Set(selectedIds);
        
        // Gather from all first:
        const allRows = [...masterRows, ...cakadoRows, ...balkisRows];
        const movingRows = allRows.filter(r => idsToMove.has(r.id));
        
        setMasterRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'master' ? [...kept, ...movingRows] : kept;
        });
        setCakadoRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'cakado' ? [...kept, ...movingRows] : kept;
        });
        setBalkisRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'balkis' ? [...kept, ...movingRows] : kept;
        });

        setSelectedIds(new Set());
      };"""

new_move_selected = """      const moveSelected = (targetZone) => {
        const idsToMove = new Set(selectedIds);
        if (idsToMove.size === 0) return;
        
        // Gather from all first:
        const allRows = [...masterRows, ...cakadoRows, ...balkisRows];
        const movingRows = allRows.filter(r => idsToMove.has(r.id));
        
        const updateZone = (prev, zoneName) => {
          const affected = zoneName === targetZone || prev.some(r => idsToMove.has(r.id));
          if (!affected) return prev;
          const kept = prev.filter(r => !idsToMove.has(r.id));
          return zoneName === targetZone ? [...kept, ...movingRows] : kept;
        };

        setMasterRows(prev => updateZone(prev, 'master'));
        setCakadoRows(prev => updateZone(prev, 'cakado'));
        setBalkisRows(prev => updateZone(prev, 'balkis'));

        setSelectedIds(new Set());
      };"""

html = html.replace(old_move_selected, new_move_selected)

# Fix moveSelectedDirectly
old_move_direct = """      const moveSelectedDirectly = (row, targetZone) => {
        setMasterRows(prev => prev.filter(r => r.id !== row.id));
        setCakadoRows(prev => prev.filter(r => r.id !== row.id));
        setBalkisRows(prev => prev.filter(r => r.id !== row.id));
        if (targetZone === 'master') setMasterRows(prev => [row, ...prev]);
        if (targetZone === 'cakado') setCakadoRows(prev => [row, ...prev]);
        if (targetZone === 'balkis') setBalkisRows(prev => [row, ...prev]);
      };"""

new_move_direct = """      const moveSelectedDirectly = (row, targetZone) => {
        const setters = { master: setMasterRows, cakado: setCakadoRows, balkis: setBalkisRows };
        Object.entries(setters).forEach(([zoneName, setRows]) => {
          setRows(prev => {
            const present = prev.some(r => r.id === row.id);
            if (zoneName === targetZone) return present ? prev : [row, ...prev];
            return present ? prev.filter(r => r.id !== row.id) : prev;
          });
        });
      };"""

html = html.replace(old_move_direct, new_move_direct)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
