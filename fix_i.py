import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix RowCard signature
html = html.replace(
    'const RowCard = React.memo(({ row, selectable, selected, onToggle, onDragStart, zone, onMoveDirect, onRetry }) => {',
    'const RowCard = React.memo(({ row, selectable, selected, onToggle, onDragStart, zone, onMoveDirect, onRetry, i = 0 }) => {'
)

# Fix ZoneTable mapping
html = html.replace(
    '{rows.slice(0, visibleCount).map((row) => (',
    '{rows.slice(0, visibleCount).map((row, index) => ('
)

# Add i={index} to RowCard inside ZoneTable
old_render = '''  <RowCard 
    key={row.id} 
    row={row} 
    selectable={selectable} 
    selected={selectedIds.has(row.id)} 
    onToggle={toggleSelect} 
    onDragStart={handleDragStart}
    zone={zone}
    onMoveDirect={moveSelectedDirectly}
    onRetry={handleRetryEnrichment}
  />'''

new_render = '''  <RowCard 
    key={row.id} 
    row={row} 
    selectable={selectable} 
    selected={selectedIds.has(row.id)} 
    onToggle={toggleSelect} 
    onDragStart={handleDragStart}
    zone={zone}
    onMoveDirect={moveSelectedDirectly}
    onRetry={handleRetryEnrichment}
    i={index}
  />'''

html = html.replace(old_render, new_render)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

