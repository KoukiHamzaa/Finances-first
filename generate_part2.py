import re

with open('refactored_part1.html', 'r', encoding='utf-8') as f:
    html = f.read()

# SPLIT PLAIN JS AND APP COMPONENT
babel_start = html.find('<script type="text/babel">')
plain_js = html[:babel_start + len('<script type="text/babel">\nconst { useState, useCallback, useMemo, useRef, useEffect, startTransition } = React;\n')]
app_code = html[babel_start + len('<script type="text/babel">\nconst { useState, useCallback, useMemo, useRef, useEffect, startTransition } = React;\n'):]

# 1. EXTRACT ROWCARD
row_map_pattern = r'(?P<indent>[ \t]*)\{rows\.map\(\(row,\s*i\)\s*=>\s*\{([\s\S]*?)return\s*\(\s*(<div[\s\S]*?draggable[\s\S]*?</div>)\s*\);\s*\}\)\}'
row_map_match = re.search(row_map_pattern, app_code)
if row_map_match:
    indent = row_map_match.group('indent')
    row_logic = row_map_match.group(2)
    row_jsx = row_map_match.group(3)
    
    # Replace variables in row_jsx
    row_jsx = re.sub(r'checked=\{selectedIds\.has\(row\.id\)\}', 'checked={selected}', row_jsx)
    row_jsx = re.sub(r'onClick=\{selectable \? \(e\) => toggleSelect\(e, row\.id\) : undefined\}', 'onClick={selectable ? (e) => onToggle(e, row.id) : undefined}', row_jsx)
    row_jsx = re.sub(r'onChange=\{\(e\) => toggleSelect\(e, row\.id\)\}', 'onChange={(e) => onToggle(e, row.id)}', row_jsx)
    row_jsx = re.sub(r'onDragStart=\{\(e\) => handleDragStart\(e, row\.id\)\}', 'onDragStart={(e) => onDragStart(e, row.id)}', row_jsx)
    
    rowcard_code = f"""
const RowCard = React.memo(({{ row, selectable, selected, onToggle, onDragStart }}) => {{
{row_logic}
  return (
    {row_jsx}
  );
}}, (prevProps, nextProps) => {{
  return prevProps.selected === nextProps.selected &&
         prevProps.selectable === nextProps.selectable &&
         prevProps.row.id === nextProps.row.id &&
         prevProps.row.status === nextProps.row.status &&
         prevProps.row.enrichState === nextProps.row.enrichState &&
         prevProps.row.productName === nextProps.row.productName &&
         prevProps.row.totalSales === nextProps.row.totalSales &&
         prevProps.row.city === nextProps.row.city;
}});
"""
    
    # Replace mapping logic with render-capped logic
    render_cap_logic = f"""{{rows.slice(0, visibleCount).map((row) => (
  <RowCard 
    key={{row.id}} 
    row={{row}} 
    selectable={{selectable}} 
    selected={{selectedIds.has(row.id)}} 
    onToggle={{toggleSelect}} 
    onDragStart={{handleDragStart}} 
  />
))}}
{{visibleCount < rows.length && (
  <div ref={{sentinelRef}} className="h-4 w-full" />
)}}"""
    
    app_code = app_code[:row_map_match.start()] + render_cap_logic + app_code[row_map_match.end():]
else:
    print("RowCard pattern not found")

# 2. Add visibleCount and sentinelRef to renderTray arguments and logic
tray_pattern = r'const renderTray = \(title, rows, onDropZone, selectable = false\) => \{'
tray_replacement = r"""const renderTray = (title, rows, onDropZone, selectable = false) => {
  const [visibleCount, setVisibleCount] = useState(40);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 40, rows.length));
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [rows.length]);
"""
app_code = re.sub(tray_pattern, tray_replacement, app_code)


# 3. Add progressStore and EnrichmentProgress, AnimatedNumber
progress_store_code = """
const progressStore = {
  listeners: new Set(),
  state: { current: 0, total: 0, errors: 0 },
  emit() { this.listeners.forEach(l => l()); },
  subscribe(l) { this.listeners.add(l); return () => this.listeners.delete(l); },
  set(state) { this.state = state; this.emit(); },
  get() { return this.state; }
};

const EnrichmentProgress = () => {
  const [progress, setProgress] = useState(progressStore.get());
  useEffect(() => progressStore.subscribe(() => setProgress(progressStore.get())), []);
  
  if (progress.total === 0 || progress.current === progress.total) return null;
  const pct = Math.round((progress.current / progress.total) * 100);
  
  return (
    <div className="bg-surface border p-3 rounded-xl shadow-sm mb-4">
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-sm text-ink">جاري جلب الأسماء (Intigo)...</span>
        <span className="font-mono text-xs text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full" dir="ltr">
          {progress.current} / {progress.total}
        </span>
      </div>
      <div className="h-2 bg-line rounded-full overflow-hidden w-full relative">
        <div className="absolute top-0 left-0 h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
      </div>
      {progress.errors > 0 && (
        <p className="text-[10px] text-warn mt-1.5 flex items-center gap-1">
          <span>⚠</span> فشل جلب {progress.errors} طلبات.
        </p>
      )}
    </div>
  );
};

const AnimatedNumber = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef();
  const startTimeRef = useRef();
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (value === displayValue) return;
    
    const animate = time => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const progress = Math.min((time - startTimeRef.current) / 400, 1);
      
      const current = previousValueRef.current + (value - previousValueRef.current) * progress;
      setDisplayValue(current);
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        previousValueRef.current = value;
        setDisplayValue(value);
      }
    };
    
    startTimeRef.current = undefined;
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [value]);

  return <>{formatTND(displayValue)}</>;
});
"""

# Inject before App
app_code = rowcard_code + progress_store_code + '\n' + app_code

# Remove internal enrichProgress states from App
app_code = re.sub(r'const \[enrichProgress,\s*setEnrichProgress\]\s*=\s*useState\([^)]+\);\n', '', app_code)

# Replace the enrichProgress rendering block in App with <EnrichmentProgress />
enrich_progress_render = r'\{enrichProgress\.total\s*>\s*0\s*&&\s*enrichProgress\.current\s*<\s*enrichProgress\.total\s*&&[\s\S]*?</div>\s*\)\s*\}'
app_code = re.sub(enrich_progress_render, '<EnrichmentProgress />', app_code)

with open('refactored_part2.html', 'w', encoding='utf-8') as f:
    f.write(plain_js + app_code)

