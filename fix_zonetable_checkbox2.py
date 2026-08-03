import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r"\{selectable && \(\s*<input\s*type=\"checkbox\"\s*className=\"w-4 h-4 rounded cursor-pointer accent-brand\"\s*checked=\{allSelected\}\s*onChange=\{\(\) => onToggleSelectAll\(rows\)\}\s*/>\s*\)\}"

new_checkbox = """{selectable && (
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

html = re.sub(pattern, new_checkbox, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
