const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_health = `      const checkHealth = useCallback(async (key) => {
        if (!key) { setHealthStatus('unauthorized'); return; }
        setHealthStatus('checking');
        try {
           let res = await fetch('https://api.intigo.net/api/v3/health', { headers: { 'X-API-Key': key } });
           if (res.status === 401) {
              setHealthStatus('unauthorized');
              return;
           }
           if (res.status === 404) {
              res = await fetch('https://api.intigo.net/health');
           }
           if (res.ok) {
              setHealthStatus('connected');
           } else {
              setHealthStatus('error');
           }
        } catch (e) {
           setHealthStatus('error');
        }
      }, []);`;

const r_health = `      const checkHealth = useCallback(async (key) => {
        if (!key) { setHealthStatus('unauthorized'); return; }
        setHealthStatus('checking');
        try {
           let res = await fetch('https://api.intigo.net/api/v3/health', { headers: { 'X-API-Key': key } });
           if (res.status === 401) {
              setHealthStatus('unauthorized');
              return;
           }
           if (res.ok) {
              setHealthStatus('connected');
              return;
           }
           if (res.status === 404) {
              res = await fetch('https://api.intigo.net/health', { headers: { 'X-API-Key': key } });
              if (res.ok) {
                 setHealthStatus('connected');
                 return;
              }
              if (res.status === 404) {
                 setHealthStatus('endpoint_unknown');
                 return;
              }
           }
           setHealthStatus('offline');
        } catch (e) {
           setHealthStatus('offline');
        }
      }, []);`;

if (html.includes(s_health)) {
  html = html.replace(s_health, r_health);
  console.log("Replaced health check");
} else { console.log("Not found health check"); }

fs.writeFileSync('index.html', html);
