const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const originalReset = `      const resetSession = useCallback(() => {
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
        setEnrichProgress({ current: 0, total: 0, errors: 0 });
        setCakadoFees({ delivery: 0, return: 0 });
        setBalkisFees({ delivery: 0, return: 0 });
        setShowResetModal(false);
      }, []);`;

const replacement = `      const [unknownGovs, setUnknownGovs] = useState([]);
      const [duplicateNids, setDuplicateNids] = useState([]);
      const [healthStatus, setHealthStatus] = useState('checking');
      
      const checkHealth = useCallback(async (key) => {
        if (!key) { setHealthStatus('unauthorized'); return; }
        setHealthStatus('checking');
        try {
           let res = await fetch('https://api.intigo.net/api/v3/health', { headers: { 'X-API-Key': key } });
           if (res.status === 401) {
              setHealthStatus('unauthorized');
              return;
           }
           if (!res.ok) {
              res = await fetch('https://api.intigo.net/api/v3/health');
              if (res.ok) { setHealthStatus('connected'); return; }
              setHealthStatus('error');
              return;
           }
           setHealthStatus('connected');
        } catch (e) {
           setHealthStatus('error');
        }
      }, []);
      
      useEffect(() => {
         const t = setTimeout(() => { checkHealth(intigoApiKey); }, 500);
         return () => clearTimeout(t);
      }, [intigoApiKey, checkHealth]);

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
        setEnrichProgress({ current: 0, total: 0, errors: 0 });
        setCakadoFees({ delivery: 0, return: 0 });
        setBalkisFees({ delivery: 0, return: 0 });
        setShowResetModal(false);
        setUnknownGovs([]);
        setDuplicateNids([]);
      }, []);`;

if (html.includes(originalReset)) {
  html = html.replace(originalReset, replacement);
  fs.writeFileSync('index.html', html);
  console.log("Patch 3 successful");
} else {
  console.log("Could not find resetSession block");
  process.exit(1);
}
