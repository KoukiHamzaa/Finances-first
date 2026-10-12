import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { formatTND, resolveGov, progressStore } from './utils.js';
import { Button } from './components/ui/button.jsx';
import { Checkbox } from './components/ui/checkbox.jsx';
import { Badge } from './components/ui/badge.jsx';
import { Card } from './components/ui/card.jsx';
import { Progress } from './components/ui/progress.jsx';
import { Input } from './components/ui/input.jsx';
import { Label } from './components/ui/label.jsx';


export const supportsHoverDrag = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : false;

export const RowCard = React.memo(({ row, selectable, selected, onToggle, onDragStart, zone, onMoveDirect, onRetry, onToggleStatus, i = 0 }) => {

                const govInfo = resolveGov(row.city);
                
                const statusPills = {
                  'delivered': { label: 'مُسلّم', variant: 'positive' },
                  'returned': { label: 'مسترجع', variant: 'negative' },
                  'cancelled': { label: 'ملغي', variant: 'secondary', className: 'line-through' },
                  'exchange': { label: 'تبادل', variant: 'warning' },
                  'in_progress': { label: 'قيد التنفيذ', variant: 'default' },
                  'return_in_progress': { label: 'إرجاع قيد التنفيذ', variant: 'default' },
                  'other': { label: 'أخرى', variant: 'secondary' }
                };
                const pill = statusPills[row.status] || statusPills['other'];

                
  return (
    <Card
                    key={row.id}
                    draggable={supportsHoverDrag}
                    onDragStart={supportsHoverDrag ? (e) => onDragStart(e, row.id) : undefined}
                    onClick={selectable ? (e) => onToggle(e, row.id) : undefined}
                    className={`rounded-xl p-3 transition-all duration-200 group relative active:scale-[0.99]
                      ${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : (supportsHoverDrag ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : 'cursor-pointer')}
                      ${selected ? 'border-brand ring-1 ring-brand bg-row-selected' : 'border-line hover:bg-row-hover'}
                    `}
                    style={{
                      ...(i < 12 ? { animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` } : {}),
                      touchAction: 'pan-y',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {selectable && (
                        <div 
                          className="flex items-center justify-center -ms-2 -mt-2 p-2 cursor-pointer"
                          style={{ minWidth: '44px', minHeight: '44px', WebkitTapHighlightColor: 'transparent' }}
                          onClick={(e) => { e.stopPropagation(); onToggle(e, row.id); }}
                        >
                          <Checkbox
                            className="size-5 cursor-pointer pointer-events-none"
                            checked={selected}
                            aria-label={`تحديد الطلب ${row.productName || row.id}`}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            {row.carrier === 'INTIGO' && (
                               <span className="flex-shrink-0 mt-0.5" title={row.enrichState === 'fetched' ? 'تم جلب الاسم' : row.enrichState === 'blocked' ? 'بانتظار المفتاح' : row.enrichState === 'not_found' ? 'لم يُعثر على المنتج' : row.enrichState === 'error' ? 'فشل الطلب — أعد المحاولة' : 'جاري الجلب...'}>
                                  {row.enrichState === 'fetched' ? <span className="text-pos">✓</span> :
                                   (row.enrichState === 'blocked' || row.enrichState === 'not_found') ? <span className="text-warn">⚠</span> :
                                   row.enrichState === 'error' ? <span className="text-neg">✗</span> :
                                   <span className="text-brand animate-pulse">⏳</span>}
                               </span>
                            )}
                            <span className="font-medium text-[14px] text-ink leading-tight flex flex-wrap items-center gap-1">
                               {row.productName}
                               {row.carrier === 'INTIGO' && String(row.productName).trim().toLowerCase() === 'colis' && (
                                  <span className="text-warn text-[10px] ms-1 flex items-center" title="الوصف افتراضي من Intigo — لم يُحدَّد اسم منتج">⚠</span>
                               )}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-ink tabular-nums whitespace-nowrap text-[14px]" dir="ltr">
                            {row.status === 'delivered' ? formatTND(row.totalSales) : <span className="text-ink-faint">—</span>}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono text-ink-faint uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 rounded" dir="ltr">{row.nid || row.barcode || 'N/A'}</span>
                          {row.city && (
                            <span className={`px-1.5 py-0.5 rounded ${row.carrier === 'INTIGO' ? (govInfo.isGrandTunis ? 'bg-brand/10 text-brand' : (govInfo.unknown ? 'border border-warn text-warn' : 'bg-warn/10 text-warn')) : 'bg-surface-2 text-ink-soft'}`}>
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleStatus) onToggleStatus(row);
                              }}
                              className="cursor-pointer hover:opacity-85 transition-opacity focus:outline-none"
                              title="انقر لتبديل الحالة بين مُسلّم ومسترجع"
                              aria-label={`تبديل حالة الطلب ${row.productName || row.id}`}
                            >
                              <Badge variant={pill.variant} className={`text-[11px] ${pill.className || ''}`} title={row.originalStatusText}>
                                {pill.label} {row.status === 'in_progress' && '⚠'} ⇄
                              </Badge>
                            </button>
                            {row.hasError && (
                              <Button variant="link" size="sm" onClick={(e) => onRetry(e, row)} className="text-[11px] min-h-[44px] px-2">
                                ⚠ إعادة المحاولة
                              </Button>
                            )}
                          </div>
                          
                          {row.carrier_fee != null && (
                            <div className="flex flex-col text-[10px] items-end" dir="ltr">
                               <span className={`tabular-nums font-mono ${row.fee_delta > 0 ? 'text-neg' : (row.fee_delta < 0 ? 'text-pos' : 'text-ink-soft opacity-60')}`}>
                                 {row.fee_delta < 0 ? '−' : (row.fee_delta > 0 ? '+' : '')}{formatTND(Math.abs(row.fee_delta))}
                               </span>
                            </div>
                          )}
                          
                          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            {zone === 'master' ? (
                              <React.Fragment>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'cakado'); }} className="text-[11px] rounded-full min-h-[44px]">→ كاكادو</Button>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'balkis'); }} className="text-[11px] rounded-full min-h-[44px]">→ بلقيس</Button>
                              </React.Fragment>
                            ) : zone === 'cakado' ? (
                              <React.Fragment>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'balkis'); }} className="text-[11px] rounded-full min-h-[44px]">→ بلقيس</Button>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'master'); }} className="text-[11px] rounded-full min-h-[44px]">↩ إلغاء</Button>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'cakado'); }} className="text-[11px] rounded-full min-h-[44px]">→ كاكادو</Button>
                                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onMoveDirect(row, 'master'); }} className="text-[11px] rounded-full min-h-[44px]">↩ إلغاء</Button>
                              </React.Fragment>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.selected === nextProps.selected &&
         prevProps.selectable === nextProps.selectable &&
         prevProps.zone === nextProps.zone &&
         prevProps.i === nextProps.i &&
         prevProps.row.id === nextProps.row.id &&
         prevProps.row.status === nextProps.row.status &&
         prevProps.row.enrichState === nextProps.row.enrichState &&
         prevProps.row.productName === nextProps.row.productName &&
         prevProps.row.totalSales === nextProps.row.totalSales &&
         prevProps.row.city === nextProps.row.city &&
         prevProps.row.phone === nextProps.row.phone &&
         prevProps.row.hasError === nextProps.row.hasError &&
         prevProps.row.carrier_fee === nextProps.row.carrier_fee &&
         prevProps.row.fee_delta === nextProps.row.fee_delta;
});


export const EnrichmentProgress = () => {
  const [progress, setProgress] = useState(progressStore.get());
  useEffect(() => progressStore.subscribe(() => setProgress(progressStore.get())), []);
  
  if (progress.total === 0 || progress.current === progress.total) return null;

  return (
    <Card className="p-3 mb-4">
      <div className="flex justify-between items-end mb-2">
        <span className="font-bold text-sm text-ink">جاري جلب الأسماء (Intigo)...</span>
        <Badge dir="ltr" className="font-mono text-xs rounded-full">{progress.current} / {progress.total}</Badge>
      </div>
      <Progress value={progress.current} max={progress.total || 1} className="h-2" label={`جاري جلب الأسماء: ${progress.current} من ${progress.total}`} />
      {progress.errors > 0 && (
        <p className="text-[10px] text-warn mt-1.5 flex items-center gap-1">
          <span>⚠</span> فشل جلب {progress.errors} طلبات.
        </p>
      )}
    </Card>
  );
};

export const AnimatedNumber = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const requestRef = useRef();
  const startTimeRef = useRef();
  const previousValueRef = useRef(value);

  useEffect(() => {
    if (value === previousValueRef.current) return;
    
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

  return <React.Fragment>{formatTND(displayValue)}</React.Fragment>;
});

const PAGE_SIZE = 20;

export const ZoneTable = React.memo(({ rows, title, zone, selectable = false, accentColor = '', selectedIds, onToggleSelectAll, onDrop, onToggleSelect, onDragStart, onMoveDirect, onRetry, onToggleStatus }) => {
        const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

        // The set of rows changes identity on every enrichment batch, so paging
        // is reset on the row *ids* instead: that catches a new file, a search,
        // a filter, a sort or a move, but not a name arriving from the API.
        const idSignature = useMemo(() => rows.map((r) => r.id).join('\u0000'), [rows]);
        const [lastSignature, setLastSignature] = useState(idSignature);
        if (lastSignature !== idSignature) {
          setLastSignature(idSignature);
          setVisibleCount(PAGE_SIZE);
        }

        const observerRef = useRef(null);
        const sentinelRef = useRef(null);
        const countRef = useRef({ visible: visibleCount, total: rows.length });
        useEffect(() => { countRef.current = { visible: visibleCount, total: rows.length }; }, [visibleCount, rows.length]);

        // A callback ref, because the sentinel mounts and unmounts as the list
        // fills and empties. An effect with [] deps would only ever see the
        // first node, so paging would stop working after the first unmount.
        const setSentinel = useCallback((node) => {
          const observer = observerRef.current;
          const previous = sentinelRef.current;
          // unobserve(null) throws a TypeError. A ref callback runs during
          // commit, so that throw unmounts the whole app with no error boundary.
          if (observer && previous) observer.unobserve(previous);
          sentinelRef.current = node;
          if (observer && node) observer.observe(node);
        }, []);

        useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting && countRef.current.visible < countRef.current.total) {
                setVisibleCount((prev) => prev + PAGE_SIZE);
              }
            },
            { rootMargin: '200px' }
          );
          observerRef.current = observer;
          if (sentinelRef.current) observer.observe(sentinelRef.current);
          return () => {
            observer.disconnect();
            observerRef.current = null;
          };
        }, []);

        const { allSelected, someSelected } = useMemo(() => {
          if (!rows.length || !selectedIds.size) return { allSelected: false, someSelected: false };
          let matchCount = 0;
          for (let idx = 0; idx < rows.length; idx++) {
            if (selectedIds.has(rows[idx].id)) matchCount++;
          }
          return {
            allSelected: matchCount === rows.length,
            someSelected: matchCount > 0,
          };
        }, [rows, selectedIds]);
const { delCount, retCount, inProgCount, cancelCount, exchCount, prepaidCount } = useMemo(() => {
          return {
            delCount: rows.filter(r=>r.status==='delivered').length,
            retCount: rows.filter(r=>r.status==='returned').length,
            inProgCount: rows.filter(r=>r.status==='in_progress' || r.status==='return_in_progress').length,
            cancelCount: rows.filter(r=>r.status==='cancelled').length,
            exchCount: rows.filter(r=>r.status==='exchange').length,
            prepaidCount: rows.filter(r=>r.status==='delivered' && r.totalSales === 0).length
          };
        }, [rows]);
        let headerCounts = [];
        if (delCount > 0) headerCounts.push('مسلّم ' + delCount);
        if (retCount > 0) headerCounts.push('مسترجع ' + retCount);
        if (inProgCount > 0) headerCounts.push('قيد التنفيذ ' + inProgCount);
        if (cancelCount > 0) headerCounts.push('ملغي ' + cancelCount);
        if (exchCount > 0) headerCounts.push('تبادل ' + exchCount);
        
        
        if (prepaidCount > 0) headerCounts.push('مدفوع مسبقاً: ' + prepaidCount);

        return (
          <Card 
            className="h-full min-h-[400px] transition-transform duration-200"
            onDrop={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
              onDrop(e, zone);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = accentColor ? `0 -2px 10px ${accentColor}33` : '0 -2px 10px rgba(0,0,0,0.05)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            {accentColor && <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accentColor }}></div>}
            
            <div className="bg-surface-2 p-4 border-b border-line flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectable && (
                  <div 
                    className="flex items-center justify-center p-2 cursor-pointer"
                    style={{ minWidth: '44px', minHeight: '44px', WebkitTapHighlightColor: 'transparent', marginInlineStart: '-12px' }}
                    onClick={() => onToggleSelectAll(rows)}
                  >
                    <Checkbox
                      className="size-4 cursor-pointer pointer-events-none"
                      checked={allSelected ? true : (someSelected ? 'indeterminate' : false)}
                      aria-label={`تحديد كل الطلبات في ${title}`}
                    />
                  </div>
                )}
                <span className="font-display text-lg text-ink">{title}</span>
              </div>
              <div className="flex flex-col items-end text-start">
                <Badge variant="secondary" className="text-xs rounded-full tabular-nums font-bold">{rows.length}</Badge>
                <span className="text-[10px] text-ink-faint mt-1 tabular-nums max-w-[200px] break-words">{headerCounts.join(' • ')}</span>
              </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative" style={{ touchAction: 'pan-y' }}>
              {rows.length === 0 && (
                <div className="absolute inset-4 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-center p-4">
                  <span className="text-sm text-ink-soft">اسحب الطلبات إلى هنا، أو حدّدها ثم انقر للتعيين</span>
                </div>
              )}
{rows.slice(0, visibleCount).map((row, index) => (
  <RowCard 
    key={row.id} 
    row={row} 
    selectable={selectable} 
    selected={selectedIds.has(row.id)} 
    onToggle={onToggleSelect} 
    onDragStart={onDragStart}
    zone={zone}
    onMoveDirect={onMoveDirect}
    onRetry={onRetry}
    onToggleStatus={onToggleStatus}
    i={index}
  />
))}
{visibleCount < rows.length && (
  <div ref={setSentinel} className="h-4 w-full" />
)}
            </div>
          </Card>
        );
      });
export const ReceiptSplitPanel = ({ receiptSummary, splitAlloc, setSplitAlloc, cakadoFees, balkisFees, setCakadoFees, setBalkisFees, formatTND }) => {
  const totalDelivered = receiptSummary.deliveredCount || 0;
  const totalReturned = receiptSummary.returnedCount || 0;
  const totalCOD = receiptSummary.cod || 0;

  const brands = [
    { key: 'cakado', title: 'CAKADO (كاكادو)', fees: cakadoFees, setFees: setCakadoFees, accent: 'var(--brand)' },
    { key: 'balkis', title: 'BALKIS (بلقيس)', fees: balkisFees, setFees: setBalkisFees, accent: '#3b82f6' },
  ];

  const updateCount = (brandKey, field, value) => {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    setSplitAlloc(prev => ({ ...prev, [brandKey]: { ...prev[brandKey], [field]: n } }));
  };
  const updateFee = (setFees, field, value) => {
    setFees(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const deliveredSum = (splitAlloc.cakado.delivered || 0) + (splitAlloc.balkis.delivered || 0);
  const returnedSum = (splitAlloc.cakado.returned || 0) + (splitAlloc.balkis.returned || 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Explanation banner */}
      <div className="rounded-xl border border-line bg-surface-2 p-4 text-sm text-ink-soft leading-relaxed">
        ملف الوصل لا يحتوي على تفاصيل المنتجات الفردية — لا يمكن التصنيف حسب الاسم.
        لتصنيف الطرود حسب العلامة التجارية، ارفع ملف تقرير الطرود (Détails recette) من First Delivery.
        يمكنك هنا توزيع الأعداد يدوياً بين CAKADO و BALKIS.
      </div>

      {/* Per-brand panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brands.map((b) => {
          const brand = splitAlloc[b.key];
          const brandCOD = totalDelivered > 0 ? (brand.delivered / totalDelivered) * totalCOD : 0;
          const brandDelivFee = brand.delivered * (b.fees.delivery || 0);
          const brandRetFee = brand.returned * (b.fees.return || 0);
          const brandNet = brandCOD - brandDelivFee - brandRetFee;
          return (
            <Card key={b.key} className="relative overflow-hidden rounded-xl p-5 flex flex-col gap-4 surface-highlight">
              {b.accent && <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: b.accent }}></div>}
              <div className="pt-1">
                <Badge variant="secondary" className="text-xs font-bold uppercase tracking-wider">{b.title}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`split-${b.key}-delivered`} className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">طرود مسلّمة</Label>
                  <Input
                    id={`split-${b.key}-delivered`}
                    type="number"
                    min="0"
                    step="1"
                    dir="ltr"
                    className="bg-surface-2 tabular-nums"
                    value={brand.delivered || 0}
                    onChange={e => updateCount(b.key, 'delivered', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`split-${b.key}-returned`} className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">طرود مسترجعة</Label>
                  <Input
                    id={`split-${b.key}-returned`}
                    type="number"
                    min="0"
                    step="1"
                    dir="ltr"
                    className="bg-surface-2 tabular-nums"
                    value={brand.returned || 0}
                    onChange={e => updateCount(b.key, 'returned', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`split-${b.key}-fee-delivery`} className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">رسم التسليم / طرد (TND)</Label>
                  <Input
                    id={`split-${b.key}-fee-delivery`}
                    type="number"
                    min="0"
                    step="0.001"
                    dir="ltr"
                    className="bg-surface-2 tabular-nums"
                    value={b.fees.delivery || 0}
                    onChange={e => updateFee(b.setFees, 'delivery', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`split-${b.key}-fee-return`} className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">رسم الإرجاع / طرد (TND)</Label>
                  <Input
                    id={`split-${b.key}-fee-return`}
                    type="number"
                    min="0"
                    step="0.001"
                    dir="ltr"
                    className="bg-surface-2 tabular-nums"
                    value={b.fees.return || 0}
                    onChange={e => updateFee(b.setFees, 'return', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-line text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">COD المحصّل</span>
                  <span className="tabular-nums text-ink" dir="ltr">+{formatTND(brandCOD)} د.ت</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">رسوم التسليم</span>
                  <span className="tabular-nums text-neg" dir="ltr">−{formatTND(brandDelivFee)} د.ت</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink-soft">رسوم الإرجاع</span>
                  <span className="tabular-nums text-neg" dir="ltr">−{formatTND(brandRetFee)} د.ت</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-1 border-t border-line">
                  <span className="text-[10px] uppercase tracking-wide text-ink-faint">الصافي</span>
                  <span className={`text-3xl font-mono font-extrabold tabular-nums ${brandNet < 0 ? 'text-neg' : 'text-pos'}`} dir="ltr">{formatTND(brandNet)}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Validation row */}
      <div className="rounded-xl border border-line bg-surface-2 p-4 flex flex-col sm:flex-row gap-3 sm:gap-6">
        <div className={`flex-1 flex items-center justify-between gap-3 text-sm ${deliveredSum === totalDelivered ? 'text-pos' : 'text-neg'}`}>
          <span className="text-ink-soft">إجمالي الطرود المُسلّمة</span>
          <span className="font-mono font-bold tabular-nums" dir="ltr">
            {splitAlloc.cakado.delivered || 0} + {splitAlloc.balkis.delivered || 0} = {deliveredSum} / {totalDelivered}
          </span>
        </div>
        <div className={`flex-1 flex items-center justify-between gap-3 text-sm ${returnedSum === totalReturned ? 'text-pos' : 'text-neg'}`}>
          <span className="text-ink-soft">إجمالي الطرود المسترجعة</span>
          <span className="font-mono font-bold tabular-nums" dir="ltr">
            {splitAlloc.cakado.returned || 0} + {splitAlloc.balkis.returned || 0} = {returnedSum} / {totalReturned}
          </span>
        </div>
      </div>
    </div>
  );
};

// A render error anywhere below this point shows a recoverable panel instead of
// a blank page. Nothing above it can still fail, which is the point.
export class ErrorBoundary extends React.Component {
   constructor(props) {
      super(props);
      this.state = { error: null };
   }

   static getDerivedStateFromError(error) {
      return { error };
   }

   componentDidCatch(error) {
      // The message only: never the stack, and never component state.
      console.error('App render failed:', error && error.message);
   }

   render() {
      if (!this.state.error) return this.props.children;

      return (
<div className="min-h-dvh bg-bg text-ink flex items-center justify-center p-6" dir="rtl">
            <Card className="max-w-md w-full p-6 text-center rounded-2xl">
               <h1 className="text-lg font-bold mb-2">حدث خطأ غير متوقع</h1>
               <p className="text-sm text-ink-soft mb-4">
                  تعذّر عرض اللوحة. ملفاتك محفوظة في المتصفح، جرّب تحديث الصفحة.
               </p>
               <Button
                  onClick={() => window.location.reload()}
                  className="min-h-11 px-6 py-2 rounded-lg text-sm font-bold"
               >
                  تحديث الصفحة
               </Button>
            </Card>
         </div>
      );
   }
}
