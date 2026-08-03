import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add supportsHoverDrag
html = html.replace(
    "const RowCard = React.memo",
    "const supportsHoverDrag = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : false;\n\nconst RowCard = React.memo"
)

# Update RowCard root div
old_rowcard_root = """  return (
    <div
                    key={row.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, row.id)}
                    onClick={selectable ? (e) => onToggle(e, row.id) : undefined}
                    className={`bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative
                      ${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md'} 
                      ${selected ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line'}
                    `}
                    style={i < 12 ? { animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` } : {}}
                  >"""

new_rowcard_root = """  return (
    <div
                    key={row.id}
                    draggable={supportsHoverDrag}
                    onDragStart={supportsHoverDrag ? (e) => onDragStart(e, row.id) : undefined}
                    onClick={selectable ? (e) => onToggle(e, row.id) : undefined}
                    className={`bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative active:scale-[0.99]
                      ${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : (supportsHoverDrag ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : 'cursor-pointer')} 
                      ${selected ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line'}
                    `}
                    style={{
                      ...(i < 12 ? { animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` } : {}),
                      touchAction: 'pan-y',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >"""

if old_rowcard_root in html:
    html = html.replace(old_rowcard_root, new_rowcard_root)
else:
    print("Could not find old_rowcard_root")

# Update checkbox tap target in RowCard
old_checkbox = """                      {selectable && (
                        <input
                            type="checkbox"
                            className="w-5 h-5 mt-0.5 rounded cursor-pointer accent-brand"
                          checked={selected}
                          onChange={(e) => onToggle(e, row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}"""

new_checkbox = """                      {selectable && (
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
                      
if old_checkbox in html:
    html = html.replace(old_checkbox, new_checkbox)
else:
    print("Could not find old_checkbox")

# Update ZoneTable container
old_zonetable_container = """<div className="flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative">"""
new_zonetable_container = """<div className="flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative" style={{ touchAction: 'pan-y' }}>"""

if old_zonetable_container in html:
    html = html.replace(old_zonetable_container, new_zonetable_container)
else:
    print("Could not find old_zonetable_container")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
