import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update checkbox tap target in RowCard
pattern = r"\{selectable && \(\s*<input\s*type=\"checkbox\"\s*className=\"w-5 h-5 mt-0\.5 rounded cursor-pointer accent-brand\"\s*checked=\{selected\}\s*onChange=\{\(e\) => onToggle\(e, row\.id\)\}\s*onClick=\{\(e\) => e\.stopPropagation\(\)\}\s*/>\s*\)\}"

new_checkbox = """{selectable && (
                        <div 
                          className="flex items-center justify-center -ml-2 -mt-2 p-2 cursor-pointer"
                          style={{ minWidth: '44px', minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
                          onClick={(e) => { e.stopPropagation(); onToggle(e, row.id); }}
                        >
                          <input
                              type="checkbox"
                              className="w-5 h-5 rounded cursor-pointer accent-brand pointer-events-none"
                            checked={selected}
                            readOnly
                          />
                        </div>
                      )}"""

html = re.sub(pattern, new_checkbox, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
