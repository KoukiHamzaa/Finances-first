import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_drag = """      const handleDragStart = (e, id) => {
        if (!selectedIds.has(id)) {
           setSelectedIds(new Set([id]));
        }
        e.dataTransfer.setData('text/plain', 'move');
        e.dataTransfer.effectAllowed = 'move';
      };"""

new_drag = """      const handleDragStart = useCallback((e, id) => {
        setSelectedIds(prev => {
          if (!prev.has(id)) return new Set([id]);
          return prev;
        });
        e.dataTransfer.setData('text/plain', 'move');
        e.dataTransfer.effectAllowed = 'move';
      }, []);"""

html = html.replace(old_drag, new_drag)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
