import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update select all checkbox tap target in ZoneTable
old_checkbox = """                {selectable && (
                  <input
                     type="checkbox"
                     className="w-4 h-4 rounded cursor-pointer accent-brand"
                     checked={allSelected}
                    onChange={() => onToggleSelectAll(rows)}
                  />
                )}"""

new_checkbox = """                {selectable && (
                  <div 
                    className="flex items-center justify-center p-2 cursor-pointer"
                    style={{ minWidth: '44px', minHeight: '44px', WebkitTapHighlightColor: 'transparent', marginLeft: '-12px' }}
                    onClick={() => onToggleSelectAll(rows)}
                  >
                    <input
                       type="checkbox"
                       className="w-4 h-4 rounded cursor-pointer accent-brand pointer-events-none"
                       checked={allSelected}
                       readOnly
                    />
                  </div>
                )}"""

if old_checkbox in html:
    html = html.replace(old_checkbox, new_checkbox)
else:
    print("Could not find old_checkbox for ZoneTable")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
