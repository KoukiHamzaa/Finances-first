'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _React = React;
var useState = _React.useState;
var useCallback = _React.useCallback;
var useMemo = _React.useMemo;
var useRef = _React.useRef;
var useEffect = _React.useEffect;
var startTransition = _React.startTransition;

var RowCard = React.memo(function (_ref) {
  var row = _ref.row;
  var selectable = _ref.selectable;
  var selected = _ref.selected;
  var onToggle = _ref.onToggle;
  var onDragStart = _ref.onDragStart;
  var zone = _ref.zone;
  var onMoveDirect = _ref.onMoveDirect;

  var govInfo = resolveGov(row.city);

  var statusPills = {
    'delivered': { label: 'مُسلّم', colors: 'bg-pos/10 text-pos' },
    'returned': { label: 'مسترجع', colors: 'bg-neg/10 text-neg' },
    'cancelled': { label: 'ملغي', colors: 'bg-ink-faint/10 text-ink-faint line-through' },
    'exchange': { label: 'تبادل', colors: 'bg-warn/10 text-warn' },
    'in_progress': { label: 'قيد التنفيذ', colors: 'bg-brand/10 text-brand' },
    'return_in_progress': { label: 'إرجاع قيد التنفيذ', colors: 'bg-brand/10 text-brand' },
    'other': { label: 'أخرى', colors: 'bg-surface-2 text-ink-soft' }
  };
  var pill = statusPills[row.status] || statusPills['other'];

  return React.createElement(
    'div',
    {
      key: row.id,
      draggable: true,
      onDragStart: function (e) {
        return onDragStart(e, row.id);
      },
      onClick: selectable ? function (e) {
        return onToggle(e, row.id);
      } : undefined,
      className: 'bg-surface border p-3 rounded-xl shadow-sm transition-all duration-200 group relative\n                      ' + (selectable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md') + ' \n                      ' + (selectedIds.has(row.id) ? 'border-brand ring-1 ring-brand bg-brand/5' : 'border-line') + '\n                    ',
      style: i < 12 ? { animation: 'fadeInUp 0.3s ease-out ' + i * 0.03 + 's both' } : {}
    },
    React.createElement(
      'div',
      { className: 'flex items-start gap-3' },
      selectable && React.createElement('input', {
        type: 'checkbox',
        className: 'w-5 h-5 mt-0.5 rounded cursor-pointer accent-brand',
        checked: selected,
        onChange: function (e) {
          return onToggle(e, row.id);
        },
        onClick: function (e) {
          return e.stopPropagation();
        }
      }),
      React.createElement(
        'div',
        { className: 'flex-1 min-w-0 flex flex-col gap-2' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-start gap-2' },
          React.createElement(
            'div',
            { className: 'flex items-start gap-2 min-w-0' },
            row.carrier === 'INTIGO' && React.createElement(
              'span',
              { className: 'flex-shrink-0 mt-0.5', title: row.enrichState === 'fetched' ? 'تم جلب الاسم' : row.enrichState === 'blocked' ? 'بانتظار المفتاح' : row.enrichState === 'not_found' ? 'لم يُعثر على المنتج' : row.enrichState === 'error' ? 'فشل الطلب — أعد المحاولة' : 'جاري الجلب...' },
              row.enrichState === 'fetched' ? React.createElement(
                'span',
                { className: 'text-pos' },
                '✓'
              ) : row.enrichState === 'blocked' || row.enrichState === 'not_found' ? React.createElement(
                'span',
                { className: 'text-warn' },
                '⚠'
              ) : row.enrichState === 'error' ? React.createElement(
                'span',
                { className: 'text-neg' },
                '✗'
              ) : React.createElement(
                'span',
                { className: 'text-brand animate-pulse' },
                '⏳'
              )
            ),
            React.createElement(
              'span',
              { className: 'font-medium text-[14px] text-ink leading-tight flex flex-wrap items-center gap-1' },
              row.productName,
              row.carrier === 'INTIGO' && String(row.productName).trim().toLowerCase() === 'colis' && React.createElement(
                'span',
                { className: 'text-warn text-[10px] ml-1 flex items-center', title: 'الوصف افتراضي من Intigo — لم يُحدَّد اسم منتج' },
                '⚠'
              )
            )
          ),
          React.createElement(
            'span',
            { className: 'font-mono font-bold text-ink tabular-nums whitespace-nowrap text-[14px]', dir: 'ltr' },
            row.status === 'delivered' ? formatTND(row.totalSales) : React.createElement(
              'span',
              { className: 'text-ink-faint' },
              '—'
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'flex flex-wrap items-center gap-2 text-[11px]' },
          React.createElement(
            'span',
            { className: 'font-mono text-ink-faint uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 rounded', dir: 'ltr' },
            row.nid || row.barcode || 'N/A'
          ),
          row.city && React.createElement(
            'span',
            { className: 'px-1.5 py-0.5 rounded ' + (row.carrier === 'INTIGO' ? govInfo.isGrandTunis ? 'bg-brand/10 text-brand' : govInfo.unknown ? 'border border-warn text-warn' : 'bg-warn/10 text-warn' : 'bg-surface-2 text-ink-soft') },
            row.city,
            ' ',
            row.carrier === 'INTIGO' && govInfo.isGrandTunis && 'إرجاع 1',
            row.carrier === 'INTIGO' && !govInfo.isGrandTunis && 'إرجاع 2'
          ),
          row.phone && React.createElement(
            'span',
            { className: 'text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded', dir: 'ltr' },
            row.phone
          ),
          row.status === 'delivered' && row.totalSales === 0 && React.createElement(
            'span',
            { className: 'bg-pos/20 text-pos px-1.5 py-0.5 rounded font-medium' },
            'مدفوع مسبقاً'
          )
        ),
        React.createElement(
          'div',
          { className: 'flex justify-between items-center mt-1' },
          React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement(
              'span',
              { className: 'px-2 py-0.5 rounded text-[11px] font-medium ' + pill.colors, title: row.originalStatusText },
              pill.label,
              ' ',
              row.status === 'in_progress' && '⚠'
            ),
            row.hasError && React.createElement(
              'button',
              { onClick: function (e) {
                  return handleRetryEnrichment(e, row);
                }, className: 'text-[11px] text-brand hover:underline flex items-center gap-1 min-h-[44px] px-2' },
              '⚠ إعادة المحاولة'
            )
          ),
          row.carrier_fee != null && React.createElement(
            'div',
            { className: 'flex flex-col text-[10px] items-end', dir: 'ltr' },
            React.createElement(
              'span',
              { className: 'tabular-nums font-mono ' + (row.fee_delta > 0 ? 'text-neg' : row.fee_delta < 0 ? 'text-pos' : 'text-ink-soft opacity-60') },
              row.fee_delta < 0 ? '−' : row.fee_delta > 0 ? '+' : '',
              formatTND(Math.abs(row.fee_delta))
            )
          ),
          React.createElement(
            'div',
            { className: 'flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus-within:opacity-100' },
            zone === 'master' ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                'button',
                { onClick: function (e) {
                    e.stopPropagation();onMoveDirect(row, 'cakado');
                  }, className: 'text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]' },
                '→ كاكادو'
              ),
              React.createElement(
                'button',
                { onClick: function (e) {
                    e.stopPropagation();onMoveDirect(row, 'balkis');
                  }, className: 'text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]' },
                '→ بلقيس'
              )
            ) : React.createElement(
              'button',
              { onClick: function (e) {
                  e.stopPropagation();onMoveDirect(row, 'master');
                }, className: 'text-[11px] font-medium bg-surface-2 hover:bg-line text-ink px-3 py-1.5 rounded-full min-h-[44px]' },
              '↩ إلغاء'
            )
          )
        )
      )
    )
  );
}, function (prevProps, nextProps) {
  return prevProps.selected === nextProps.selected && prevProps.selectable === nextProps.selectable && prevProps.row.id === nextProps.row.id && prevProps.row.status === nextProps.row.status && prevProps.row.enrichState === nextProps.row.enrichState && prevProps.row.productName === nextProps.row.productName && prevProps.row.totalSales === nextProps.row.totalSales && prevProps.row.city === nextProps.row.city;
});

var EnrichmentProgress = function EnrichmentProgress() {
  var _useState = useState(progressStore.get());

  var _useState2 = _slicedToArray(_useState, 2);

  var progress = _useState2[0];
  var setProgress = _useState2[1];

  useEffect(function () {
    return progressStore.subscribe(function () {
      return setProgress(progressStore.get());
    });
  }, []);

  if (progress.total === 0 || progress.current === progress.total) return null;
  var pct = Math.round(progress.current / progress.total * 100);

  return React.createElement(
    'div',
    { className: 'bg-surface border p-3 rounded-xl shadow-sm mb-4' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-end mb-2' },
      React.createElement(
        'span',
        { className: 'font-bold text-sm text-ink' },
        'جاري جلب الأسماء (Intigo)...'
      ),
      React.createElement(
        'span',
        { className: 'font-mono text-xs text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full', dir: 'ltr' },
        progress.current,
        ' / ',
        progress.total
      )
    ),
    React.createElement(
      'div',
      { className: 'h-2 bg-line rounded-full overflow-hidden w-full relative' },
      React.createElement('div', { className: 'absolute top-0 left-0 h-full bg-brand rounded-full transition-all duration-300', style: { width: pct + '%' } })
    ),
    progress.errors > 0 && React.createElement(
      'p',
      { className: 'text-[10px] text-warn mt-1.5 flex items-center gap-1' },
      React.createElement(
        'span',
        null,
        '⚠'
      ),
      ' فشل جلب ',
      progress.errors,
      ' طلبات.'
    )
  );
};

var AnimatedNumber = React.memo(function (_ref2) {
  var value = _ref2.value;

  var _useState3 = useState(value);

  var _useState32 = _slicedToArray(_useState3, 2);

  var displayValue = _useState32[0];
  var setDisplayValue = _useState32[1];

  var requestRef = useRef();
  var startTimeRef = useRef();
  var previousValueRef = useRef(value);

  useEffect(function () {
    if (value === displayValue) return;

    var animate = function animate(time) {
      if (!startTimeRef.current) startTimeRef.current = time;
      var progress = Math.min((time - startTimeRef.current) / 400, 1);

      var current = previousValueRef.current + (value - previousValueRef.current) * progress;
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
    return function () {
      return cancelAnimationFrame(requestRef.current);
    };
  }, [value]);

  return React.createElement(
    React.Fragment,
    null,
    formatTND(displayValue)
  );
});

function App() {

  // Splash fade out
  useEffect(function () {
    var splash = document.getElementById('boot-splash');
    if (splash) {
      requestAnimationFrame(function () {
        splash.style.transition = 'opacity 0.6s ease';
        splash.style.opacity = '0';
        setTimeout(function () {
          return splash.remove();
        }, 600);
      });
    }
  }, []);
  // Three separate state arrays

  var _useState4 = useState([]);

  var _useState42 = _slicedToArray(_useState4, 2);

  var masterRows = _useState42[0];
  var setMasterRows = _useState42[1];

  var _useState5 = useState([]);

  var _useState52 = _slicedToArray(_useState5, 2);

  var cakadoRows = _useState52[0];
  var setCakadoRows = _useState52[1];

  var _useState6 = useState([]);

  var _useState62 = _slicedToArray(_useState6, 2);

  var balkisRows = _useState62[0];
  var setBalkisRows = _useState62[1];

  var _useState7 = useState(new Set());

  var _useState72 = _slicedToArray(_useState7, 2);

  var selectedIds = _useState72[0];
  var setSelectedIds = _useState72[1];

  var _useState8 = useState(null);

  var _useState82 = _slicedToArray(_useState8, 2);

  var error = _useState82[0];
  var setError = _useState82[1];

  var _useState9 = useState(null);

  var _useState92 = _slicedToArray(_useState9, 2);

  var autoFeesInfo = _useState92[0];
  var setAutoFeesInfo = _useState92[1];

  // Presentational Derived View States

  var _useState10 = useState('');

  var _useState102 = _slicedToArray(_useState10, 2);

  var searchQuery = _useState102[0];
  var setSearchQuery = _useState102[1];

  var _useState11 = useState('all');

  var _useState112 = _slicedToArray(_useState11, 2);

  var filterStatus = _useState112[0];
  var setFilterStatus = _useState112[1];
  // 'all', 'delivered', 'returned', 'error'

  var _useState12 = useState('default');

  var _useState122 = _slicedToArray(_useState12, 2);

  var sortOption = _useState122[0];
  var setSortOption = _useState122[1];
  // 'default', 'price-desc', 'price-asc', 'city', 'status', 'product'

  var _useState13 = useState(null);

  var _useState132 = _slicedToArray(_useState13, 2);

  var activeCarrier = _useState132[0];
  var setActiveCarrier = _useState132[1];

  // Theme toggle

  var _useState14 = useState(function () {
    var stored = localStorage.getItem('recon-theme');
    if (stored) return stored;
    return 'light';
  });

  var _useState142 = _slicedToArray(_useState14, 2);

  var theme = _useState142[0];
  var setTheme = _useState142[1];

  useEffect(function () {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('recon-theme', theme);
  }, [theme]);

  useEffect(function () {
    var handleBeforeUnload = function handleBeforeUnload(e) {
      if (masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return function () {
      return window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [masterRows.length, cakadoRows.length, balkisRows.length]);

  var toggleTheme = function toggleTheme() {
    return setTheme(function (t) {
      return t === 'light' ? 'console' : 'light';
    });
  };

  // Intigo State

  var _useState15 = useState(localStorage.getItem('intigoApiKey') || '');

  var _useState152 = _slicedToArray(_useState15, 2);

  var intigoApiKey = _useState152[0];
  var setIntigoApiKey = _useState152[1];

  var _useState16 = useState(false);

  var _useState162 = _slicedToArray(_useState16, 2);

  var isEnriching = _useState162[0];
  var setIsEnriching = _useState162[1];

  var _useState17 = useState(progressStore.get());

  var _useState172 = _slicedToArray(_useState17, 2);

  var enrichProgress = _useState172[0];
  var setEnrichProgress = _useState172[1];

  useEffect(function () {
    return progressStore.subscribe(function () {
      return setEnrichProgress(progressStore.get());
    });
  }, []);
  var currentUploadId = useRef(0);

  var _useState18 = useState({ top: true, bottom: false });

  var _useState182 = _slicedToArray(_useState18, 2);

  var scrollPos = _useState182[0];
  var setScrollPos = _useState182[1];

  useEffect(function () {
    var handleScroll = function handleScroll() {
      var isTop = window.scrollY < 100;
      var isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setScrollPos({ top: isTop, bottom: isBottom });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    // observe DOM changes to update bottom detection
    var observer = new MutationObserver(handleScroll);
    observer.observe(document.body, { childList: true, subtree: true });
    return function () {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  var scrollToTop = function scrollToTop() {
    return window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  var scrollToBottom = function scrollToBottom() {
    return window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  var _useState19 = useState(false);

  var _useState192 = _slicedToArray(_useState19, 2);

  var showResetModal = _useState192[0];
  var setShowResetModal = _useState192[1];

  // Per-Brand Fee Structure

  var _useState20 = useState({ delivery: 0, 'return': 0 });

  var _useState202 = _slicedToArray(_useState20, 2);

  var cakadoFees = _useState202[0];
  var setCakadoFees = _useState202[1];

  var _useState21 = useState({ delivery: 0, 'return': 0 });

  var _useState212 = _slicedToArray(_useState21, 2);

  var balkisFees = _useState212[0];
  var setBalkisFees = _useState212[1];

  var _useState22 = useState(false);

  var _useState222 = _slicedToArray(_useState22, 2);

  var dismissedUnknownGovs = _useState222[0];
  var setDismissedUnknownGovs = _useState222[1];

  var _useState23 = useState([]);

  var _useState232 = _slicedToArray(_useState23, 2);

  var duplicateNids = _useState232[0];
  var setDuplicateNids = _useState232[1];

  var _useState24 = useState([]);

  var _useState242 = _slicedToArray(_useState24, 2);

  var unrecognizedStatuses = _useState242[0];
  var setUnrecognizedStatuses = _useState242[1];

  var _useState25 = useState('checking');

  var _useState252 = _slicedToArray(_useState25, 2);

  var healthStatus = _useState252[0];
  var setHealthStatus = _useState252[1];

  useEffect(function () {
    var t = setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(function () {
          return checkHealth(intigoApiKey, setHealthStatus);
        });
      } else {
        checkHealth(intigoApiKey, setHealthStatus);
      }
    }, 500);
    return function () {
      return clearTimeout(t);
    };
  }, [intigoApiKey]);

  var resetSession = useCallback(function () {
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
    setCakadoFees({ delivery: 0, 'return': 0 });
    setBalkisFees({ delivery: 0, 'return': 0 });
    setShowResetModal(false);
    setDuplicateNids([]);
    setUnrecognizedStatuses([]);
    setDismissedUnknownGovs(false);
  }, []);

  var handleNewCompanyClick = function handleNewCompanyClick() {
    var isDirty = masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0 || activeCarrier || isEnriching;
    if (isDirty) {
      setShowResetModal(true);
    } else {
      resetSession();
    }
  };

  var CACHE_KEY_PREFIX = 'intigo_nid_';

  ;

  var handleClearCache = function handleClearCache() {
    var keysToRemove = [];
    for (var _i = 0; _i < localStorage.length; _i++) {
      var key = localStorage.key(_i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(function (k) {
      return localStorage.removeItem(k);
    });

    if (activeCarrier === 'INTIGO') {
      var _ret = (function () {
        if (!intigoApiKey || !intigoApiKey.trim()) {
          setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
          return {
            v: undefined
          };
        }
        var updateArr = function updateArr(arr) {
          return arr.map(function (r) {
            return _extends({}, r, { needsEnrichment: true, enrichState: 'pending', productName: 'جاري الجلب...' });
          });
        };
        var allToEnrich = [];
        setMasterRows(function (prev) {
          var n = updateArr(prev);allToEnrich.push.apply(allToEnrich, _toConsumableArray(n));return n;
        });
        setCakadoRows(function (prev) {
          var n = updateArr(prev);allToEnrich.push.apply(allToEnrich, _toConsumableArray(n));return n;
        });
        setBalkisRows(function (prev) {
          var n = updateArr(prev);allToEnrich.push.apply(allToEnrich, _toConsumableArray(n));return n;
        });

        var thisUploadId = currentUploadId.current;setTimeout(function () {
          return enrichIntigoRows(allToEnrich, intigoApiKey, thisUploadId, {
            setIsEnriching: setIsEnriching,
            setHealthStatus: setHealthStatus,
            setError: setError,
            checkIsCancelled: function checkIsCancelled() {
              return thisUploadId !== currentUploadId.current;
            },
            onBatchResolved: function onBatchResolved(batch) {
              var updateArr = function updateArr(arr) {
                return arr.map(function (pr) {
                  var updated = batch.find(function (ur) {
                    return ur.id === pr.id;
                  });
                  return updated ? _extends({}, pr, { productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState }) : pr;
                });
              };
              setMasterRows(function (prev) {
                return updateArr(prev);
              });
              setCakadoRows(function (prev) {
                return updateArr(prev);
              });
              setBalkisRows(function (prev) {
                return updateArr(prev);
              });
            }
          });
        }, 0);
      })();

      if (typeof _ret === 'object') return _ret.v;
    }
  };
  ;

  ;

  ;

  // Drag and drop mechanics
  var handleDragStart = function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
  };

  var handleDrop = function handleDrop(e, targetZone) {
    e.preventDefault();
    var id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    // Locate row across all three arrays
    var row = masterRows.find(function (r) {
      return r.id === id;
    }) || cakadoRows.find(function (r) {
      return r.id === id;
    }) || balkisRows.find(function (r) {
      return r.id === id;
    });

    if (!row) return;

    // Remove from all three simultaneously
    setMasterRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== id;
      });
    });
    setCakadoRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== id;
      });
    });
    setBalkisRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== id;
      });
    });

    // Append to the target zone's array
    if (targetZone === 'master') {
      setMasterRows(function (prev) {
        return [].concat(_toConsumableArray(prev), [row]);
      });
    } else if (targetZone === 'cakado') {
      setCakadoRows(function (prev) {
        return [].concat(_toConsumableArray(prev), [row]);
      });
    } else if (targetZone === 'balkis') {
      setBalkisRows(function (prev) {
        return [].concat(_toConsumableArray(prev), [row]);
      });
    }
  };

  var handleDragOver = function handleDragOver(e) {
    e.preventDefault();
  };

  var handleRetryEnrichment = function handleRetryEnrichment(e, row) {
    e.stopPropagation();
    if (!intigoApiKey || !intigoApiKey.trim()) {
      setError('أدخل مفتاح Intigo API لجلب أسماء المنتجات من الخادم.');
      return;
    }

    var updateArr = function updateArr(arr) {
      return arr.map(function (r) {
        return r.id === row.id ? _extends({}, r, { enrichState: 'pending', productName: 'جاري الجلب...', hasError: false, needsEnrichment: true }) : r;
      });
    };
    setMasterRows(function (prev) {
      return updateArr(prev);
    });
    setCakadoRows(function (prev) {
      return updateArr(prev);
    });
    setBalkisRows(function (prev) {
      return updateArr(prev);
    });

    var thisUploadId = currentUploadId.current;enrichIntigoRows([_extends({}, row, { needsEnrichment: true })], intigoApiKey, thisUploadId, {
      setIsEnriching: setIsEnriching,
      setHealthStatus: setHealthStatus,
      setError: setError,
      checkIsCancelled: function checkIsCancelled() {
        return thisUploadId !== currentUploadId.current;
      },
      onBatchResolved: function onBatchResolved(batch) {
        var updateArr = function updateArr(arr) {
          return arr.map(function (pr) {
            var updated = batch.find(function (ur) {
              return ur.id === pr.id;
            });
            return updated ? _extends({}, pr, { productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState }) : pr;
          });
        };
        setMasterRows(function (prev) {
          return updateArr(prev);
        });
        setCakadoRows(function (prev) {
          return updateArr(prev);
        });
        setBalkisRows(function (prev) {
          return updateArr(prev);
        });
      }
    });
  };

  var handleFileUpload = useCallback(function (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var _ret2 = (function () {
          var workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          var sheet = workbook.Sheets[workbook.SheetNames[0]];
          var rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

          var template = detectTemplate(rawRows);
          var result = undefined;

          if (template === 'CONVERTY') result = parseConverty(rawRows);else if (template === 'LOGISTA') result = parseLogista(rawRows);else if (template === 'INTIGO') result = parseIntigo(rawRows);else {
            setError('خطأ: تنسيق الملف غير معروف. يُقبل ملفات Converty أو Logista أو Intigo فقط.');
            return {
              v: undefined
            };
          }

          if (result.rows.length === 0) {
            setError('خطأ: الملف لا يحتوي على أي بيانات تخص التوصيل أو الإرجاع.');
            return {
              v: undefined
            };
          }

          resetSession();

          var thisUploadId = currentUploadId.current;

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
              var blockedRows = result.rows.map(function (r) {
                return _extends({}, r, { enrichState: 'blocked', productName: '— (بانتظار المفتاح)', needsEnrichment: true, hasError: false });
              });
              setMasterRows(blockedRows);
            } else {
              var pendingRows = result.rows.map(function (r) {
                return _extends({}, r, { enrichState: 'pending', needsEnrichment: true, hasError: false, productName: 'جاري الجلب...' });
              });
              setMasterRows(pendingRows);

              enrichIntigoRows(pendingRows, intigoApiKey, thisUploadId, {
                setIsEnriching: setIsEnriching,
                setHealthStatus: setHealthStatus,
                setError: setError,
                checkIsCancelled: function checkIsCancelled() {
                  return thisUploadId !== currentUploadId.current;
                },
                onBatchResolved: function onBatchResolved(batch) {
                  var updateArr = function updateArr(arr) {
                    return arr.map(function (pr) {
                      var updated = batch.find(function (ur) {
                        return ur.id === pr.id;
                      });
                      return updated ? _extends({}, pr, { productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState }) : pr;
                    });
                  };
                  setMasterRows(function (prev) {
                    return updateArr(prev);
                  });
                  setCakadoRows(function (prev) {
                    return updateArr(prev);
                  });
                  setBalkisRows(function (prev) {
                    return updateArr(prev);
                  });
                }
              });
            }
          }
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      } catch (err) {
        setError('خطأ: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [intigoApiKey]);

  var onFileInputChange = useCallback(function (e) {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  }, [handleFileUpload]);

  var onDropFile = useCallback(function (e) {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  // Number Formatting

  ;

  var getDerivedView = function getDerivedView(sourceArray) {
    return useMemo(function () {
      var res = [].concat(_toConsumableArray(sourceArray));

      // Apply Search
      if (searchQuery.trim()) {
        (function () {
          var q = searchQuery.toLowerCase();
          res = res.filter(function (r) {
            return r.productName && r.productName.toLowerCase().includes(q) || r.nid && String(r.nid).toLowerCase().includes(q) || r.barcode && String(r.barcode).toLowerCase().includes(q) || r.phone && String(r.phone).includes(q);
          });
        })();
      }

      // Apply Filter
      if (filterStatus === 'delivered') res = res.filter(function (r) {
        return r.status === 'delivered';
      });
      if (filterStatus === 'returned') res = res.filter(function (r) {
        return r.status === 'returned';
      });
      if (filterStatus === 'in_progress') res = res.filter(function (r) {
        return r.status === 'in_progress' || r.status === 'return_in_progress';
      });
      if (filterStatus === 'cancelled') res = res.filter(function (r) {
        return r.status === 'cancelled';
      });
      if (filterStatus === 'error') res = res.filter(function (r) {
        return r.hasError;
      });

      // Apply Sort
      if (sortOption === 'price-desc') res.sort(function (a, b) {
        return b.totalSales - a.totalSales;
      });
      if (sortOption === 'price-asc') res.sort(function (a, b) {
        return a.totalSales - b.totalSales;
      });
      if (sortOption === 'city') res.sort(function (a, b) {
        return String(a.city || '').localeCompare(String(b.city || ''));
      });
      if (sortOption === 'status') res.sort(function (a, b) {
        return a.status.localeCompare(b.status);
      });
      if (sortOption === 'product') res.sort(function (a, b) {
        return a.productName.localeCompare(b.productName, 'ar', { sensitivity: 'base' });
      });

      return res;
    }, [sourceArray, searchQuery, filterStatus, sortOption]);
  };

  var viewMaster = getDerivedView(masterRows);
  var viewCakado = getDerivedView(cakadoRows);
  var viewBalkis = getDerivedView(balkisRows);

  var cakadoStats = calculateStats(cakadoRows, cakadoFees);
  var balkisStats = calculateStats(balkisRows, balkisFees);

  var toggleSelectAll = function toggleSelectAll(rowsToToggle) {
    var rowIds = rowsToToggle.map(function (r) {
      return r.id;
    });
    var allSelected = rowIds.length > 0 && rowIds.every(function (id) {
      return selectedIds.has(id);
    });
    if (allSelected) {
      (function () {
        var newSet = new Set(selectedIds);
        rowIds.forEach(function (id) {
          return newSet['delete'](id);
        });
        setSelectedIds(newSet);
      })();
    } else {
      (function () {
        var newSet = new Set(selectedIds);
        rowIds.forEach(function (id) {
          return newSet.add(id);
        });
        setSelectedIds(newSet);
      })();
    }
  };

  var toggleSelect = function toggleSelect(e, id) {
    e.stopPropagation();
    var newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet['delete'](id);else newSet.add(id);
    setSelectedIds(newSet);
  };

  var moveSelected = function moveSelected(targetZone) {
    var idsToMove = new Set(selectedIds);

    // Gather from all first:
    var allRows = [].concat(_toConsumableArray(masterRows), _toConsumableArray(cakadoRows), _toConsumableArray(balkisRows));
    var movingRows = allRows.filter(function (r) {
      return idsToMove.has(r.id);
    });

    setMasterRows(function (prev) {
      var kept = prev.filter(function (r) {
        return !idsToMove.has(r.id);
      });
      return targetZone === 'master' ? [].concat(_toConsumableArray(kept), _toConsumableArray(movingRows)) : kept;
    });
    setCakadoRows(function (prev) {
      var kept = prev.filter(function (r) {
        return !idsToMove.has(r.id);
      });
      return targetZone === 'cakado' ? [].concat(_toConsumableArray(kept), _toConsumableArray(movingRows)) : kept;
    });
    setBalkisRows(function (prev) {
      var kept = prev.filter(function (r) {
        return !idsToMove.has(r.id);
      });
      return targetZone === 'balkis' ? [].concat(_toConsumableArray(kept), _toConsumableArray(movingRows)) : kept;
    });

    setSelectedIds(new Set());
  };

  var moveSelectedDirectly = function moveSelectedDirectly(row, targetZone) {
    setMasterRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== row.id;
      });
    });
    setCakadoRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== row.id;
      });
    });
    setBalkisRows(function (prev) {
      return prev.filter(function (r) {
        return r.id !== row.id;
      });
    });
    if (targetZone === 'master') setMasterRows(function (prev) {
      return [row].concat(_toConsumableArray(prev));
    });
    if (targetZone === 'cakado') setCakadoRows(function (prev) {
      return [row].concat(_toConsumableArray(prev));
    });
    if (targetZone === 'balkis') setBalkisRows(function (prev) {
      return [row].concat(_toConsumableArray(prev));
    });
  };

  var ZoneTable = function ZoneTable(_ref3) {
    var rows = _ref3.rows;
    var title = _ref3.title;
    var zone = _ref3.zone;
    var _ref3$selectable = _ref3.selectable;
    var selectable = _ref3$selectable === undefined ? false : _ref3$selectable;
    var _ref3$accentColor = _ref3.accentColor;
    var accentColor = _ref3$accentColor === undefined ? '' : _ref3$accentColor;

    var _useState26 = useState(20);

    var _useState262 = _slicedToArray(_useState26, 2);

    var visibleCount = _useState262[0];
    var setVisibleCount = _useState262[1];

    var sentinelRef = useRef(null);

    useEffect(function () {
      setVisibleCount(20);
    }, [rows]);

    useEffect(function () {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && visibleCount < rows.length) {
          setVisibleCount(function (prev) {
            return prev + 20;
          });
        }
      }, { rootMargin: '200px' });
      if (sentinelRef.current) observer.observe(sentinelRef.current);
      return function () {
        return observer.disconnect();
      };
    }, [visibleCount, rows.length]);

    var allSelected = rows.length > 0 && rows.every(function (r) {
      return selectedIds.has(r.id);
    });
    var delCount = rows.filter(function (r) {
      return r.status === 'delivered';
    }).length;
    var retCount = rows.filter(function (r) {
      return r.status === 'returned';
    }).length;
    var inProgCount = rows.filter(function (r) {
      return r.status === 'in_progress' || r.status === 'return_in_progress';
    }).length;
    var cancelCount = rows.filter(function (r) {
      return r.status === 'cancelled';
    }).length;
    var exchCount = rows.filter(function (r) {
      return r.status === 'exchange';
    }).length;

    var headerCounts = [];
    if (delCount > 0) headerCounts.push('مسلّم ' + delCount);
    if (retCount > 0) headerCounts.push('مسترجع ' + retCount);
    if (inProgCount > 0) headerCounts.push('قيد التنفيذ ' + inProgCount);
    if (cancelCount > 0) headerCounts.push('ملغي ' + cancelCount);
    if (exchCount > 0) headerCounts.push('تبادل ' + exchCount);

    var prepaidCount = rows.filter(function (r) {
      return r.status === 'delivered' && r.totalSales === 0;
    }).length;
    if (prepaidCount > 0) headerCounts.push('مدفوع مسبقاً: ' + prepaidCount);

    return React.createElement(
      'div',
      {
        className: 'bg-surface rounded-xl shadow-sm border border-line flex flex-col h-full min-h-[400px] relative overflow-hidden transition-transform duration-200',
        onDrop: function (e) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
          handleDrop(e, zone);
        },
        onDragOver: function (e) {
          e.preventDefault();
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = accentColor ? '0 -2px 10px ' + accentColor + '33' : '0 -2px 10px rgba(0,0,0,0.05)';
        },
        onDragLeave: function (e) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }
      },
      accentColor && React.createElement('div', { className: 'absolute top-0 left-0 right-0 h-1', style: { backgroundColor: accentColor } }),
      React.createElement(
        'div',
        { className: 'bg-surface-2 p-4 border-b border-line flex justify-between items-center' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          selectable && React.createElement('input', {
            type: 'checkbox',
            className: 'w-4 h-4 rounded cursor-pointer accent-brand',
            checked: allSelected,
            onChange: function () {
              return toggleSelectAll(rows);
            }
          }),
          React.createElement(
            'span',
            { className: 'font-display text-lg text-ink' },
            title
          )
        ),
        React.createElement(
          'div',
          { className: 'flex flex-col items-end text-right' },
          React.createElement(
            'span',
            { className: 'bg-line text-ink text-xs px-2 py-0.5 rounded-full tabular-nums font-bold' },
            rows.length
          ),
          React.createElement(
            'span',
            { className: 'text-[10px] text-ink-faint mt-1 tabular-nums max-w-[200px] break-words' },
            headerCounts.join(' • ')
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'flex-1 p-3 overflow-y-auto space-y-3 hide-scrollbar relative' },
        rows.length === 0 && React.createElement(
          'div',
          { className: 'absolute inset-4 border-2 border-dashed border-line rounded-lg flex items-center justify-center text-center p-4' },
          React.createElement(
            'span',
            { className: 'text-sm text-ink-soft' },
            'اسحب الطلبات إلى هنا، أو حدّدها ثم انقر للتعيين'
          )
        ),
        rows.slice(0, visibleCount).map(function (row) {
          return React.createElement(RowCard, {
            key: row.id,
            row: row,
            selectable: selectable,
            selected: selectedIds.has(row.id),
            onToggle: toggleSelect,
            onDragStart: handleDragStart,
            zone: zone,
            onMoveDirect: moveSelectedDirectly
          });
        }),
        visibleCount < rows.length && React.createElement('div', { ref: sentinelRef, className: 'h-4 w-full' })
      )
    );
  };

  var renderFeeInputs = function renderFeeInputs(fees, setFees) {
    var isLocked = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    return React.createElement(
      'div',
      { className: 'mt-4 bg-surface p-4 rounded-xl shadow-sm border border-line flex flex-col gap-3' },
      React.createElement(
        'h4',
        { className: 'text-sm font-bold text-ink flex items-center justify-between' },
        React.createElement(
          'span',
          null,
          'إعدادات الرسوم'
        ),
        isLocked && React.createElement(
          'span',
          { className: 'text-[10px] uppercase tracking-wider text-warn bg-warn/10 px-2 py-0.5 rounded font-mono' },
          'تلقائية 7/1/2'
        )
      ),
      !isLocked && React.createElement(
        'div',
        { className: 'space-y-3' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { className: 'block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide' },
            'رسوم التوصيل (TND)'
          ),
          React.createElement('input', {
            type: 'number', step: '0.001', min: '0', dir: 'ltr',
            className: 'w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums',
            value: fees.delivery || 0,
            onChange: function (e) {
              return setFees(function (prev) {
                return _extends({}, prev, { delivery: parseFloat(e.target.value) || 0 });
              });
            }
          })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { className: 'block text-[11px] font-medium text-ink-soft mb-1 uppercase tracking-wide' },
            'رسوم الإرجاع (TND)'
          ),
          React.createElement('input', {
            type: 'number', step: '0.001', min: '0', dir: 'ltr',
            className: 'w-full bg-surface-2 border border-line rounded px-2 py-1.5 text-sm text-ink outline-none focus:border-brand tabular-nums',
            value: fees['return'] || 0,
            onChange: function (e) {
              return setFees(function (prev) {
                return _extends({}, prev, { 'return': parseFloat(e.target.value) || 0 });
              });
            }
          })
        )
      )
    );
  };
  var BrandSummaryCard = function BrandSummaryCard(_ref4) {
    var title = _ref4.title;
    var stats = _ref4.stats;
    return React.createElement(
      'div',
      { className: 'bg-surface rounded-xl shadow-sm border border-line p-5 flex-1 flex flex-col justify-between surface-highlight transition-all' },
      React.createElement(
        'h3',
        { className: 'text-lg font-display text-ink mb-4' },
        title
      ),
      React.createElement(
        'div',
        { className: 'flex flex-col gap-3' },
        React.createElement(
          'div',
          { className: 'flex justify-between items-center text-sm' },
          React.createElement(
            'span',
            { className: 'text-ink-soft' },
            'إجمالي المبيعات'
          ),
          React.createElement(
            'span',
            { className: 'font-medium text-ink tabular-nums' },
            formatTND(stats.totalSales),
            ' د.ت'
          )
        ),
        React.createElement(
          'div',
          { className: 'flex justify-between items-center text-sm' },
          React.createElement(
            'span',
            { className: 'text-ink-soft' },
            'رسوم التوصيل'
          ),
          React.createElement(
            'span',
            { className: 'tabular-nums text-neg', dir: 'ltr' },
            '−',
            formatTND(stats.totalRuleFeeDelivery),
            ' د.ت'
          )
        ),
        React.createElement(
          'div',
          { className: 'flex justify-between items-center text-sm' },
          React.createElement(
            'span',
            { className: 'text-ink-soft' },
            'رسوم الإرجاع'
          ),
          React.createElement(
            'span',
            { className: 'tabular-nums text-neg', dir: 'ltr' },
            '−',
            formatTND(stats.totalRuleFeeReturn),
            ' د.ت'
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'pt-4 mt-4 border-t border-line flex flex-col items-start gap-4', 'aria-live': 'polite' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            { className: 'text-[10px] uppercase tracking-wide text-ink-faint mb-1' },
            'صافي وفق القاعدة'
          ),
          React.createElement(
            'span',
            { className: 'text-4xl sm:text-5xl font-mono font-extrabold text-ink leading-tight tabular-nums tracking-tight' },
            React.createElement(AnimatedNumber, { value: stats.netRule })
          )
        ),
        stats.hasCarrierFee && React.createElement(
          'div',
          { className: 'w-full flex justify-between bg-surface-2 p-3 rounded-lg border border-line mt-2' },
          React.createElement(
            'div',
            { className: 'flex flex-col' },
            React.createElement(
              'span',
              { className: 'text-[10px] uppercase tracking-wide text-ink-faint mb-0.5' },
              'صافي وفق الفاتورة'
            ),
            React.createElement(
              'span',
              { className: 'text-lg font-mono font-bold text-ink tabular-nums' },
              React.createElement(AnimatedNumber, { value: stats.netCarrier })
            )
          ),
          React.createElement(
            'div',
            { className: 'flex flex-col text-right' },
            React.createElement(
              'span',
              { className: 'text-[10px] uppercase tracking-wide text-ink-faint mb-0.5' },
              'الفرق'
            ),
            React.createElement(
              'span',
              { className: 'text-lg font-mono font-bold tabular-nums ' + (stats.netCarrier - stats.netRule < 0 ? 'text-neg' : stats.netCarrier - stats.netRule > 0 ? 'text-pos' : 'text-ink-soft'), dir: 'ltr' },
              stats.netCarrier - stats.netRule < 0 ? '−' : stats.netCarrier - stats.netRule > 0 ? '+' : '',
              formatTND(Math.abs(stats.netCarrier - stats.netRule))
            )
          )
        )
      )
    );
  };

  var netTotalRevenue = cakadoStats.netRule + balkisStats.netRule;

  var carrierBadge = activeCarrier === 'CONVERTY' ? 'First Delivery' : activeCarrier === 'LOGISTA' ? 'BigBoss' : activeCarrier === 'INTIGO' ? 'Intigo' : activeCarrier || 'لا يوجد';

  var isIntigoLocked = activeCarrier === 'INTIGO';

  return React.createElement(
    'div',
    { className: 'flex flex-col min-h-screen pb-24 text-ink transition-colors duration-250' },
    React.createElement(
      'div',
      { className: 'sticky top-0 z-40 flex flex-col' },
      React.createElement(
        'header',
        { className: 'bg-surface/95 backdrop-blur shadow-sm border-b border-line sheen' },
        React.createElement(
          'div',
          { className: 'max-w-7xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3' },
          React.createElement(
            'div',
            { className: 'flex items-center justify-between w-full md:w-auto gap-4' },
            React.createElement(
              'div',
              { className: 'flex items-center gap-3 shrink-0' },
              React.createElement(
                'span',
                { className: 'bg-surface-2 border border-line text-ink-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded' },
                carrierBadge
              ),
              isEnriching && React.createElement(
                'div',
                { className: 'w-16 h-1 bg-surface-2 rounded-full overflow-hidden ml-2', 'aria-live': 'polite', 'aria-label': 'جاري الجلب: ' + enrichProgress.current + ' من ' + enrichProgress.total },
                React.createElement('div', { className: 'bg-brand h-full transition-all duration-300', style: { width: Math.max(5, enrichProgress.current / (enrichProgress.total || 1) * 100) + '%' } })
              )
            ),
            React.createElement(
              'div',
              { className: 'flex flex-col items-end md:items-center shrink-0', 'aria-live': 'polite' },
              React.createElement(
                'span',
                { className: 'text-[10px] text-ink-faint uppercase tracking-wider mb-0.5' },
                'صافي الإيرادات / NET'
              ),
              React.createElement(
                'span',
                { className: 'font-mono font-extrabold text-2xl md:text-3xl leading-none text-ink tabular-nums', dir: 'ltr' },
                React.createElement(AnimatedNumber, { value: netTotalRevenue })
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto' },
            React.createElement(
              'div',
              { className: 'w-full md:w-auto flex items-center' },
              React.createElement(
                'div',
                { className: 'flex items-center gap-1.5 bg-surface-2 px-3 py-1.5 rounded-full border border-line w-full md:w-48' },
                React.createElement('input', {
                  type: 'password',
                  value: intigoApiKey,
                  onChange: function (e) {
                    setIntigoApiKey(e.target.value);
                    localStorage.setItem('intigoApiKey', e.target.value);
                  },
                  placeholder: 'ألصق مفتاح Intigo API هنا',
                  className: 'bg-transparent border-none outline-none text-xs w-full text-ink font-mono tracking-widest',
                  dir: 'ltr'
                })
              )
            ),
            React.createElement(
              'div',
              { className: 'flex flex-wrap items-center justify-end gap-2 shrink-0 w-full md:w-auto' },
              React.createElement(
                'button',
                { onClick: handleClearCache, className: 'shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold', 'aria-label': 'مسح ذاكرة المنتجات', title: 'مسح ذاكرة المنتجات وتحديث الأسماء' },
                'مسح ذاكرة المنتجات'
              ),
              React.createElement('span', { className: 'shrink-0 w-2.5 h-2.5 rounded-full mx-1 ' + (healthStatus === 'connected' ? 'bg-pos' : healthStatus === 'offline' || healthStatus === 'endpoint_unknown' ? 'bg-warn animate-pulse' : healthStatus === 'checking' ? 'bg-brand animate-pulse' : 'bg-neg'), title: healthStatus === 'connected' ? 'متصل' : healthStatus === 'offline' ? 'غير متصل' : healthStatus === 'endpoint_unknown' ? 'تعذّر التحقق من الصحة — سيتم التأكد عند أول طلب' : healthStatus === 'checking' ? 'جاري التحقق...' : 'مفتاح API غير صالح' }),
              React.createElement(
                'button',
                {
                  type: 'button',
                  role: 'switch',
                  'aria-checked': theme === 'console',
                  'aria-label': theme === 'console' ? "الوضع النهاري" : "الوضع الليلي",
                  title: theme === 'console' ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي",
                  onClick: toggleTheme,
                  className: 'relative inline-flex shrink-0 items-center min-h-[44px] px-1 select-none cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] bg-transparent border-none',
                  style: { transition: "background-color 250ms ease, border-color 250ms ease" }
                },
                React.createElement(
                  'span',
                  {
                    className: 'relative flex w-14 h-8 shrink-0 items-center rounded-full border',
                    style: {
                      backgroundColor: theme === 'console' ? "var(--surface-2)" : "#E2E7EE",
                      borderColor: "var(--line)",
                      transition: "background-color 250ms ease"
                    }
                  },
                  React.createElement(
                    'span',
                    { dir: 'ltr', className: 'absolute inset-inline-start-1.5 text-[12px] leading-none', style: { color: theme === 'console' ? "var(--ink-faint)" : "var(--warn)" }, 'aria-hidden': 'true' },
                    '☀'
                  ),
                  React.createElement(
                    'span',
                    { dir: 'ltr', className: 'absolute inset-inline-end-1.5 text-[12px] leading-none', style: { color: theme === 'console' ? "var(--brand)" : "var(--ink-faint)" }, 'aria-hidden': 'true' },
                    '☾'
                  ),
                  React.createElement('span', {
                    className: 'absolute top-1 h-6 w-6 rounded-full shadow-sm flex items-center justify-center',
                    style: {
                      insetInlineStart: theme === 'console' ? "calc(100% - 1.75rem)" : "0.25rem",
                      backgroundColor: theme === 'console' ? "var(--brand)" : "#FFFFFF",
                      transition: "inset-inline-start 220ms cubic-bezier(.34,1.56,.64,1), background-color 250ms ease"
                    },
                    'aria-hidden': 'true'
                  })
                )
              ),
              React.createElement(
                'button',
                { onClick: handleNewCompanyClick, className: 'shrink-0 flex items-center gap-1.5 px-4 min-h-[44px] bg-transparent border border-line text-ink-soft hover:text-brand hover:border-brand transition-colors rounded-full text-xs font-bold', 'aria-label': 'مسح الجلسة الحالية والبدء بشركة توصيل أخرى', title: 'مسح الجلسة الحالية والبدء بشركة توصيل أخرى' },
                React.createElement(
                  'span',
                  null,
                  'شركة جديدة'
                ),
                React.createElement(
                  'svg',
                  { className: 'w-4 h-4 shrink-0', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
                )
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'bg-bg/95 backdrop-blur border-b border-line px-4 md:px-6 py-3' },
        React.createElement(
          'div',
          { className: 'max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3 md:gap-6' },
          React.createElement(
            'div',
            { className: 'flex-1 flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-1.5 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand transition-all' },
            React.createElement(
              'span',
              { className: 'text-ink-soft text-sm' },
              '🔍'
            ),
            React.createElement('input', {
              type: 'text',
              className: 'bg-transparent border-none outline-none w-full text-sm text-ink placeholder-ink-faint',
              placeholder: 'بحث عن منتج، باركود، هاتف...',
              value: searchQuery,
              onChange: function (e) {
                return setSearchQuery(e.target.value);
              }
            })
          ),
          React.createElement(
            'div',
            { className: 'flex items-center gap-2 overflow-x-auto hide-scrollbar' },
            ['all', 'delivered', 'returned', 'in_progress', 'cancelled', 'error'].map(function (status) {
              var label = status === 'all' ? 'الكل' : status === 'delivered' ? 'مُسلّم' : status === 'returned' ? 'مسترجع' : status === 'in_progress' ? 'قيد التنفيذ' : status === 'cancelled' ? 'ملغي' : '⚠ خطأ';
              var active = filterStatus === status;
              return React.createElement(
                'button',
                {
                  key: status,
                  'aria-pressed': active,
                  onClick: function () {
                    return setFilterStatus(status);
                  },
                  className: 'focus-visible:ring-2 focus-visible:ring-brand focus:outline-none whitespace-nowrap px-3 py-1.5 min-h-[44px] rounded-full text-xs font-medium transition-colors ' + (active ? 'bg-ink text-surface' : 'bg-surface border border-line text-ink-soft hover:bg-surface-2')
                },
                label
              );
            })
          ),
          React.createElement(
            'div',
            { className: 'flex items-center gap-2 whitespace-nowrap' },
            React.createElement(
              'select',
              {
                className: 'text-xs bg-surface border border-line rounded-lg px-3 py-2 text-ink outline-none focus:border-brand',
                value: sortOption,
                onChange: function (e) {
                  return setSortOption(e.target.value);
                }
              },
              React.createElement(
                'option',
                { value: 'default' },
                'الترتيب الافتراضي'
              ),
              React.createElement(
                'option',
                { value: 'price-desc' },
                'السعر (الأعلى)'
              ),
              React.createElement(
                'option',
                { value: 'price-asc' },
                'السعر (الأقل)'
              ),
              React.createElement(
                'option',
                { value: 'city' },
                'الولاية'
              ),
              React.createElement(
                'option',
                { value: 'status' },
                'الحالة'
              ),
              React.createElement(
                'option',
                { value: 'product' },
                'الاسم (أ - ي)'
              )
            )
          )
        )
      )
    ),
    React.createElement(
      'main',
      { className: 'flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6' },
      !masterRows.length && !cakadoRows.length && !balkisRows.length && React.createElement(
        'label',
        {
          className: 'border-2 border-dashed border-line bg-surface hover:bg-surface-2 transition-colors rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer text-center group',
          onDrop: onDropFile,
          onDragOver: handleDragOver
        },
        React.createElement(
          'div',
          { className: 'w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform' },
          React.createElement(
            'svg',
            { className: 'w-8 h-8 text-brand', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' })
          )
        ),
        React.createElement(
          'span',
          { className: 'font-display text-xl text-ink mb-2' },
          'اسحب الطلبات إلى هنا'
        ),
        React.createElement(
          'span',
          { className: 'text-sm text-ink-soft' },
          'أو انقر لاختيار ملف (.xlsx, .csv)'
        ),
        React.createElement(
          'span',
          { className: 'text-xs text-ink-faint mt-4 bg-surface-2 px-3 py-1.5 rounded-full' },
          'الحالات محدّثة حتى تاريخ تصدير الملف — أعد رفع الملف لتحديثها.'
        ),
        React.createElement('input', { type: 'file', accept: '.xlsx,.csv', className: 'hidden', onChange: onFileInputChange })
      ),
      error && React.createElement(
        'div',
        { className: 'bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-center gap-3' },
        React.createElement(
          'svg',
          { className: 'w-5 h-5 flex-shrink-0', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
        ),
        React.createElement(
          'p',
          { className: 'text-sm font-medium' },
          error
        )
      ),
      autoFeesInfo && React.createElement(
        'div',
        { className: 'bg-pos/10 text-pos border border-pos/20 rounded-lg p-4 flex items-center gap-3' },
        React.createElement(
          'svg',
          { className: 'w-5 h-5 flex-shrink-0', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
        ),
        React.createElement(
          'p',
          { className: 'text-sm font-medium' },
          'تم ضبط الرسوم تلقائياً من Logista.'
        )
      ),
      unrecognizedStatuses.length > 0 && React.createElement(
        'div',
        { className: 'bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2' },
        React.createElement(
          'svg',
          { className: 'w-5 h-5 flex-shrink-0 mt-0.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
        ),
        React.createElement(
          'div',
          { className: 'flex-1' },
          React.createElement(
            'p',
            { className: 'text-sm font-medium mb-1' },
            'حالات غير معروفة لم تُحتسب ضمن الإيرادات — راجع التصنيف:'
          ),
          React.createElement(
            'p',
            { className: 'text-xs opacity-80 font-mono', dir: 'ltr' },
            unrecognizedStatuses.slice(0, 6).join(', '),
            unrecognizedStatuses.length > 6 ? ' و...' : ''
          )
        ),
        React.createElement(
          'button',
          { onClick: function () {
              return setUnrecognizedStatuses([]);
            }, className: 'absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center' },
          React.createElement(
            'svg',
            { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M6 18L18 6M6 6l12 12' })
          )
        )
      ),
      duplicateNids.length > 0 && React.createElement(
        'div',
        { className: 'bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2' },
        React.createElement(
          'svg',
          { className: 'w-5 h-5 flex-shrink-0 mt-0.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
        ),
        React.createElement(
          'div',
          { className: 'flex-1' },
          React.createElement(
            'p',
            { className: 'text-sm font-medium mb-1' },
            'تم العثور على ',
            duplicateNids.length,
            ' معرفات (NID) مكررة في الملف وتم تجاهل التكرار:'
          ),
          React.createElement(
            'p',
            { className: 'text-xs opacity-80 font-mono', dir: 'ltr' },
            duplicateNids.slice(0, 6).join(', '),
            duplicateNids.length > 6 ? ' و...' : ''
          )
        ),
        React.createElement(
          'button',
          { onClick: function () {
              return setDuplicateNids([]);
            }, className: 'absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center' },
          React.createElement(
            'svg',
            { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M6 18L18 6M6 6l12 12' })
          )
        )
      ),
      !dismissedUnknownGovs && (cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (function () {
        var unk = [].concat(_toConsumableArray(new Set([].concat(_toConsumableArray(cakadoStats.newUnknownGovs), _toConsumableArray(balkisStats.newUnknownGovs)))));
        if (unk.length > 0) {
          return React.createElement(
            'div',
            { className: 'bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2' },
            React.createElement(
              'svg',
              { className: 'w-5 h-5 flex-shrink-0 mt-0.5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
            ),
            React.createElement(
              'div',
              { className: 'flex-1' },
              React.createElement(
                'p',
                { className: 'text-sm font-medium mb-1' },
                'ولايات غير معروفة في خريطة الرسوم (تم احتساب 2 د.ت):'
              ),
              React.createElement(
                'p',
                { className: 'text-xs opacity-80', dir: 'ltr' },
                unk.slice(0, 6).join(', '),
                unk.length > 6 ? ' و...' : ''
              ),
              React.createElement(
                'p',
                { className: 'text-xs opacity-80 mt-1' },
                'أضفها لتفادي الخطأ.'
              )
            ),
            React.createElement(
              'button',
              { onClick: function () {
                  return setDismissedUnknownGovs(true);
                }, className: 'absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center' },
              React.createElement(
                'svg',
                { className: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
                React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M6 18L18 6M6 6l12 12' })
              )
            )
          );
        }
        return null;
      })(),
      (masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) && React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'div',
          { className: 'flex flex-col md:flex-row gap-6' },
          React.createElement(BrandSummaryCard, { title: 'كاكادو (CAKADO)', stats: cakadoStats }),
          React.createElement(BrandSummaryCard, { title: 'بلقيس (Balkis)', stats: balkisStats })
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
          React.createElement(
            'div',
            { className: 'order-1 lg:order-none' },
            renderTable(viewMaster, 'غير مصنفة', 'master', true, '')
          ),
          React.createElement(
            'div',
            { className: 'order-2 lg:order-none' },
            renderTable(viewCakado, 'كاكادو', 'cakado', true, 'var(--brand)'),
            renderFeeInputs(cakadoFees, setCakadoFees, isIntigoLocked)
          ),
          React.createElement(
            'div',
            { className: 'order-3 lg:order-none' },
            renderTable(viewBalkis, 'بلقيس', 'balkis', true, '#3b82f6'),
            renderFeeInputs(balkisFees, setBalkisFees, isIntigoLocked)
          )
        )
      ),
      selectedIds.size > 0 && React.createElement(
        'div',
        { className: 'fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none' },
        React.createElement(
          'div',
          { className: 'max-w-3xl mx-auto bg-surface border border-line text-ink rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto surface-highlight' },
          React.createElement(
            'div',
            { className: 'flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start px-2' },
            React.createElement(
              'div',
              { className: 'flex items-center gap-2' },
              React.createElement(
                'span',
                { className: 'font-bold text-sm bg-brand text-white px-2.5 py-0.5 rounded-full shadow-sm' },
                selectedIds.size
              ),
              React.createElement(
                'span',
                { className: 'text-ink-soft font-medium text-sm' },
                'محدد'
              )
            ),
            React.createElement(
              'button',
              { onClick: function () {
                  return setSelectedIds(new Set());
                }, className: 'text-ink-faint hover:text-ink text-sm font-medium px-2 py-1 rounded transition-colors' },
              'إلغاء'
            )
          ),
          React.createElement(
            'div',
            { className: 'flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar' },
            React.createElement(
              'button',
              { onClick: function () {
                  return moveSelected('master');
                }, className: 'flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-surface-2 hover:bg-line text-ink rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5' },
              'إلى غير مصنفة'
            ),
            React.createElement(
              'button',
              { onClick: function () {
                  return moveSelected('cakado');
                }, className: 'flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-brand/20' },
              'تعيين كاكادو'
            ),
            React.createElement(
              'button',
              { onClick: function () {
                  return moveSelected('balkis');
                }, className: 'flex-1 sm:flex-none whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-600/20' },
              'تعيين بلقيس'
            )
          )
        )
      ),
      showResetModal && React.createElement(
        'div',
        { className: 'fixed inset-0 z-50 flex items-center justify-center p-4' },
        React.createElement('div', { className: 'absolute inset-0 bg-[#0B1220]/60 backdrop-blur-sm transition-opacity', onClick: function () {
            return setShowResetModal(false);
          } }),
        React.createElement(
          'div',
          { className: 'relative bg-surface border border-line rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200' },
          React.createElement(
            'h2',
            { className: 'font-display text-xl text-ink mb-2' },
            'بدء جلسة جديدة؟'
          ),
          React.createElement(
            'p',
            { className: 'text-ink-soft text-sm mb-6 leading-relaxed' },
            'سيتم مسح جميع الطلبات المصنّفة والنتائج الحالية لشركة التوصيل هذه. لا يمكن التراجع عن هذا الإجراء.'
          ),
          React.createElement(
            'div',
            { className: 'flex gap-3 justify-end' },
            React.createElement(
              'button',
              { onClick: function () {
                  return setShowResetModal(false);
                }, className: 'px-4 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-surface-2 border border-transparent transition-colors' },
              'إلغاء'
            ),
            React.createElement(
              'button',
              { onClick: resetSession, className: 'px-4 py-2 rounded-lg text-sm font-bold text-white bg-neg hover:bg-neg/90 transition-colors shadow-sm shadow-neg/20' },
              'مسح والبدء'
            )
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'fixed right-4 sm:right-8 flex flex-col gap-2 z-40 transition-all duration-300 ' + (selectedIds.size > 0 ? 'bottom-[100px]' : 'bottom-6') },
        React.createElement(
          'button',
          { onClick: scrollToTop, className: 'p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ' + (scrollPos.top ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'), 'aria-label': 'أعلى الصفحة' },
          React.createElement(
            'svg',
            { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M5 15l7-7 7 7' })
          )
        ),
        React.createElement(
          'button',
          { onClick: scrollToBottom, className: 'p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ' + (scrollPos.bottom ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'), 'aria-label': 'أسفل الصفحة' },
          React.createElement(
            'svg',
            { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M19 9l-7 7-7-7' })
          )
        )
      )
    )
  );
}

var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
/* Sticky Header Group */ /* Command Bar */ /* Row A on mobile, Left on desktop */ /* Row B & C on mobile, Right on desktop */ /* Row B: API Key */ /* Row C: Controls */ /* Search/Filter Bar */ /* Upload Zone */ /* Toasts / Errors */ /* Instruments */ /* Trays */ /* Floating Selection Bar */ /* Reset Modal */ /* Scroll Nav FABs */
