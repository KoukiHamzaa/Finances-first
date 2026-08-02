import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_toggle = """      const toggleSelect = (e, id) => {
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
      };"""

new_toggle = """      const toggleSelect = useCallback((e, id) => {
        e.stopPropagation();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
      }, []);"""

html = html.replace(old_toggle, new_toggle)

old_toggle_all = """      const toggleSelectAll = (rowsToToggle) => {
        const rowIds = rowsToToggle.map(r => r.id);
        const allSelected = rowIds.length > 0 && rowIds.every(id => selectedIds.has(id));
        if (allSelected) {
          const newSet = new Set(selectedIds);
          rowIds.forEach(id => newSet.delete(id));
          setSelectedIds(newSet);
        } else {
          const newSet = new Set(selectedIds);
          rowIds.forEach(id => newSet.add(id));
          setSelectedIds(newSet);
        }
      };"""

new_toggle_all = """      const toggleSelectAll = useCallback((rowsToToggle) => {
        const rowIds = rowsToToggle.map(r => r.id);
        setSelectedIds(prev => {
          const allSelected = rowIds.length > 0 && rowIds.every(id => prev.has(id));
          const newSet = new Set(prev);
          if (allSelected) {
            rowIds.forEach(id => newSet.delete(id));
          } else {
            rowIds.forEach(id => newSet.add(id));
          }
          return newSet;
        });
      }, []);"""

html = html.replace(old_toggle_all, new_toggle_all)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
