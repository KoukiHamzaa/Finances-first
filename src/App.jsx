import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue, Suspense, lazy } from 'react';
import { formatTND, detectTemplate, parseConverty, parseLogista, parseIntigo, CACHE_KEY_PREFIX, calculateStats, enrichIntigoRows, progressStore, checkHealth, sortByProductName, parsePaymentReceipt } from './utils.js';
import { AnimatedNumber, ZoneTable } from './components.jsx';
import { Button } from './components/ui/button.jsx';
import { Input } from './components/ui/input.jsx';
import { Label } from './components/ui/label.jsx';
import { Badge } from './components/ui/badge.jsx';
import { Card } from './components/ui/card.jsx';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert.jsx';
import { Progress } from './components/ui/progress.jsx';
import { NativeSelect } from './components/ui/native-select.jsx';

// Dialog + Radix focus-scope only load when a confirmation is actually opened.
const ConfirmDialog = lazy(() => import('./components/ui/confirm-dialog.jsx'));

const matchesSearch = (r, q) => (
  (r.productName && r.productName.toLowerCase().includes(q)) ||
  (r.nid && String(r.nid).toLowerCase().includes(q)) ||
  (r.barcode && String(r.barcode).toLowerCase().includes(q)) ||
  (r.phone && String(r.phone).includes(q))
);

const matchesStatus = (r, filterStatus) => {
  if (filterStatus === 'delivered') return r.status === 'delivered';
  if (filterStatus === 'returned') return r.status === 'returned';
  if (filterStatus === 'in_progress') return r.status === 'in_progress' || r.status === 'return_in_progress';
  if (filterStatus === 'cancelled') return r.status === 'cancelled';
  if (filterStatus === 'error') return !!r.hasError;
  return true;
};

const SORTERS = {
  'price-desc': (a, b) => b.totalSales - a.totalSales,
  'price-asc': (a, b) => a.totalSales - b.totalSales,
  'city': (a, b) => String(a.city || '').localeCompare(String(b.city || '')),
  'status': (a, b) => a.status.localeCompare(b.status),
  'product': sortByProductName,
};

// A real custom hook so the memo is legal and its dependencies are honest.
function useDerivedRows(sourceArray, searchQuery, filterStatus, sortOption) {
  return useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let res = query ? sourceArray.filter((r) => matchesSearch(r, query)) : sourceArray;
    if (filterStatus !== 'all') res = res.filter((r) => matchesStatus(r, filterStatus));

    const sorter = SORTERS[sortOption];
    if (sorter) {
      res = [...res].sort(sorter);
    } else if (query) {
      // Preserve the copy-on-write contract so callers never see a sorted view.
      res = [...res];
    }
    return res;
  }, [sourceArray, searchQuery, filterStatus, sortOption]);
}

// Declared at module level on purpose: when this lived inside App it was a new
// component type on every render, so React unmounted and remounted both cards
// (and their AnimatedNumbers) on every keystroke.
const BrandSummaryCard = React.memo(({ title, stats }) => (
          <Card className="rounded-xl p-5 flex-1 flex flex-col justify-between surface-highlight transition-all">
            <h3 className="text-lg font-display text-ink mb-4">{title}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-soft">إجمالي المبيعات</span>
                <span className="font-medium text-ink tabular-nums">{formatTND(stats.totalSales)} د.ت</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-soft">رسوم التوصيل</span>
                <span className="tabular-nums text-neg" dir="ltr">−{formatTND(stats.totalRuleFeeDelivery)} د.ت</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-soft">رسوم الإرجاع</span>
                <span className="tabular-nums text-neg" dir="ltr">−{formatTND(stats.totalRuleFeeReturn)} د.ت</span>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-line flex flex-col items-start gap-4" aria-live="polite">
              <div>
                 <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">صافي وفق القاعدة</span>
                 <span className="text-4xl sm:text-5xl font-mono font-extrabold text-ink leading-tight tabular-nums tracking-tight"><AnimatedNumber value={stats.netRule} /></span>
              </div>
              {stats.hasCarrierFee && (
                 <div className="w-full flex justify-between bg-surface-2 p-3 rounded-lg border border-line mt-2">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">صافي وفق الفاتورة</span>
                       <span className="text-lg font-mono font-bold text-ink tabular-nums"><AnimatedNumber value={stats.netCarrier} /></span>
                    </div>
                    <div className="flex flex-col text-start">
                       <span className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">الفرق</span>
                       <span className={`text-lg font-mono font-bold tabular-nums ${stats.netCarrier - stats.netRule < 0 ? 'text-neg' : (stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft')}`} dir="ltr">
                          {stats.netCarrier - stats.netRule < 0 ? '−' : (stats.netCarrier - stats.netRule > 0 ? '+' : '')}
                          {formatTND(Math.abs(stats.netCarrier - stats.netRule))}
                       </span>
                    </div>
                 </div>
              )}
            </div>
          </Card>
));

export default function App() {
  // Splash fade out
  useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (splash) {
      requestAnimationFrame(() => {
        splash.style.transition = 'opacity 0.6s ease';
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 600);
      });
    }
  }, []);
      // Three separate state arrays
      const [masterRows, setMasterRows] = useState([]);
      const [cakadoRows, setCakadoRows] = useState([]);
      const [balkisRows, setBalkisRows] = useState([]);
      
      const [selectedIds, setSelectedIds] = useState(new Set());
      const [error, setError] = useState(null);
      const [autoFeesInfo, setAutoFeesInfo] = useState(null);
      const [isReadingFile, setIsReadingFile] = useState(false);

      // Presentational Derived View States
      const [searchQuery, setSearchQuery] = useState('');
      const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'delivered', 'returned', 'error'
      const [sortOption, setSortOption] = useState('default'); // 'default', 'price-desc', 'price-asc', 'city', 'status', 'product'
      const [activeCarrier, setActiveCarrier] = useState(null);

      // Theme toggle
      const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem('recon-theme');
        if (stored) return stored;
        return 'light';
      });

      useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('recon-theme', theme);
      }, [theme]);
      
      useEffect(() => {
        const handleBeforeUnload = (e) => {
          if (masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) {
            e.preventDefault();
            e.returnValue = '';
          }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
      }, [masterRows.length, cakadoRows.length, balkisRows.length]);

      const toggleTheme = () => setTheme(t => t === 'light' ? 'console' : 'light');

      // Intigo State
      const [intigoApiKey, setIntigoApiKey] = useState(localStorage.getItem('intigoApiKey') || '');
      const apiKeyRef = useRef(intigoApiKey);
      useEffect(() => { apiKeyRef.current = intigoApiKey; }, [intigoApiKey]);
      const [isEnriching, setIsEnriching] = useState(false);
      const [enrichProgress, setEnrichProgress] = useState(progressStore.get());
      useEffect(() => progressStore.subscribe(() => setEnrichProgress(progressStore.get())), []);
            const currentUploadId = useRef(0);
      const [scrollPos, setScrollPos] = useState({ top: true, bottom: false });
      
      useEffect(() => {
         const handleScroll = () => {
            const isTop = window.scrollY < 100;
            const isBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
            setScrollPos(prev => (prev.top === isTop && prev.bottom === isBottom) ? prev : { top: isTop, bottom: isBottom });
         };
         window.addEventListener('scroll', handleScroll, { passive: true });
         handleScroll();

         // A ResizeObserver on the document covers the case the MutationObserver
         // was there for: the page growing as cards page in. Observing body with
         // {subtree:true} fired on every enrichment batch and forced a
         // synchronous layout each time.
         const resize = new ResizeObserver(handleScroll);
         resize.observe(document.documentElement);
         return () => {
            window.removeEventListener('scroll', handleScroll);
            resize.disconnect();
         };
      }, []);
      
      const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      const [showResetModal, setShowResetModal] = useState(false);

      // Per-Brand Fee Structure
      const [cakadoFees, setCakadoFees] = useState({ delivery: 0, return: 0 });
      const [balkisFees, setBalkisFees] = useState({ delivery: 0, return: 0 });

            const [dismissedUnknownGovs, setDismissedUnknownGovs] = useState(false);
      const [duplicateNids, setDuplicateNids] = useState([]);
      const [receiptSummary, setReceiptSummary] = useState(null);
      const [unrecognizedStatuses, setUnrecognizedStatuses] = useState([]);
      const [healthStatus, setHealthStatus] = useState('checking');
      
      
      
      // Below this length a key cannot be complete, so there is no point asking the
// API about it. Intigo keys are opaque strings; this only suppresses health
// checks while the user is still typing.
const MIN_KEY_LENGTH = 16;
const API_KEY_COMMIT_DELAY = 800;

      // Writing to localStorage and probing the health endpoint on every
      // keystroke meant a storage write per character and a request fired with
      // a half-typed key. Persist on a debounce (and immediately on blur), and
      // only probe a plausibly complete key.
      const commitApiKey = useCallback(() => {
        try { localStorage.setItem('intigoApiKey', apiKeyRef.current); } catch (_) {}
      }, []);

      useEffect(() => {
        const t = setTimeout(commitApiKey, API_KEY_COMMIT_DELAY);
        return () => clearTimeout(t);
      }, [intigoApiKey, commitApiKey]);

      useEffect(() => {
         const key = intigoApiKey.trim();
         if (!key || key.length < MIN_KEY_LENGTH) return;

         const t = setTimeout(() => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => checkHealth(key, setHealthStatus));
            } else {
                checkHealth(key, setHealthStatus);
            }
         }, API_KEY_COMMIT_DELAY);
         return () => clearTimeout(t);
      }, [intigoApiKey]);

      // With no key at all the dot reads "invalid" without needing an effect.
      const effectiveHealthStatus = intigoApiKey.trim() ? healthStatus : 'unauthorized';

      const resetSession = useCallback(() => {
        currentUploadId.current += 1;
        setMasterRows([]);
        setCakadoRows([]);
        setBalkisRows([]);
        setActiveCarrier(null);
        setAutoFeesInfo(null);
        setError(null);
        setSearchQuery('');
        setFilterStatus('all');
        setSortOption('default');
        setSelectedIds(new Set());
        setIsEnriching(false);
        progressStore.set({ current: 0, total: 0, errors: 0 });
        setCakadoFees({ delivery: 0, return: 0 });
        setBalkisFees({ delivery: 0, return: 0 });
        setShowResetModal(false);
                setDuplicateNids([]);
        setUnrecognizedStatuses([]);
        setDismissedUnknownGovs(false);
        setReceiptSummary(null);
      }, []);

      // Refs mirroring state that handlers need. Handlers stay referentially
      // stable (so ZoneTable's memo actually holds) while still reading the
      // latest values instead of closing over stale ones.
      const rowsByIdRef = useRef(new Map());
      useEffect(() => {
        const byId = new Map();
        for (const r of masterRows) byId.set(r.id, r);
        for (const r of cakadoRows) byId.set(r.id, r);
        for (const r of balkisRows) byId.set(r.id, r);
        rowsByIdRef.current = byId;
      }, [masterRows, cakadoRows, balkisRows]);

      const activeCarrierRef = useRef(activeCarrier);
      useEffect(() => { activeCarrierRef.current = activeCarrier; }, [activeCarrier]);

      // Applies a batch of resolved enrichment results to whichever zone holds
      // each row. This was copy-pasted in three places.
      const applyEnrichmentBatch = useCallback((batch) => {
        const byId = new Map(batch.map((r) => [r.id, r]));
        const merge = (arr) => arr.map((row) => {
          const next = byId.get(row.id);
          return next
            ? {
                ...row,
                productName: next.productName,
                phone: next.phone,
                needsEnrichment: next.needsEnrichment,
                hasError: next.hasError,
                enrichState: next.enrichState,
              }
            : row;
        });
        setMasterRows(merge);
        setCakadoRows(merge);
        setBalkisRows(merge);
      }, []);

      const startEnrichment = useCallback((rows, uploadId) => {
        enrichIntigoRows(rows, apiKeyRef.current, uploadId, {
          setIsEnriching,
          setHealthStatus,
          setError,
          checkIsCancelled: () => uploadId !== currentUploadId.current,
          onBatchResolved: applyEnrichmentBatch,
        });
      }, [applyEnrichmentBatch]);

      const handleNewCompanyClick = useCallback(() => {
        const isDirty = masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0 || activeCarrier || isEnriching;
        if (isDirty) {
          setShowResetModal(true);
        } else {
          resetSession();
        }
      }, [masterRows.length, cakadoRows.length, balkisRows.length, activeCarrier, isEnriching, resetSession]);

      const handleClearCache = useCallback(() => {
         const keysToRemove = [];
         for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
               keysToRemove.push(key);
            }
         }
         keysToRemove.forEach(k => localStorage.removeItem(k));

         if (activeCarrierRef.current === 'INTIGO') {
            const apiKey = apiKeyRef.current;
            if (!apiKey || !apiKey.trim()) {
               setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
               return;
            }
            const updateArr = (arr) => arr.map(r => ({ ...r, needsEnrichment: true, enrichState: 'pending', productName: 'جاري الجلب...' }));
            let allToEnrich = [];
            setMasterRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });
            setCakadoRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });
            setBalkisRows(prev => { const n = updateArr(prev); allToEnrich.push(...n); return n; });

            // Deferred so the pending state is painted before the loop starts.
            setTimeout(() => startEnrichment(allToEnrich, currentUploadId.current), 0);
         }
      }, [startEnrichment]);

      // Drag and drop mechanics
      const handleDragStart = useCallback((e, id) => {
        e.dataTransfer.setData('text/plain', id);
      }, []);

      const handleDrop = useCallback((e, targetZone) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;

        const row = rowsByIdRef.current.get(id);
        if (!row) return;

        const updateZone = (prev, zoneName) => {
          const present = prev.some(r => r.id === id);
          if (zoneName === targetZone) return present ? prev : [...prev, row];
          return present ? prev.filter(r => r.id !== id) : prev;
        };

        setMasterRows(prev => updateZone(prev, 'master'));
        setCakadoRows(prev => updateZone(prev, 'cakado'));
        setBalkisRows(prev => updateZone(prev, 'balkis'));
      }, []);

      const handleDragOver = useCallback((e) => {
        e.preventDefault();
      }, []);

      const handleRetryEnrichment = useCallback((e, row) => {
        e.stopPropagation();
        // Read the key from a ref, not from the closure: retrying after
        // correcting a 401 must use the key the user just typed.
        const apiKey = apiKeyRef.current;
        if (!apiKey || !apiKey.trim()) {
          setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
          return;
        }

        const updateArr = (arr) => arr.map(r => r.id === row.id ? { ...r, enrichState: 'pending', productName: 'جاري الجلب...', hasError: false, needsEnrichment: true } : r);
        setMasterRows(prev => updateArr(prev));
        setCakadoRows(prev => updateArr(prev));
        setBalkisRows(prev => updateArr(prev));

        startEnrichment([{ ...row, needsEnrichment: true }], currentUploadId.current);
      }, [startEnrichment]);

      const handleFileUpload = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          setIsReadingFile(true);
          try {
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            const template = detectTemplate(rawRows);
            let result;

            if (template === 'CONVERTY') result = parseConverty(rawRows);
            else if (template === 'LOGISTA') result = parseLogista(rawRows);
            else if (template === 'INTIGO') result = parseIntigo(rawRows);
            else if (template === 'PAYMENT_RECEIPT') result = parsePaymentReceipt(rawRows);
            else {
              setError('خطأ: تنسيق الملف غير معروف. يُقبل ملفات Converty أو Logista أو Intigo أو وصل استخلاص.');
              return;
            }

            if (!result.isSummaryReceipt && result.rows.length === 0) {
              setError('خطأ: الملف لا يحتوي على أي بيانات تخص التوصيل أو الإرجاع.');
              return;
            }

            resetSession();

            const thisUploadId = currentUploadId.current;

            if (result.isSummaryReceipt) {
              setActiveCarrier('PAYMENT_RECEIPT');
              setReceiptSummary(result.summary);
              if (result.autoFees) {
                setAutoFeesInfo(result.autoFees);
                setCakadoFees(result.autoFees);
                setBalkisFees(result.autoFees);
              }
              return;
            }
            
            // Full State Reset: On every file upload, reset all state before loading new data
            setMasterRows(result.rows);
            setActiveCarrier(template);
            
            if (result.duplicateNids && result.duplicateNids.length > 0) {
               setDuplicateNids(result.duplicateNids);
            }
            if (result.unrecognizedStatuses && result.unrecognizedStatuses.length > 0) {
               setUnrecognizedStatuses(result.unrecognizedStatuses);
            }
            
            if (result.autoFees) {
              setAutoFeesInfo(result.autoFees);
              setCakadoFees(result.autoFees);
              setBalkisFees(result.autoFees);
            }
            
            if (result.isIntigo) {
              if (!intigoApiKey || !intigoApiKey.trim()) {
                setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
                const blockedRows = result.rows.map(r => ({ ...r, enrichState: 'blocked', productName: '— (بانتظار المفتاح)', needsEnrichment: true, hasError: false }));
                setMasterRows(blockedRows);
              } else {
                const pendingRows = result.rows.map(r => ({ ...r, enrichState: 'pending', needsEnrichment: true, hasError: false, productName: 'جاري الجلب...' }));
                setMasterRows(pendingRows);
                startEnrichment(pendingRows, thisUploadId);
              }
            }
          } catch (err) {
            setError('خطأ: ' + err.message);
          } finally {
            setIsReadingFile(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }, [intigoApiKey, resetSession, startEnrichment]);

      const onFileInputChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileUpload(e.target.files[0]);
          e.target.value = '';
        }
      }, [handleFileUpload]);

      const onDropFile = useCallback((e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileUpload(e.dataTransfer.files[0]);
        }
      }, [handleFileUpload]);

      // Number Formatting

      ;

      // Filtering and sorting three arrays is the expensive part of a
      // keystroke, so the query is deferred: the input stays responsive and
      // the list catches up a frame later.
      const deferredSearch = useDeferredValue(searchQuery);
      const viewMaster = useDerivedRows(masterRows, deferredSearch, filterStatus, sortOption);
      const viewCakado = useDerivedRows(cakadoRows, deferredSearch, filterStatus, sortOption);
      const viewBalkis = useDerivedRows(balkisRows, deferredSearch, filterStatus, sortOption);

      const cakadoStats = useMemo(() => calculateStats(cakadoRows, cakadoFees), [cakadoRows, cakadoFees]);
      const balkisStats = useMemo(() => calculateStats(balkisRows, balkisFees), [balkisRows, balkisFees]);

      const toggleSelectAll = useCallback((rowsToToggle) => {
        const rowIds = rowsToToggle.map(r => r.id);
        setSelectedIds(prev => {
          const allSelected = rowIds.length > 0 && rowIds.every(id => prev.has(id));
          const newSet = new Set(prev);
          if (allSelected) {
            rowIds.forEach(id => newSet.delete(id));
          } else {
            rowIds.forEach(id => newSet.add(id));
          }
          return newSet;
        });
      }, []);

      const toggleSelect = useCallback((e, id) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
        });
      }, []);

      const moveSelected = useCallback((targetZone) => {
        const idsToMove = new Set(selectedIds);
        if (idsToMove.size === 0) return;

        const byId = rowsByIdRef.current;
        const movingRows = [...byId.values()].filter((r) => idsToMove.has(r.id));
        if (movingRows.length === 0) return;

        const updateZone = (prev, zoneName) => {
          const affected = zoneName === targetZone || prev.some(r => idsToMove.has(r.id));
          if (!affected) return prev;
          const kept = prev.filter(r => !idsToMove.has(r.id));
          return zoneName === targetZone ? [...kept, ...movingRows] : kept;
        };

        setMasterRows(prev => updateZone(prev, 'master'));
        setCakadoRows(prev => updateZone(prev, 'cakado'));
        setBalkisRows(prev => updateZone(prev, 'balkis'));

        setSelectedIds(new Set());
      }, [selectedIds]);

      const moveSelectedDirectly = useCallback((row, targetZone) => {
        const setters = { master: setMasterRows, cakado: setCakadoRows, balkis: setBalkisRows };
        Object.entries(setters).forEach(([zoneName, setRows]) => {
          setRows(prev => {
            const present = prev.some(r => r.id === row.id);
            if (zoneName === targetZone) return present ? prev : [row, ...prev];
            return present ? prev.filter(r => r.id !== row.id) : prev;
          });
        });
      }, []);

      
      const renderFeeInputs = (fees, setFees, isLocked = false) => (
        <Card className="mt-4 p-4 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-ink flex items-center justify-between">
            <span>إعدادات الرسوم</span>
            {isLocked && <Badge variant="warning" className="uppercase tracking-wider font-mono">تلقائية 7/1/2</Badge>}
          </h4>
          {!isLocked && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="fee-delivery" className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">رسوم التوصيل (TND)</Label>
                <Input
                  id="fee-delivery"
                  type="number"
                  step="0.001"
                  min="0"
                  dir="ltr"
                  className="bg-surface-2 tabular-nums"
                  value={fees.delivery || 0}
                  onChange={e => setFees(prev => ({ ...prev, delivery: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="fee-return" className="block text-[11px] text-ink-soft mb-1 uppercase tracking-wide">رسوم الإرجاع (TND)</Label>
                <Input
                  id="fee-return"
                  type="number"
                  step="0.001"
                  min="0"
                  dir="ltr"
                  className="bg-surface-2 tabular-nums"
                  value={fees.return || 0}
                  onChange={e => setFees(prev => ({ ...prev, return: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )}
        </Card>
      );
      const netTotalRevenue = cakadoStats.netRule + balkisStats.netRule;
      
      const carrierBadge = activeCarrier === 'CONVERTY' ? 'First Delivery' :
                           activeCarrier === 'LOGISTA' ? 'BigBoss' :
                           activeCarrier === 'INTIGO' ? 'Intigo' :
                           activeCarrier === 'PAYMENT_RECEIPT' ? 'وصل استخلاص' :
                           activeCarrier || 'لا يوجد';

      const isIntigoLocked = activeCarrier === 'INTIGO';

      return (
        <div className="flex flex-col min-h-dvh pb-24 text-ink transition-colors duration-250">
          
          {/* Sticky Header Group */}
          <div className="sticky top-0 z-40 flex flex-col">
            {/* Command Bar */}
            <header className="bg-surface/95 backdrop-blur shadow-sm border-b border-line sheen">
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Row A on mobile, Left on desktop */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="text-[11px] uppercase tracking-wider font-bold">
                      {carrierBadge}
                    </Badge>
                    {isEnriching && (
                       <Progress
                         className="w-16 ms-2"
                         value={enrichProgress.current}
                         max={enrichProgress.total || 1}
                         label={`جاري الجلب: ${enrichProgress.current} من ${enrichProgress.total}`}
                       />
                    )}
                  </div>

                  <div className="flex flex-col items-end md:items-center shrink-0" aria-live="polite">
                    <span className="text-[10px] text-ink-faint uppercase tracking-wider mb-0.5">صافي الإيرادات / NET</span>
                    <span className="font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums" dir="ltr">
                      <AnimatedNumber value={netTotalRevenue} />
                    </span>
                  </div>
                </div>

                {/* Row B & C on mobile, Right on desktop */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
                  
                  {/* Row B: API Key */}
                  <div className="w-full md:w-auto flex items-center">
                    <div className="flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-full border border-line w-full md:w-48">
                      <input
                        type="password"
                        value={intigoApiKey}
                        onChange={(e) => setIntigoApiKey(e.target.value)}
                        onBlur={commitApiKey}
                        autoComplete="off"
                        spellCheck="false"
                        placeholder="ألصق مفتاح Intigo API هنا"
                        className="bg-transparent border-none outline-none text-xs w-full text-ink font-mono tracking-widest"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Row C: Controls */}
                  <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={handleClearCache} className="shrink-0 rounded-full min-h-[44px] font-bold" aria-label="مسح ذاكرة المنتجات" title="مسح ذاكرة المنتجات وتحديث الأسماء">مسح ذاكرة المنتجات</Button>
                    <span className={`shrink-0 w-2.5 h-2.5 rounded-full mx-1 ${effectiveHealthStatus === 'connected' ? 'bg-pos' : (effectiveHealthStatus === 'offline' || effectiveHealthStatus === 'endpoint_unknown') ? 'bg-warn animate-pulse' : effectiveHealthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}`} title={effectiveHealthStatus === 'connected' ? 'متصل' : effectiveHealthStatus === 'offline' ? 'غير متصل' : effectiveHealthStatus === 'endpoint_unknown' ? 'تعذّر التحقق من الصحة — سيتم التأكد عند أول طلب' : effectiveHealthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'}></span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={theme === 'console'}
                      aria-label={theme === 'console' ? "الوضع النهاري" : "الوضع الليلي"}
                      title={theme === 'console' ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
                      onClick={toggleTheme}
                      className="relative inline-flex shrink-0 items-center min-h-[44px] px-1 select-none cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] bg-transparent border-none"
                      style={{ transition: "background-color 250ms ease, border-color 250ms ease" }}
                    >
                      <span
                        dir="ltr"
                        className="relative flex w-14 h-8 shrink-0 items-center rounded-full border"
                        style={{
                          backgroundColor: theme === 'console' ? "var(--surface-2)" : "#E2E7EE",
                          borderColor: "var(--line)",
                          transition: "background-color 250ms ease"
                        }}
                      >
                        <span className="absolute start-1.5 text-[12px] leading-none" style={{ color: theme === 'console' ? "var(--ink-faint)" : "var(--warn)" }} aria-hidden="true">☀</span>
                        <span className="absolute end-1.5 text-[12px] leading-none" style={{ color: theme === 'console' ? "var(--brand)" : "var(--ink-faint)" }} aria-hidden="true">☾</span>
                        <span
                          className="absolute top-1 h-6 w-6 rounded-full shadow-sm flex items-center justify-center"
                          style={{
                            insetInlineStart: theme === 'console' ? "calc(100% - 1.75rem)" : "0.25rem",
                            backgroundColor: theme === 'console' ? "var(--brand)" : "#FFFFFF",
                            transition: "inset-inline-start 220ms cubic-bezier(.34,1.56,.64,1), background-color 250ms ease"
                          }}
                          aria-hidden="true"
                        />
                      </span>
                    </button>

                    <Button variant="outline" size="sm" onClick={handleNewCompanyClick} className="shrink-0 rounded-full min-h-[44px] font-bold" aria-label="مسح الجلسة الحالية والبدء بشركة توصيل أخرى" title="مسح الجلسة الحالية والبدء بشركة توصيل أخرى">
                      <span>شركة جديدة</span>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Search/Filter Bar */}
            <div className="bg-bg/95 backdrop-blur border-b border-line px-4 md:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="flex-1 flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-1.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all">
                <span className="text-ink-soft text-sm">🔍</span>
                <input 
                  type="text" 
                  className="bg-transparent border-none outline-none w-full text-sm text-ink placeholder-ink-faint"
                  placeholder="بحث عن منتج، باركود، هاتف..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {['all', 'delivered', 'returned', 'in_progress', 'cancelled', 'error'].map(status => {
                  const label = status === 'all' ? 'الكل' : status === 'delivered' ? 'مُسلّم' : status === 'returned' ? 'مسترجع' : status === 'in_progress' ? 'قيد التنفيذ' : status === 'cancelled' ? 'ملغي' : '⚠ خطأ';
                  const active = filterStatus === status;
                  return (
                    <Button
                      key={status}
                      size="sm"
                      aria-pressed={active}
                      onClick={() => setFilterStatus(status)}
                      variant={active ? 'default' : 'outline'}
                      className={`rounded-full min-h-[44px] whitespace-nowrap ${active ? 'bg-ink text-surface hover:opacity-90' : 'text-ink-soft hover:bg-surface-2'}`}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <NativeSelect
                  className="text-xs py-1.5"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="ترتيب النتائج"
                >
                  <option value="default">الترتيب الافتراضي</option>
                  <option value="price-desc">السعر (الأعلى)</option>
                  <option value="price-asc">السعر (الأقل)</option>
                  <option value="city">الولاية</option>
                  <option value="status">الحالة</option>
                  <option value="product">الاسم (أ - ي)</option>
                </NativeSelect>
              </div>
            </div>
          </div>
        </div>

          <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
            {/* Upload Zone */}
            {(!masterRows.length && !cakadoRows.length && !balkisRows.length && !receiptSummary) && (
              <label 
                className={`border-2 border-dashed border-line bg-surface transition-colors rounded-xl p-12 flex flex-col items-center justify-center text-center group ${isReadingFile ? 'opacity-60 pointer-events-none' : 'hover:bg-surface-2 cursor-pointer'}`}
                onDrop={onDropFile}
                onDragOver={handleDragOver}
              >
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                {isReadingFile ? (
                  <>
                    <span className="font-display text-xl text-ink mb-2" role="status">جارٍ قراءة الملف...</span>
                    <span className="text-sm text-ink-soft">لحظات من فضلك</span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-xl text-ink mb-2">اسحب الطلبات إلى هنا</span>
                    <span className="text-sm text-ink-soft">أو انقر لاختيار ملف (.xlsx, .csv)</span>
                  </>
                )}
                <span className="text-xs text-ink-faint mt-4 bg-surface-2 px-3 py-1.5 rounded-full">الحالات محدّثة حتى تاريخ تصدير الملف — أعد رفع الملف لتحديثها.</span>
                <input type="file" accept=".xlsx,.csv" className="hidden" onChange={onFileInputChange} />
              </label>
            )}

            {/* Toasts / Errors */}
            {error && (
              <Alert variant="warning" className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <AlertTitle className="font-medium">{error}</AlertTitle>
              </Alert>
            )}
            {autoFeesInfo && (
              <Alert variant="positive" className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <AlertTitle className="font-medium">تم ضبط الرسوم تلقائياً من Logista.</AlertTitle>
              </Alert>
            )}
            
            {unrecognizedStatuses.length > 0 && (
              <Alert variant="warning" className="flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <AlertDescription className="flex-1">
                  <AlertTitle className="mb-1">حالات غير معروفة لم تُحتسب ضمن الإيرادات — راجع التصنيف:</AlertTitle>
                  <p className="text-xs opacity-80 font-mono" dir="ltr">{unrecognizedStatuses.slice(0, 6).join(', ')}{unrecognizedStatuses.length > 6 ? ' و...' : ''}</p>
                </AlertDescription>
                <Button variant="ghost" size="icon-sm" onClick={() => setUnrecognizedStatuses([])} className="absolute start-1 top-1 opacity-60 hover:opacity-100 min-h-[44px] min-w-[44px]" aria-label="إخفاء التحذير">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </Button>
              </Alert>
            )}
            
            {duplicateNids.length > 0 && (
              <Alert variant="warning" className="flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <AlertDescription className="flex-1">
                  <AlertTitle className="mb-1">تم العثور على {duplicateNids.length} معرفات (NID) مكررة في الملف وتم تجاهل التكرار:</AlertTitle>
                  <p className="text-xs opacity-80 font-mono" dir="ltr">{duplicateNids.slice(0, 6).join(', ')}{duplicateNids.length > 6 ? ' و...' : ''}</p>
                </AlertDescription>
                <Button variant="ghost" size="icon-sm" onClick={() => setDuplicateNids([])} className="absolute start-1 top-1 opacity-60 hover:opacity-100 min-h-[44px] min-w-[44px]" aria-label="إخفاء التحذير">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </Button>
              </Alert>
            )}
            
            {!dismissedUnknownGovs && (cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (
               (() => {
                 const unk = [...new Set([...cakadoStats.newUnknownGovs, ...balkisStats.newUnknownGovs])];
                 if (unk.length > 0) {
return (
                      <Alert variant="warning" className="flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <AlertDescription className="flex-1">
                           <AlertTitle className="mb-1">ولايات غير معروفة في خريطة الرسوم (تم احتساب 2 د.ت):</AlertTitle>
                           <p className="text-xs opacity-80" dir="ltr">{unk.slice(0, 6).join(', ')}{unk.length > 6 ? ' و...' : ''}</p>
                           <p className="text-xs opacity-80 mt-1">أضفها لتفادي الخطأ.</p>
                        </AlertDescription>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDismissedUnknownGovs(true)} className="absolute start-1 top-1 opacity-60 hover:opacity-100 min-h-[44px] min-w-[44px]" aria-label="إخفاء التحذير">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </Button>
                     </Alert>
                    );
                 }
                 return null;
               })()
            )}
            

            {receiptSummary && (
              <Card className="p-6 bg-surface border border-line">
                <div className="flex items-center justify-between mb-4 border-b border-line pb-3">
                  <div>
                    <h2 className="text-xl font-bold font-display text-ink">وصل استخلاص</h2>
                    <p className="text-xs text-ink-soft mt-0.5">ملخص الدفع المباشر من شركة التوصيل</p>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono font-bold">
                    REÇU DE PAIEMENT
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-surface-2 p-3 rounded-lg border border-line">
                    <span className="text-[10px] uppercase text-ink-faint block mb-1">المبلغ المحصّل (COD)</span>
                    <span className="text-xl font-mono font-bold text-ink tabular-nums" dir="ltr">
                      {formatTND(receiptSummary.cod || 0)}
                    </span>
                  </div>
                  <div className="bg-surface-2 p-3 rounded-lg border border-line">
                    <span className="text-[10px] uppercase text-ink-faint block mb-1">طرد مسلّم</span>
                    <span className="text-xl font-mono font-bold text-pos tabular-nums">
                      {receiptSummary.deliveredCount || 0}
                    </span>
                    {(receiptSummary.deliveryFees != null) && (
                      <span className="text-[10px] text-ink-soft block mt-0.5" dir="ltr">
                        {formatTND(receiptSummary.deliveryFees)} مصاريف
                      </span>
                    )}
                  </div>
                  <div className="bg-surface-2 p-3 rounded-lg border border-line">
                    <span className="text-[10px] uppercase text-ink-faint block mb-1">طرد مسترجع</span>
                    <span className="text-xl font-mono font-bold text-neg tabular-nums">
                      {receiptSummary.returnedCount || 0}
                    </span>
                    {(receiptSummary.returnFees != null) && (
                      <span className="text-[10px] text-ink-soft block mt-0.5" dir="ltr">
                        {formatTND(receiptSummary.returnFees)} مصاريف
                      </span>
                    )}
                  </div>
                  <div className="bg-surface-2 p-3 rounded-lg border border-line">
                    <span className="text-[10px] uppercase text-ink-faint block mb-1">الصافي للدفع</span>
                    <span className="text-xl font-mono font-bold text-brand tabular-nums" dir="ltr">
                      {formatTND(receiptSummary.amountToPay || 0)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-line pt-3">
                  <details className="text-xs text-ink-soft">
                    <summary className="cursor-pointer hover:text-ink font-medium select-none">
                      عرض كامل البنود
                    </summary>
                    <table className="w-full mt-3 font-mono text-xs">
                      <tbody>
                        {Object.entries(receiptSummary).map(([k, v]) => (
                          <tr key={k} className="border-b border-line/40 last:border-none">
                            <td className="py-1 text-ink-soft">{k}</td>
                            <td className="py-1 text-end text-ink tabular-nums" dir="ltr">
                              {typeof v === 'number' && k.toLowerCase().includes('count')
                                ? v
                                : formatTND(v)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </div>
              </Card>
            )}

            {(masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) && (
              <React.Fragment>
                {/* Instruments */}
                <div className="flex flex-col md:flex-row gap-6">
                  <BrandSummaryCard title="كاكادو (CAKADO)" stats={cakadoStats} />
                  <BrandSummaryCard title="بلقيس (Balkis)" stats={balkisStats} />
                </div>

                {/* Trays */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="order-1 lg:order-none"><ZoneTable 
  selectedIds={selectedIds}
  onToggleSelectAll={toggleSelectAll}
  onDrop={handleDrop}
  onToggleSelect={toggleSelect}
  onDragStart={handleDragStart}
  onMoveDirect={moveSelectedDirectly}
  onRetry={handleRetryEnrichment}
  rows={viewMaster} title='غير مصنفة' zone='master' selectable={true} accentColor='' /></div>
                  <div className="order-2 lg:order-none">
                    <ZoneTable 
  selectedIds={selectedIds}
  onToggleSelectAll={toggleSelectAll}
  onDrop={handleDrop}
  onToggleSelect={toggleSelect}
  onDragStart={handleDragStart}
  onMoveDirect={moveSelectedDirectly}
  onRetry={handleRetryEnrichment}
  rows={viewCakado} title='كاكادو' zone='cakado' selectable={true} accentColor='var(--brand)' />
                    {renderFeeInputs(cakadoFees, setCakadoFees, isIntigoLocked)}
                  </div>
                  <div className="order-3 lg:order-none">
                    <ZoneTable 
  selectedIds={selectedIds}
  onToggleSelectAll={toggleSelectAll}
  onDrop={handleDrop}
  onToggleSelect={toggleSelect}
  onDragStart={handleDragStart}
  onMoveDirect={moveSelectedDirectly}
  onRetry={handleRetryEnrichment}
  rows={viewBalkis} title='بلقيس' zone='balkis' selectable={true} accentColor='#3b82f6' />
                    {renderFeeInputs(balkisFees, setBalkisFees, isIntigoLocked)}
                  </div>
                </div>
              </React.Fragment>
            )}

            {/* Floating Selection Bar */}
            {selectedIds.size > 0 && (
              <div className="fixed inset-x-0 bottom-0 p-4 z-50 pointer-events-none">
                <div className="max-w-3xl mx-auto bg-surface border border-line text-ink rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto surface-highlight">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start px-2">
                    <div className="flex items-center gap-2">
                      <Badge className="font-bold shadow-sm">{selectedIds.size}</Badge>
                      <span className="text-ink-soft font-medium text-sm">محدد</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-ink-faint hover:text-ink font-medium">إلغاء</Button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    <Button variant="secondary" size="lg" onClick={() => moveSelected('master')} className="flex-1 sm:flex-none rounded-xl whitespace-nowrap font-bold">
                      إلى غير مصنفة
                    </Button>
                    <Button size="lg" onClick={() => moveSelected('cakado')} className="flex-1 sm:flex-none rounded-xl whitespace-nowrap font-bold shadow-sm shadow-brand/20">
                      تعيين كاكادو
                    </Button>
                    <Button size="lg" onClick={() => moveSelected('balkis')} className="flex-1 sm:flex-none rounded-xl whitespace-nowrap font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-600/20">
                      تعيين بلقيس
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reset Modal */}
            {showResetModal && (
              <Suspense fallback={null}>
                <ConfirmDialog
                  open
                  onOpenChange={(open) => setShowResetModal(open)}
                  title="بدء جلسة جديدة؟"
                  description="سيتم مسح جميع الطلبات المصنّفة والنتائج الحالية لشركة التوصيل هذه. لا يمكن التراجع عن هذا الإجراء."
                  cancelLabel="إلغاء"
                  actionLabel="مسح والبدء"
                  actionVariant="destructive"
                  onAction={resetSession}
                />
              </Suspense>
            )}
            {/* Scroll Nav FABs */}
            <div className={`fixed end-4 sm:end-8 flex flex-col gap-2 z-40 transition-all duration-300 ${selectedIds.size > 0 ? 'bottom-[100px]' : 'bottom-6'}`}>
               <Button variant="ghost" size="icon" onClick={scrollToTop} className={`p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${scrollPos.top ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`} aria-label="أعلى الصفحة">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
               </Button>
               <Button variant="ghost" size="icon" onClick={scrollToBottom} className={`p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${scrollPos.bottom ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`} aria-label="أسفل الصفحة">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </Button>
            </div>
          </main>
        </div>
      );
    }

