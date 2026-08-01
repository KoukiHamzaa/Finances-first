const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const renderTableStart = "      const renderTable = (rows, title, zone, selectable = false, accentColor = '') => {";
const renderTableEnd = `                            {row.hasError && (
                              <button onClick={(e) => handleRetryEnrichment(e, row)} className="text-[11px] text-brand hover:underline flex items-center gap-1">
                                ⚠ إعادة المحاولة`;

const newRenderTableStart = `      const renderTable = (rows, title, zone, selectable = false, accentColor = '') => {
        const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
        const delCount = rows.filter(r=>r.status==='delivered').length;
        const retCount = rows.filter(r=>r.status==='returned').length;
        const inProgCount = rows.filter(r=>r.status==='in_progress' || r.status==='return_in_progress').length;
        const cancelCount = rows.filter(r=>r.status==='cancelled').length;
        const exchCount = rows.filter(r=>r.status==='exchange').length;
        
        let headerCounts = [];
        if (delCount > 0) headerCounts.push('مسلّم ' + delCount);
        if (retCount > 0) headerCounts.push('مسترجع ' + retCount);
        if (inProgCount > 0) headerCounts.push('قيد التنفيذ ' + inProgCount);
        if (cancelCount > 0) headerCounts.push('ملغي ' + cancelCount);
        if (exchCount > 0) headerCounts.push('تبادل ' + exchCount);
        
        const prepaidCount = rows.filter(r=>r.status==='delivered' && r.totalSales === 0).length;
        if (prepaidCount > 0) headerCounts.push('مدفوع مسبقاً: ' + prepaidCount);

        return (
          <div 
            className="bg-surface rounded-xl shadow-sm border border-line flex flex-col h-full min-h-[400px] relative overflow-hidden transition-transform duration-200"
            onDrop={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
              handleDrop(e, zone);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = accentColor ? \`0 -2px 10px \${accentColor}33\` : '0 -2px 10px rgba(0,0,0,0.05)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {accentColor && <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }}></div>}
            
            <div className="bg-surface-2 p-4 border-b border-line flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectable && (
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded cursor-pointer accent-brand" 
                    checked={allSelected}
                    onChange={() => toggleSelectAll(rows)}
                  />
                )}
                <span className="font-display text-lg text-ink">{title}</span>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="bg-line text-ink text-xs px-2 py-0.5 rounded-full tabular-nums font-bold">{rows.length}</span>
                <span className="text-[10px] text-ink-faint mt-1 tabular-nums max-w-[200px] break-words">{headerCounts.join(' • ')}</span>
              </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative">
              {rows.length === 0 && (
                <div className="absolute inset-4 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-center p-4">
                  <span className="text-sm text-ink-soft">اسحب الطلبات إلى هنا، أو حدّدها ثم انقر للتعيين</span>
                </div>
              )}
              {rows.map((row, i) => {
                const govInfo = resolveGov(row.city);
                
                const statusPills = {
                  'delivered': { label: 'مُسلّم', colors: 'bg-pos/10 text-pos' },
                  'returned': { label: 'مسترجع', colors: 'bg-neg/10 text-neg' },
                  'cancelled': { label: 'ملغي', colors: 'bg-ink-faint/10 text-ink-faint line-through' },
                  'exchange': { label: 'تبادل', colors: 'bg-warn/10 text-warn' },
                  'in_progress': { label: 'قيد التنفيذ', colors: 'bg-brand/10 text-brand' },
                  'return_in_progress': { label: 'إرجاع قيد التنفيذ', colors: 'bg-brand/10 text-brand' },
                  'other': { label: 'أخرى', colors: 'bg-surface-2 text-ink-soft' }
                };
                const pill = statusPills[row.status] || statusPills['other'];

                return (
                  <div
                    key={row.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, row.id)}
                    onClick={selectable ? (e) => toggleSelect(e, row.id) : undefined}
                    className={\`bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative
                      \${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md'} 
                      \${selectedIds.has(row.id) ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line'}
                    \`}
                    style={i < 12 ? { animation: \`fadeInUp 0.3s ease-out \${i * 0.03}s both\` } : {}}
                  >
                    <div className="flex items-start gap-3">
                      {selectable && (
                        <input 
                           type="checkbox" 
                           className="w-5 h-5 mt-0.5 rounded cursor-pointer accent-brand"
                          checked={selectedIds.has(row.id)}
                          onChange={(e) => toggleSelect(e, row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-[14px] text-ink leading-tight">{row.productName}</span>
                          <span className="font-mono font-bold text-ink tabular-nums whitespace-nowrap text-[14px]" dir="ltr">
                            {row.status === 'delivered' ? formatTND(row.totalSales) : <span className="text-ink-faint">—</span>}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono text-ink-faint uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 rounded" dir="ltr">{row.nid || row.barcode || 'N/A'}</span>
                          {row.city && (
                            <span className={\`px-1.5 py-0.5 rounded \${row.carrier === 'INTIGO' ? (govInfo.isGrandTunis ? 'bg-brand/10 text-brand' : (govInfo.unknown ? 'border border-warn text-warn' : 'bg-warn/10 text-warn')) : 'bg-surface-2 text-ink-soft'}\`}>
                              {row.city} {row.carrier === 'INTIGO' && govInfo.isGrandTunis && 'إرجاع 1'}
                              {row.carrier === 'INTIGO' && !govInfo.isGrandTunis && 'إرجاع 2'}
                            </span>
                          )}
                          {row.phone && (
                            <span className="text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded" dir="ltr">{row.phone}</span>
                          )}
                          {row.status === 'delivered' && row.totalSales === 0 && (
                            <span className="bg-pos/20 text-pos px-1.5 py-0.5 rounded font-medium">مدفوع مسبقاً</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-2">
                            <span className={\`px-2 py-0.5 rounded text-[11px] font-medium \${pill.colors}\`} title={row.originalStatusText}>
                              {pill.label} {row.status === 'in_progress' && '⚠'}
                            </span>
                            {row.hasError && (
                              <button onClick={(e) => handleRetryEnrichment(e, row)} className="text-[11px] text-brand hover:underline flex items-center gap-1">
                                ⚠ إعادة المحاولة`;

const s = html.indexOf(renderTableStart);
const e = html.indexOf(renderTableEnd, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newRenderTableStart + html.substring(e + renderTableEnd.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 7 successful");
} else {
  console.log("Could not find renderTable block");
  process.exit(1);
}
