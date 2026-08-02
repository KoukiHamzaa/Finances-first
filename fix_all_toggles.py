import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix toggleSelect
old_toggle = """      const toggleSelect = (e, id) => {
console.time('toggleSelect');
        e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
console.timeEnd('toggleSelect');
      };"""

new_toggle = """      const toggleSelect = useCallback((e, id) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
      }, []);"""

html = html.replace(old_toggle, new_toggle)

# Fix handleDragStart
old_drag = """      const handleDragStart = (e, id) => {
        if (!selectedIds.has(id)) {
           setSelectedIds(new Set([id]));
        }
        e.dataTransfer.setData('text/plain', 'move');
        e.dataTransfer.effectAllowed = 'move';
      };"""

new_drag = """      const handleDragStart = useCallback((e, id) => {
        setSelectedIds(prev => {
          if (!prev.has(id)) {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          }
          return prev;
        });
        e.dataTransfer.setData('text/plain', 'move');
        e.dataTransfer.effectAllowed = 'move';
      }, []);"""

html = html.replace(old_drag, new_drag)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
