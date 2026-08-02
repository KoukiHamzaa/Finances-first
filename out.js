import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  startTransition
} = React;
const RowCard = React.memo(({
  row,
  selectable,
  selected,
  onToggle,
  onDragStart,
  zone,
  onMoveDirect,
  onRetry
}) => {
  const govInfo = resolveGov(row.city);
  const statusPills = {
    'delivered': {
      label: 'مُسلّم',
      colors: 'bg-pos/10 text-pos'
    },
    'returned': {
      label: 'مسترجع',
      colors: 'bg-neg/10 text-neg'
    },
    'cancelled': {
      label: 'ملغي',
      colors: 'bg-ink-faint/10 text-ink-faint line-through'
    },
    'exchange': {
      label: 'تبادل',
      colors: 'bg-warn/10 text-warn'
    },
    'in_progress': {
      label: 'قيد التنفيذ',
      colors: 'bg-brand/10 text-brand'
    },
    'return_in_progress': {
      label: 'إرجاع قيد التنفيذ',
      colors: 'bg-brand/10 text-brand'
    },
    'other': {
      label: 'أخرى',
      colors: 'bg-surface-2 text-ink-soft'
    }
  };
  const pill = statusPills[row.status] || statusPills['other'];
  return /*#__PURE__*/_jsxDEV("div", {
    draggable: true,
    onDragStart: e => onDragStart(e, row.id),
    onClick: selectable ? e => onToggle(e, row.id) : undefined,
    className: `bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative
                      ${selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md'} 
                      ${selected ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line'}
                    `,
    style: i < 12 ? {
      animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both`
    } : {},
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "flex items-start gap-3",
      children: [selectable && /*#__PURE__*/_jsxDEV("input", {
        type: "checkbox",
        className: "w-5 h-5 mt-0.5 rounded cursor-pointer accent-brand",
        checked: selected,
        onChange: e => onToggle(e, row.id),
        onClick: e => e.stopPropagation()
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "flex-1 min-w-0 flex flex-col gap-2",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex justify-between items-start gap-2",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex items-start gap-2 min-w-0",
            children: [row.carrier === 'INTIGO' && /*#__PURE__*/_jsxDEV("span", {
              className: "flex-shrink-0 mt-0.5",
              title: row.enrichState === 'fetched' ? 'تم جلب الاسم' : row.enrichState === 'blocked' ? 'بانتظار المفتاح' : row.enrichState === 'not_found' ? 'لم يُعثر على المنتج' : row.enrichState === 'error' ? 'فشل الطلب — أعد المحاولة' : 'جاري الجلب...',
              children: row.enrichState === 'fetched' ? /*#__PURE__*/_jsxDEV("span", {
                className: "text-pos",
                children: "✓"
              }, void 0, false) : row.enrichState === 'blocked' || row.enrichState === 'not_found' ? /*#__PURE__*/_jsxDEV("span", {
                className: "text-warn",
                children: "⚠"
              }, void 0, false) : row.enrichState === 'error' ? /*#__PURE__*/_jsxDEV("span", {
                className: "text-neg",
                children: "✗"
              }, void 0, false) : /*#__PURE__*/_jsxDEV("span", {
                className: "text-brand animate-pulse",
                children: "⏳"
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "font-medium text-[14px] text-ink leading-tight flex flex-wrap items-center gap-1",
              children: [row.productName, row.carrier === 'INTIGO' && String(row.productName).trim().toLowerCase() === 'colis' && /*#__PURE__*/_jsxDEV("span", {
                className: "text-warn text-[10px] ml-1 flex items-center",
                title: "الوصف افتراضي من Intigo — لم يُحدَّد اسم منتج",
                children: "⚠"
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
            className: "font-mono font-bold text-ink tabular-nums whitespace-nowrap text-[14px]",
            dir: "ltr",
            children: row.status === 'delivered' ? formatTND(row.totalSales) : /*#__PURE__*/_jsxDEV("span", {
              className: "text-ink-faint",
              children: "—"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-wrap items-center gap-2 text-[11px]",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "font-mono text-ink-faint uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 rounded",
            dir: "ltr",
            children: row.nid || row.barcode || 'N/A'
          }, void 0, false), row.city && /*#__PURE__*/_jsxDEV("span", {
            className: `px-1.5 py-0.5 rounded ${row.carrier === 'INTIGO' ? govInfo.isGrandTunis ? 'bg-brand/10 text-brand' : govInfo.unknown ? 'border border-warn text-warn' : 'bg-warn/10 text-warn' : 'bg-surface-2 text-ink-soft'}`,
            children: [row.city, " ", row.carrier === 'INTIGO' && govInfo.isGrandTunis && 'إرجاع 1', row.carrier === 'INTIGO' && !govInfo.isGrandTunis && 'إرجاع 2']
          }, void 0, true), row.phone && /*#__PURE__*/_jsxDEV("span", {
            className: "text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded",
            dir: "ltr",
            children: row.phone
          }, void 0, false), row.status === 'delivered' && row.totalSales === 0 && /*#__PURE__*/_jsxDEV("span", {
            className: "bg-pos/20 text-pos px-1.5 py-0.5 rounded font-medium",
            children: "مدفوع مسبقاً"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "flex justify-between items-center mt-1",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex items-center gap-2",
            children: [/*#__PURE__*/_jsxDEV("span", {
              className: `px-2 py-0.5 rounded text-[11px] font-medium ${pill.colors}`,
              title: row.originalStatusText,
              children: [pill.label, " ", row.status === 'in_progress' && '⚠']
            }, void 0, true), row.hasError && /*#__PURE__*/_jsxDEV("button", {
              onClick: e => onRetry(e, row),
              className: "text-[11px] text-brand hover:underline flex items-center gap-1 min-h-[44px] px-2",
              children: "⚠ إعادة المحاولة"
            }, void 0, false)]
          }, void 0, true), row.carrier_fee != null && /*#__PURE__*/_jsxDEV("div", {
            className: "flex flex-col text-[10px] items-end",
            dir: "ltr",
            children: /*#__PURE__*/_jsxDEV("span", {
              className: `tabular-nums font-mono ${row.fee_delta > 0 ? 'text-neg' : row.fee_delta < 0 ? 'text-pos' : 'text-ink-soft opacity-60'}`,
              children: [row.fee_delta < 0 ? '−' : row.fee_delta > 0 ? '+' : '', formatTND(Math.abs(row.fee_delta))]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100",
            children: zone === 'master' ? /*#__PURE__*/_jsxDEV(React.Fragment, {
              children: [/*#__PURE__*/_jsxDEV("button", {
                onClick: e => {
                  e.stopPropagation();
                  onMoveDirect(row, 'cakado');
                },
                className: "text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]",
                children: "→ كاكادو"
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                onClick: e => {
                  e.stopPropagation();
                  onMoveDirect(row, 'balkis');
                },
                className: "text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]",
                children: "→ بلقيس"
              }, void 0, false)]
            }, void 0, true) : /*#__PURE__*/_jsxDEV("button", {
              onClick: e => {
                e.stopPropagation();
                onMoveDirect(row, 'master');
              },
              className: "text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]",
              children: "↩ إلغاء"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)
  }, row.id, false);
}, (prevProps, nextProps) => {
  return prevProps.selected === nextProps.selected && prevProps.selectable === nextProps.selectable && prevProps.row.id === nextProps.row.id && prevProps.row.status === nextProps.row.status && prevProps.row.enrichState === nextProps.row.enrichState && prevProps.row.productName === nextProps.row.productName && prevProps.row.totalSales === nextProps.row.totalSales && prevProps.row.city === nextProps.row.city;
});
const EnrichmentProgress = () => {
  const [progress, setProgress] = useState(progressStore.get());
  useEffect(() => progressStore.subscribe(() => setProgress(progressStore.get())), []);
  if (progress.total === 0 || progress.current === progress.total) return null;
  const pct = Math.round(progress.current / progress.total * 100);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "bg-surface border p-3 rounded-xl shadow-sm mb-4",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "flex justify-between items-end mb-2",
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: "font-bold text-sm text-ink",
        children: "جاري جلب الأسماء (Intigo)..."
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "font-mono text-xs text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full",
        dir: "ltr",
        children: [progress.current, " / ", progress.total]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "h-2 bg-line rounded-full overflow-hidden w-full relative",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "absolute top-0 left-0 h-full bg-brand rounded-full transition-all duration-300",
        style: {
          width: `${pct}%`
        }
      }, void 0, false)
    }, void 0, false), progress.errors > 0 && /*#__PURE__*/_jsxDEV("p", {
      className: "text-[10px] text-warn mt-1.5 flex items-center gap-1",
      children: [/*#__PURE__*/_jsxDEV("span", {
        children: "⚠"
      }, void 0, false), " فشل جلب ", progress.errors, " طلبات."]
    }, void 0, true)]
  }, void 0, true);
};
const AnimatedNumber = React.memo(({
  value
}) => {
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
  return /*#__PURE__*/_jsxDEV(React.Fragment, {
    children: formatTND(displayValue)
  }, void 0, false);
});
function App() {
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
    const handleBeforeUnload = e => {
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
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(progressStore.get());
  useEffect(() => progressStore.subscribe(() => setEnrichProgress(progressStore.get())), []);
  const currentUploadId = useRef(0);
  const [scrollPos, setScrollPos] = useState({
    top: true,
    bottom: false
  });
  useEffect(() => {
    const handleScroll = () => {
      const isTop = window.scrollY < 100;
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setScrollPos({
        top: isTop,
        bottom: isBottom
      });
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    handleScroll();
    // observe DOM changes to update bottom detection
    const observer = new MutationObserver(handleScroll);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);
  const scrollToTop = () => window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  const scrollToBottom = () => window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });
  const [showResetModal, setShowResetModal] = useState(false);

  // Per-Brand Fee Structure
  const [cakadoFees, setCakadoFees] = useState({
    delivery: 0,
    return: 0
  });
  const [balkisFees, setBalkisFees] = useState({
    delivery: 0,
    return: 0
  });
  const [dismissedUnknownGovs, setDismissedUnknownGovs] = useState(false);
  const [duplicateNids, setDuplicateNids] = useState([]);
  const [unrecognizedStatuses, setUnrecognizedStatuses] = useState([]);
  const [healthStatus, setHealthStatus] = useState('checking');
  useEffect(() => {
    const t = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => checkHealth(intigoApiKey, setHealthStatus));
      } else {
        checkHealth(intigoApiKey, setHealthStatus);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [intigoApiKey]);
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
    progressStore.set({
      current: 0,
      total: 0,
      errors: 0
    });
    setCakadoFees({
      delivery: 0,
      return: 0
    });
    setBalkisFees({
      delivery: 0,
      return: 0
    });
    setShowResetModal(false);
    setDuplicateNids([]);
    setUnrecognizedStatuses([]);
    setDismissedUnknownGovs(false);
  }, []);
  const handleNewCompanyClick = () => {
    const isDirty = masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0 || activeCarrier || isEnriching;
    if (isDirty) {
      setShowResetModal(true);
    } else {
      resetSession();
    }
  };
  const CACHE_KEY_PREFIX = 'intigo_nid_';
  ;
  const handleClearCache = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    if (activeCarrier === 'INTIGO') {
      if (!intigoApiKey || !intigoApiKey.trim()) {
        setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
        return;
      }
      const updateArr = arr => arr.map(r => ({
        ...r,
        needsEnrichment: true,
        enrichState: 'pending',
        productName: 'جاري الجلب...'
      }));
      let allToEnrich = [];
      setMasterRows(prev => {
        const n = updateArr(prev);
        allToEnrich.push(...n);
        return n;
      });
      setCakadoRows(prev => {
        const n = updateArr(prev);
        allToEnrich.push(...n);
        return n;
      });
      setBalkisRows(prev => {
        const n = updateArr(prev);
        allToEnrich.push(...n);
        return n;
      });
      const thisUploadId = currentUploadId.current;
      setTimeout(() => enrichIntigoRows(allToEnrich, intigoApiKey, thisUploadId, {
        setIsEnriching,
        setHealthStatus,
        setError,
        checkIsCancelled: function () {
          return thisUploadId !== currentUploadId.current;
        },
        onBatchResolved: batch => {
          const updateArr = arr => arr.map(pr => {
            const updated = batch.find(ur => ur.id === pr.id);
            return updated ? {
              ...pr,
              productName: updated.productName,
              phone: updated.phone,
              needsEnrichment: updated.needsEnrichment,
              hasError: updated.hasError,
              enrichState: updated.enrichState
            } : pr;
          });
          setMasterRows(prev => updateArr(prev));
          setCakadoRows(prev => updateArr(prev));
          setBalkisRows(prev => updateArr(prev));
        }
      }), 0);
    }
  };
  ;
  ;
  ;

  // Drag and drop mechanics
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };
  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    // Locate row across all three arrays
    let row = masterRows.find(r => r.id === id) || cakadoRows.find(r => r.id === id) || balkisRows.find(r => r.id === id);
    if (!row) return;

    // Remove from all three simultaneously
    setMasterRows(prev => prev.filter(r => r.id !== id));
    setCakadoRows(prev => prev.filter(r => r.id !== id));
    setBalkisRows(prev => prev.filter(r => r.id !== id));

    // Append to the target zone's array
    if (targetZone === 'master') {
      setMasterRows(prev => [...prev, row]);
    } else if (targetZone === 'cakado') {
      setCakadoRows(prev => [...prev, row]);
    } else if (targetZone === 'balkis') {
      setBalkisRows(prev => [...prev, row]);
    }
  };
  const handleDragOver = e => {
    e.preventDefault();
  };
  const handleRetryEnrichment = (e, row) => {
    e.stopPropagation();
    if (!intigoApiKey || !intigoApiKey.trim()) {
      setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
      return;
    }
    const updateArr = arr => arr.map(r => r.id === row.id ? {
      ...r,
      enrichState: 'pending',
      productName: 'جاري الجلب...',
      hasError: false,
      needsEnrichment: true
    } : r);
    setMasterRows(prev => updateArr(prev));
    setCakadoRows(prev => updateArr(prev));
    setBalkisRows(prev => updateArr(prev));
    const thisUploadId = currentUploadId.current;
    enrichIntigoRows([{
      ...row,
      needsEnrichment: true
    }], intigoApiKey, thisUploadId, {
      setIsEnriching,
      setHealthStatus,
      setError,
      checkIsCancelled: function () {
        return thisUploadId !== currentUploadId.current;
      },
      onBatchResolved: batch => {
        const updateArr = arr => arr.map(pr => {
          const updated = batch.find(ur => ur.id === pr.id);
          return updated ? {
            ...pr,
            productName: updated.productName,
            phone: updated.phone,
            needsEnrichment: updated.needsEnrichment,
            hasError: updated.hasError,
            enrichState: updated.enrichState
          } : pr;
        });
        setMasterRows(prev => updateArr(prev));
        setCakadoRows(prev => updateArr(prev));
        setBalkisRows(prev => updateArr(prev));
      }
    });
  };
  const handleFileUpload = useCallback(file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const workbook = XLSX.read(new Uint8Array(e.target.result), {
          type: 'array'
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ''
        });
        const template = detectTemplate(rawRows);
        let result;
        if (template === 'CONVERTY') result = parseConverty(rawRows);else if (template === 'LOGISTA') result = parseLogista(rawRows);else if (template === 'INTIGO') result = parseIntigo(rawRows);else {
          setError('خطأ: تنسيق الملف غير معروف. يُقبل ملفات Converty أو Logista أو Intigo فقط.');
          return;
        }
        if (result.rows.length === 0) {
          setError('خطأ: الملف لا يحتوي على أي بيانات تخص التوصيل أو الإرجاع.');
          return;
        }
        resetSession();
        const thisUploadId = currentUploadId.current;

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
            const blockedRows = result.rows.map(r => ({
              ...r,
              enrichState: 'blocked',
              productName: '— (بانتظار المفتاح)',
              needsEnrichment: true,
              hasError: false
            }));
            setMasterRows(blockedRows);
          } else {
            const pendingRows = result.rows.map(r => ({
              ...r,
              enrichState: 'pending',
              needsEnrichment: true,
              hasError: false,
              productName: 'جاري الجلب...'
            }));
            setMasterRows(pendingRows);
            enrichIntigoRows(pendingRows, intigoApiKey, thisUploadId, {
              setIsEnriching,
              setHealthStatus,
              setError,
              checkIsCancelled: () => thisUploadId !== currentUploadId.current,
              onBatchResolved: batch => {
                const updateArr = arr => arr.map(pr => {
                  const updated = batch.find(ur => ur.id === pr.id);
                  return updated ? {
                    ...pr,
                    productName: updated.productName,
                    phone: updated.phone,
                    needsEnrichment: updated.needsEnrichment,
                    hasError: updated.hasError,
                    enrichState: updated.enrichState
                  } : pr;
                });
                setMasterRows(prev => updateArr(prev));
                setCakadoRows(prev => updateArr(prev));
                setBalkisRows(prev => updateArr(prev));
              }
            });
          }
        }
      } catch (err) {
        setError('خطأ: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [intigoApiKey]);
  const onFileInputChange = useCallback(e => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  }, [handleFileUpload]);
  const onDropFile = useCallback(e => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Number Formatting

  ;
  const getDerivedView = sourceArray => {
    return useMemo(() => {
      let res = [...sourceArray];

      // Apply Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        res = res.filter(r => r.productName && r.productName.toLowerCase().includes(q) || r.nid && String(r.nid).toLowerCase().includes(q) || r.barcode && String(r.barcode).toLowerCase().includes(q) || r.phone && String(r.phone).includes(q));
      }

      // Apply Filter
      if (filterStatus === 'delivered') res = res.filter(r => r.status === 'delivered');
      if (filterStatus === 'returned') res = res.filter(r => r.status === 'returned');
      if (filterStatus === 'in_progress') res = res.filter(r => r.status === 'in_progress' || r.status === 'return_in_progress');
      if (filterStatus === 'cancelled') res = res.filter(r => r.status === 'cancelled');
      if (filterStatus === 'error') res = res.filter(r => r.hasError);

      // Apply Sort
      if (sortOption === 'price-desc') res.sort((a, b) => b.totalSales - a.totalSales);
      if (sortOption === 'price-asc') res.sort((a, b) => a.totalSales - b.totalSales);
      if (sortOption === 'city') res.sort((a, b) => String(a.city || '').localeCompare(String(b.city || '')));
      if (sortOption === 'status') res.sort((a, b) => a.status.localeCompare(b.status));
      if (sortOption === 'product') res.sort((a, b) => a.productName.localeCompare(b.productName, 'ar', {
        sensitivity: 'base'
      }));
      return res;
    }, [sourceArray, searchQuery, filterStatus, sortOption]);
  };
  const viewMaster = getDerivedView(masterRows);
  const viewCakado = getDerivedView(cakadoRows);
  const viewBalkis = getDerivedView(balkisRows);
  const cakadoStats = calculateStats(cakadoRows, cakadoFees);
  const balkisStats = calculateStats(balkisRows, balkisFees);
  const toggleSelectAll = rowsToToggle => {
    const rowIds = rowsToToggle.map(r => r.id);
    const allSelected = rowIds.length > 0 && rowIds.every(id => selectedIds.has(id));
    if (allSelected) {
      const newSet = new Set(selectedIds);
      rowIds.forEach(id => newSet.delete(id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      rowIds.forEach(id => newSet.add(id));
      setSelectedIds(newSet);
    }
  };
  const toggleSelect = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);else newSet.add(id);
    setSelectedIds(newSet);
  };
  const moveSelected = targetZone => {
    const idsToMove = new Set(selectedIds);

    // Gather from all first:
    const allRows = [...masterRows, ...cakadoRows, ...balkisRows];
    const movingRows = allRows.filter(r => idsToMove.has(r.id));
    setMasterRows(prev => {
      const kept = prev.filter(r => !idsToMove.has(r.id));
      return targetZone === 'master' ? [...kept, ...movingRows] : kept;
    });
    setCakadoRows(prev => {
      const kept = prev.filter(r => !idsToMove.has(r.id));
      return targetZone === 'cakado' ? [...kept, ...movingRows] : kept;
    });
    setBalkisRows(prev => {
      const kept = prev.filter(r => !idsToMove.has(r.id));
      return targetZone === 'balkis' ? [...kept, ...movingRows] : kept;
    });
    setSelectedIds(new Set());
  };
  const moveSelectedDirectly = (row, targetZone) => {
    setMasterRows(prev => prev.filter(r => r.id !== row.id));
    setCakadoRows(prev => prev.filter(r => r.id !== row.id));
    setBalkisRows(prev => prev.filter(r => r.id !== row.id));
    if (targetZone === 'master') setMasterRows(prev => [row, ...prev]);
    if (targetZone === 'cakado') setCakadoRows(prev => [row, ...prev]);
    if (targetZone === 'balkis') setBalkisRows(prev => [row, ...prev]);
  };
  const ZoneTable = ({
    rows,
    title,
    zone,
    selectable = false,
    accentColor = ''
  }) => {
    const [visibleCount, setVisibleCount] = useState(20);
    const sentinelRef = useRef(null);
    useEffect(() => {
      setVisibleCount(20);
    }, [rows]);
    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && visibleCount < rows.length) {
          setVisibleCount(prev => prev + 20);
        }
      }, {
        rootMargin: '200px'
      });
      if (sentinelRef.current) observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    }, [visibleCount, rows.length]);
    const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
    const delCount = rows.filter(r => r.status === 'delivered').length;
    const retCount = rows.filter(r => r.status === 'returned').length;
    const inProgCount = rows.filter(r => r.status === 'in_progress' || r.status === 'return_in_progress').length;
    const cancelCount = rows.filter(r => r.status === 'cancelled').length;
    const exchCount = rows.filter(r => r.status === 'exchange').length;
    let headerCounts = [];
    if (delCount > 0) headerCounts.push('مسلّم ' + delCount);
    if (retCount > 0) headerCounts.push('مسترجع ' + retCount);
    if (inProgCount > 0) headerCounts.push('قيد التنفيذ ' + inProgCount);
    if (cancelCount > 0) headerCounts.push('ملغي ' + cancelCount);
    if (exchCount > 0) headerCounts.push('تبادل ' + exchCount);
    const prepaidCount = rows.filter(r => r.status === 'delivered' && r.totalSales === 0).length;
    if (prepaidCount > 0) headerCounts.push('مدفوع مسبقاً: ' + prepaidCount);
    return /*#__PURE__*/_jsxDEV("div", {
      className: "bg-surface rounded-xl shadow-sm border border-line flex flex-col h-full min-h-[400px] relative overflow-hidden transition-transform duration-200",
      onDrop: e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        handleDrop(e, zone);
      },
      onDragOver: e => {
        e.preventDefault();
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = accentColor ? `0 -2px 10px ${accentColor}33` : '0 -2px 10px rgba(0,0,0,0.05)';
      },
      onDragLeave: e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      },
      children: [accentColor && /*#__PURE__*/_jsxDEV("div", {
        className: "absolute top-0 left-0 right-0 h-1",
        style: {
          backgroundColor: accentColor
        }
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "bg-surface-2 p-4 border-b border-line flex justify-between items-center",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex items-center gap-3",
          children: [selectable && /*#__PURE__*/_jsxDEV("input", {
            type: "checkbox",
            className: "w-4 h-4 rounded cursor-pointer accent-brand",
            checked: allSelected,
            onChange: () => toggleSelectAll(rows)
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "font-display text-lg text-ink",
            children: title
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-col items-end text-right",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "bg-line text-ink text-xs px-2 py-0.5 rounded-full tabular-nums font-bold",
            children: rows.length
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "text-[10px] text-ink-faint mt-1 tabular-nums max-w-[200px] break-words",
            children: headerCounts.join(' • ')
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative",
        children: [rows.length === 0 && /*#__PURE__*/_jsxDEV("div", {
          className: "absolute inset-4 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-center p-4",
          children: /*#__PURE__*/_jsxDEV("span", {
            className: "text-sm text-ink-soft",
            children: "اسحب الطلبات إلى هنا، أو حدّدها ثم انقر للتعيين"
          }, void 0, false)
        }, void 0, false), rows.slice(0, visibleCount).map(row => /*#__PURE__*/_jsxDEV(RowCard, {
          row: row,
          selectable: selectable,
          selected: selectedIds.has(row.id),
          onToggle: toggleSelect,
          onDragStart: handleDragStart,
          zone: zone,
          onMoveDirect: moveSelectedDirectly,
          onRetry: handleRetryEnrichment
        }, row.id, false)), visibleCount < rows.length && /*#__PURE__*/_jsxDEV("div", {
          ref: sentinelRef,
          className: "h-4 w-full"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true);
  };
  const renderFeeInputs = (fees, setFees, isLocked = false) => /*#__PURE__*/_jsxDEV("div", {
    className: "mt-4 bg-surface p-4 rounded-xl shadow-sm border border-line flex flex-col gap-3",
    children: [/*#__PURE__*/_jsxDEV("h4", {
      className: "text-sm font-bold text-ink flex items-center justify-between",
      children: [/*#__PURE__*/_jsxDEV("span", {
        children: "إعدادات الرسوم"
      }, void 0, false), isLocked && /*#__PURE__*/_jsxDEV("span", {
        className: "text-[10px] uppercase tracking-wider text-warn bg-warn/10 px-2 py-0.5 rounded font-mono",
        children: "تلقائية 7/1/2"
      }, void 0, false)]
    }, void 0, true), !isLocked && /*#__PURE__*/_jsxDEV("div", {
      className: "space-y-3",
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("label", {
          className: "block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide",
          children: "رسوم التوصيل (TND)"
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
          type: "number",
          step: "0.001",
          min: "0",
          dir: "ltr",
          className: "w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums",
          value: fees.delivery || 0,
          onChange: e => setFees(prev => ({
            ...prev,
            delivery: parseFloat(e.target.value) || 0
          }))
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("label", {
          className: "block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide",
          children: "رسوم الإرجاع (TND)"
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
          type: "number",
          step: "0.001",
          min: "0",
          dir: "ltr",
          className: "w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums",
          value: fees.return || 0,
          onChange: e => setFees(prev => ({
            ...prev,
            return: parseFloat(e.target.value) || 0
          }))
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
  const BrandSummaryCard = ({
    title,
    stats
  }) => /*#__PURE__*/_jsxDEV("div", {
    className: "bg-surface rounded-xl shadow-sm border border-line p-5 flex-1 flex flex-col justify-between surface-highlight transition-all",
    children: [/*#__PURE__*/_jsxDEV("h3", {
      className: "text-lg font-display text-ink mb-4",
      children: title
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "flex flex-col gap-3",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "flex justify-between items-center text-sm",
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "text-ink-soft",
          children: "إجمالي المبيعات"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "font-medium text-ink tabular-nums",
          children: [formatTND(stats.totalSales), " د.ت"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "flex justify-between items-center text-sm",
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "text-ink-soft",
          children: "رسوم التوصيل"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "tabular-nums text-neg",
          dir: "ltr",
          children: ["−", formatTND(stats.totalRuleFeeDelivery), " د.ت"]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "flex justify-between items-center text-sm",
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "text-ink-soft",
          children: "رسوم الإرجاع"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "tabular-nums text-neg",
          dir: "ltr",
          children: ["−", formatTND(stats.totalRuleFeeReturn), " د.ت"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "pt-4 mt-4 border-t border-line flex flex-col items-start gap-4",
      "aria-live": "polite",
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "text-[10px] uppercase tracking-wide text-ink-faint mb-1",
          children: "صافي وفق القاعدة"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "text-4xl sm:text-5xl font-mono font-extrabold text-ink leading-tight tabular-nums tracking-tight",
          children: /*#__PURE__*/_jsxDEV(AnimatedNumber, {
            value: stats.netRule
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), stats.hasCarrierFee && /*#__PURE__*/_jsxDEV("div", {
        className: "w-full flex justify-between bg-surface-2 p-3 rounded-lg border border-line mt-2",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-col",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "text-[10px] uppercase tracking-wide text-ink-faint mb-0.5",
            children: "صافي وفق الفاتورة"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: "text-lg font-mono font-bold text-ink tabular-nums",
            children: /*#__PURE__*/_jsxDEV(AnimatedNumber, {
              value: stats.netCarrier
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-col text-right",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "text-[10px] uppercase tracking-wide text-ink-faint mb-0.5",
            children: "الفرق"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            className: `text-lg font-mono font-bold tabular-nums ${stats.netCarrier - stats.netRule < 0 ? 'text-neg' : stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft'}`,
            dir: "ltr",
            children: [stats.netCarrier - stats.netRule < 0 ? '−' : stats.netCarrier - stats.netRule > 0 ? '+' : '', formatTND(Math.abs(stats.netCarrier - stats.netRule))]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
  const netTotalRevenue = cakadoStats.netRule + balkisStats.netRule;
  const carrierBadge = activeCarrier === 'CONVERTY' ? 'First Delivery' : activeCarrier === 'LOGISTA' ? 'BigBoss' : activeCarrier === 'INTIGO' ? 'Intigo' : activeCarrier || 'لا يوجد';
  const isIntigoLocked = activeCarrier === 'INTIGO';
  return /*#__PURE__*/_jsxDEV("div", {
    className: "flex flex-col min-h-screen pb-24 text-ink transition-colors duration-250",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "sticky top-0 z-40 flex flex-col",
      children: [/*#__PURE__*/_jsxDEV("header", {
        className: "bg-surface/95 backdrop-blur shadow-sm border-b border-line sheen",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex items-center justify-between w-full md:w-auto gap-4",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "flex items-center gap-3 shrink-0",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "bg-surface-2 border border-line text-ink-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                children: carrierBadge
              }, void 0, false), isEnriching && /*#__PURE__*/_jsxDEV("div", {
                className: "w-16 h-1 bg-surface-2 rounded-full overflow-hidden ml-2",
                "aria-live": "polite",
                "aria-label": `جاري الجلب: ${enrichProgress.current} من ${enrichProgress.total}`,
                children: /*#__PURE__*/_jsxDEV("div", {
                  className: "bg-brand h-full transition-all duration-300",
                  style: {
                    width: `${Math.max(5, enrichProgress.current / (enrichProgress.total || 1) * 100)}%`
                  }
                }, void 0, false)
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "flex flex-col items-end md:items-center shrink-0",
              "aria-live": "polite",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "text-[10px] text-ink-faint uppercase tracking-wider mb-0.5",
                children: "صافي الإيرادات / NET"
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                className: "font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums",
                dir: "ltr",
                children: /*#__PURE__*/_jsxDEV(AnimatedNumber, {
                  value: netTotalRevenue
                }, void 0, false)
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "w-full md:w-auto flex items-center",
              children: /*#__PURE__*/_jsxDEV("div", {
                className: "flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-full border border-line w-full md:w-48",
                children: /*#__PURE__*/_jsxDEV("input", {
                  type: "password",
                  value: intigoApiKey,
                  onChange: e => {
                    setIntigoApiKey(e.target.value);
                    localStorage.setItem('intigoApiKey', e.target.value);
                  },
                  placeholder: "ألصق مفتاح Intigo API هنا",
                  className: "bg-transparent border-none outline-none text-xs w-full text-ink font-mono tracking-widest",
                  dir: "ltr"
                }, void 0, false)
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto",
              children: [/*#__PURE__*/_jsxDEV("button", {
                onClick: handleClearCache,
                className: "shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold",
                "aria-label": "مسح ذاكرة المنتجات",
                title: "مسح ذاكرة المنتجات وتحديث الأسماء",
                children: "مسح ذاكرة المنتجات"
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                className: `shrink-0 w-2.5 h-2.5 rounded-full mx-1 ${healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'offline' || healthStatus === 'endpoint_unknown' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'}`,
                title: healthStatus === 'connected' ? 'متصل' : healthStatus === 'offline' ? 'غير متصل' : healthStatus === 'endpoint_unknown' ? 'تعذّر التحقق من الصحة — سيتم التأكد عند أول طلب' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح'
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                role: "switch",
                "aria-checked": theme === 'console',
                "aria-label": theme === 'console' ? "الوضع النهاري" : "الوضع الليلي",
                title: theme === 'console' ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي",
                onClick: toggleTheme,
                className: "relative inline-flex shrink-0 items-center min-h-[44px] px-1 select-none cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] bg-transparent border-none",
                style: {
                  transition: "background-color 250ms ease, border-color 250ms ease"
                },
                children: /*#__PURE__*/_jsxDEV("span", {
                  className: "relative flex w-14 h-8 shrink-0 items-center rounded-full border",
                  style: {
                    backgroundColor: theme === 'console' ? "var(--surface-2)" : "#E2E7EE",
                    borderColor: "var(--line)",
                    transition: "background-color 250ms ease"
                  },
                  children: [/*#__PURE__*/_jsxDEV("span", {
                    dir: "ltr",
                    className: "absolute inset-inline-start-1.5 text-[12px] leading-none",
                    style: {
                      color: theme === 'console' ? "var(--ink-faint)" : "var(--warn)"
                    },
                    "aria-hidden": "true",
                    children: "☀"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                    dir: "ltr",
                    className: "absolute inset-inline-end-1.5 text-[12px] leading-none",
                    style: {
                      color: theme === 'console' ? "var(--brand)" : "var(--ink-faint)"
                    },
                    "aria-hidden": "true",
                    children: "☾"
                  }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                    className: "absolute top-1 h-6 w-6 rounded-full shadow-sm flex items-center justify-center",
                    style: {
                      insetInlineStart: theme === 'console' ? "calc(100% - 1.75rem)" : "0.25rem",
                      backgroundColor: theme === 'console' ? "var(--brand)" : "#FFFFFF",
                      transition: "inset-inline-start 220ms cubic-bezier(.34,1.56,.64,1), background-color 250ms ease"
                    },
                    "aria-hidden": "true"
                  }, void 0, false)]
                }, void 0, true)
              }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
                onClick: handleNewCompanyClick,
                className: "shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold",
                "aria-label": "مسح الجلسة الحالية والبدء بشركة توصيل أخرى",
                title: "مسح الجلسة الحالية والبدء بشركة توصيل أخرى",
                children: [/*#__PURE__*/_jsxDEV("span", {
                  children: "شركة جديدة"
                }, void 0, false), /*#__PURE__*/_jsxDEV("svg", {
                  className: "w-4 h-4 shrink-0",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  children: /*#__PURE__*/_jsxDEV("path", {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: "2",
                    d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  }, void 0, false)
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "bg-bg/95 backdrop-blur border-b border-line px-4 md:px-6 py-3",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex-1 flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-1.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all",
            children: [/*#__PURE__*/_jsxDEV("span", {
              className: "text-ink-soft text-sm",
              children: "🔍"
            }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
              type: "text",
              className: "bg-transparent border-none outline-none w-full text-sm text-ink placeholder-ink-faint",
              placeholder: "بحث عن منتج، باركود، هاتف...",
              value: searchQuery,
              onChange: e => setSearchQuery(e.target.value)
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "flex items-center gap-2 overflow-x-auto hide-scrollbar",
            children: ['all', 'delivered', 'returned', 'in_progress', 'cancelled', 'error'].map(status => {
              const label = status === 'all' ? 'الكل' : status === 'delivered' ? 'مُسلّم' : status === 'returned' ? 'مسترجع' : status === 'in_progress' ? 'قيد التنفيذ' : status === 'cancelled' ? 'ملغي' : '⚠ خطأ';
              const active = filterStatus === status;
              return /*#__PURE__*/_jsxDEV("button", {
                "aria-pressed": active,
                onClick: () => setFilterStatus(status),
                className: `focus-visible:ring-2 focus-visible:ring-brand focus:outline-none whitespace-nowrap px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors ${active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2'}`,
                children: label
              }, status, false);
            })
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "flex items-center gap-2 whitespace-nowrap",
            children: /*#__PURE__*/_jsxDEV("select", {
              className: "text-xs bg-surface border border-line rounded-lg px-3 py-2 text-ink outline-none focus:border-brand",
              value: sortOption,
              onChange: e => setSortOption(e.target.value),
              children: [/*#__PURE__*/_jsxDEV("option", {
                value: "default",
                children: "الترتيب الافتراضي"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "price-desc",
                children: "السعر (الأعلى)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "price-asc",
                children: "السعر (الأقل)"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "city",
                children: "الولاية"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "status",
                children: "الحالة"
              }, void 0, false), /*#__PURE__*/_jsxDEV("option", {
                value: "product",
                children: "الاسم (أ - ي)"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("main", {
      className: "flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6",
      children: [!masterRows.length && !cakadoRows.length && !balkisRows.length && /*#__PURE__*/_jsxDEV("label", {
        className: "border-2 border-dashed border-line bg-surface hover:bg-surface-2 transition-colors rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer text-center group",
        onDrop: onDropFile,
        onDragOver: handleDragOver,
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
          children: /*#__PURE__*/_jsxDEV("svg", {
            className: "w-8 h-8 text-brand",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/_jsxDEV("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "font-display text-xl text-ink mb-2",
          children: "اسحب الطلبات إلى هنا"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "text-sm text-ink-soft",
          children: "أو انقر لاختيار ملف (.xlsx, .csv)"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "text-xs text-ink-faint mt-4 bg-surface-2 px-3 py-1.5 rounded-full",
          children: "الحالات محدّثة حتى تاريخ تصدير الملف — أعد رفع الملف لتحديثها."
        }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
          type: "file",
          accept: ".xlsx,.csv",
          className: "hidden",
          onChange: onFileInputChange
        }, void 0, false)]
      }, void 0, true), error && /*#__PURE__*/_jsxDEV("div", {
        className: "bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-center gap-3",
        children: [/*#__PURE__*/_jsxDEV("svg", {
          className: "w-5 h-5 flex-shrink-0",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /*#__PURE__*/_jsxDEV("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "text-sm font-medium",
          children: error
        }, void 0, false)]
      }, void 0, true), autoFeesInfo && /*#__PURE__*/_jsxDEV("div", {
        className: "bg-pos/10 text-pos border border-pos/20 rounded-lg p-4 flex items-center gap-3",
        children: [/*#__PURE__*/_jsxDEV("svg", {
          className: "w-5 h-5 flex-shrink-0",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /*#__PURE__*/_jsxDEV("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "text-sm font-medium",
          children: "تم ضبط الرسوم تلقائياً من Logista."
        }, void 0, false)]
      }, void 0, true), unrecognizedStatuses.length > 0 && /*#__PURE__*/_jsxDEV("div", {
        className: "bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2",
        children: [/*#__PURE__*/_jsxDEV("svg", {
          className: "w-5 h-5 flex-shrink-0 mt-0.5",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /*#__PURE__*/_jsxDEV("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "flex-1",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "text-sm font-medium mb-1",
            children: "حالات غير معروفة لم تُحتسب ضمن الإيرادات — راجع التصنيف:"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "text-xs opacity-80 font-mono",
            dir: "ltr",
            children: [unrecognizedStatuses.slice(0, 6).join(', '), unrecognizedStatuses.length > 6 ? ' و...' : '']
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          onClick: () => setUnrecognizedStatuses([]),
          className: "absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center",
          children: /*#__PURE__*/_jsxDEV("svg", {
            className: "w-4 h-4",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/_jsxDEV("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M6 18L18 6M6 6l12 12"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), duplicateNids.length > 0 && /*#__PURE__*/_jsxDEV("div", {
        className: "bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2",
        children: [/*#__PURE__*/_jsxDEV("svg", {
          className: "w-5 h-5 flex-shrink-0 mt-0.5",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /*#__PURE__*/_jsxDEV("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "flex-1",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "text-sm font-medium mb-1",
            children: ["تم العثور على ", duplicateNids.length, " معرفات (NID) مكررة في الملف وتم تجاهل التكرار:"]
          }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
            className: "text-xs opacity-80 font-mono",
            dir: "ltr",
            children: [duplicateNids.slice(0, 6).join(', '), duplicateNids.length > 6 ? ' و...' : '']
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          onClick: () => setDuplicateNids([]),
          className: "absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center",
          children: /*#__PURE__*/_jsxDEV("svg", {
            className: "w-4 h-4",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/_jsxDEV("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M6 18L18 6M6 6l12 12"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), !dismissedUnknownGovs && (cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (() => {
        const unk = [...new Set([...cakadoStats.newUnknownGovs, ...balkisStats.newUnknownGovs])];
        if (unk.length > 0) {
          return /*#__PURE__*/_jsxDEV("div", {
            className: "bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2",
            children: [/*#__PURE__*/_jsxDEV("svg", {
              className: "w-5 h-5 flex-shrink-0 mt-0.5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /*#__PURE__*/_jsxDEV("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "flex-1",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-sm font-medium mb-1",
                children: "ولايات غير معروفة في خريطة الرسوم (تم احتساب 2 د.ت):"
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                className: "text-xs opacity-80",
                dir: "ltr",
                children: [unk.slice(0, 6).join(', '), unk.length > 6 ? ' و...' : '']
              }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
                className: "text-xs opacity-80 mt-1",
                children: "أضفها لتفادي الخطأ."
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
              onClick: () => setDismissedUnknownGovs(true),
              className: "absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center",
              children: /*#__PURE__*/_jsxDEV("svg", {
                className: "w-4 h-4",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /*#__PURE__*/_jsxDEV("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M6 18L18 6M6 6l12 12"
                }, void 0, false)
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true);
        }
        return null;
      })(), (masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) && /*#__PURE__*/_jsxDEV(React.Fragment, {
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-col md:flex-row gap-6",
          children: [/*#__PURE__*/_jsxDEV(BrandSummaryCard, {
            title: "كاكادو (CAKADO)",
            stats: cakadoStats
          }, void 0, false), /*#__PURE__*/_jsxDEV(BrandSummaryCard, {
            title: "بلقيس (Balkis)",
            stats: balkisStats
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "order-1 lg:order-none",
            children: /*#__PURE__*/_jsxDEV(ZoneTable, {
              rows: viewMaster,
              title: "غير مصنفة",
              zone: "master",
              selectable: true,
              accentColor: ""
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "order-2 lg:order-none",
            children: [/*#__PURE__*/_jsxDEV(ZoneTable, {
              rows: viewCakado,
              title: "كاكادو",
              zone: "cakado",
              selectable: true,
              accentColor: "var(--brand)"
            }, void 0, false), renderFeeInputs(cakadoFees, setCakadoFees, isIntigoLocked)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "order-3 lg:order-none",
            children: [/*#__PURE__*/_jsxDEV(ZoneTable, {
              rows: viewBalkis,
              title: "بلقيس",
              zone: "balkis",
              selectable: true,
              accentColor: "#3b82f6"
            }, void 0, false), renderFeeInputs(balkisFees, setBalkisFees, isIntigoLocked)]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true), selectedIds.size > 0 && /*#__PURE__*/_jsxDEV("div", {
        className: "fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "max-w-3xl mx-auto bg-surface border border-line text-ink rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto surface-highlight",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start px-2",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "flex items-center gap-2",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "font-bold text-sm bg-brand text-white px-2.5 py-0.5 rounded-full shadow-sm",
                children: selectedIds.size
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                className: "text-ink-soft font-medium text-sm",
                children: "محدد"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
              onClick: () => setSelectedIds(new Set()),
              className: "text-ink-faint hover:text-ink text-sm font-medium px-2 py-1 rounded transition-colors",
              children: "إلغاء"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar",
            children: [/*#__PURE__*/_jsxDEV("button", {
              onClick: () => moveSelected('master'),
              className: "flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-surface-2 hover:bg-line text-ink rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5",
              children: "إلى غير مصنفة"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              onClick: () => moveSelected('cakado'),
              className: "flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-brand/20",
              children: "تعيين كاكادو"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              onClick: () => moveSelected('balkis'),
              className: "flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20",
              children: "تعيين بلقيس"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true)
      }, void 0, false), showResetModal && /*#__PURE__*/_jsxDEV("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "absolute inset-0 bg-[#0B1220]/60 backdrop-blur-sm transition-opacity",
          onClick: () => setShowResetModal(false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "relative bg-surface border border-line rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200",
          children: [/*#__PURE__*/_jsxDEV("h2", {
            className: "font-display text-xl text-ink mb-2",
            children: "بدء جلسة جديدة؟"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "text-ink-soft text-sm mb-6 leading-relaxed",
            children: "سيتم مسح جميع الطلبات المصنّفة والنتائج الحالية لشركة التوصيل هذه. لا يمكن التراجع عن هذا الإجراء."
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "flex gap-3 justify-end",
            children: [/*#__PURE__*/_jsxDEV("button", {
              onClick: () => setShowResetModal(false),
              className: "px-4 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 border border-transparent transition-colors",
              children: "إلغاء"
            }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
              onClick: resetSession,
              className: "px-4 py-2 rounded-lg text-sm font-bold text-white bg-neg hover:bg-neg/90 transition-colors shadow-sm shadow-neg/20",
              children: "مسح والبدء"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: `fixed right-4 sm:right-8 flex flex-col gap-2 z-40 transition-all duration-300 ${selectedIds.size > 0 ? 'bottom-[100px]' : 'bottom-6'}`,
        children: [/*#__PURE__*/_jsxDEV("button", {
          onClick: scrollToTop,
          className: `p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${scrollPos.top ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`,
          "aria-label": "أعلى الصفحة",
          children: /*#__PURE__*/_jsxDEV("svg", {
            className: "w-5 h-5",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/_jsxDEV("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M5 15l7-7 7 7"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          onClick: scrollToBottom,
          className: `p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${scrollPos.bottom ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`,
          "aria-label": "أسفل الصفحة",
          children: /*#__PURE__*/_jsxDEV("svg", {
            className: "w-5 h-5",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /*#__PURE__*/_jsxDEV("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M19 9l-7 7-7-7"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)]
  }, void 0, true);
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/_jsxDEV(App, {}, void 0, false));
