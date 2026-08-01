import re

with open('refactored_part2.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract checkHealth
health_pattern = r'const checkHealth = useCallback\(async \(key\) => \{([\s\S]*?)\},\s*\[.*?\]\);'
health_match = re.search(health_pattern, html)
if health_match:
    health_body = health_match.group(1)
    # Remove it from App
    html = html[:health_match.start()] + html[health_match.end():]
    
    global_health = f"""
async function checkHealth(key, setHealthStatus) {{
{health_body}
}}
"""
    # Inject it before </script> of plain js
    plain_end = html.find('</script>\n<script type="text/babel">')
    html = html[:plain_end] + global_health + html[plain_end:]
else:
    print("checkHealth not found")

# 2. Fix setEnrichProgress
html = re.sub(r'setEnrichProgress\(\{.*?\}\);', 'progressStore.set({ current: 0, total: 0, errors: 0 });', html)
# We also have to fix progressStore.set call. Actually the only place setEnrichProgress was called in App is in `resetSession` and at the start.
# Wait, I already removed it from App? No, `setEnrichProgress` might be there.
# Let's replace setEnrichProgress(...) with progressStore.set(...)
html = re.sub(r'setEnrichProgress\(', 'progressStore.set(', html)

# 3. Fix checkHealth call in App to use requestIdleCallback
health_call = r'const t = setTimeout\(\(\) => \{ checkHealth\(intigoApiKey\); \}, 500\);\s*return \(\) => clearTimeout\(t\);'
health_deferred = """
const t = setTimeout(() => {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => checkHealth(intigoApiKey, setHealthStatus));
    } else {
        checkHealth(intigoApiKey, setHealthStatus);
    }
}, 500);
return () => clearTimeout(t);
"""
html = html.replace(health_call, health_deferred)

# 4. AnimatedNumber usages
# find `{formatTND(stats.netCarrier)}` and replace with `<AnimatedNumber value={stats.netCarrier} />`
html = re.sub(r'\{formatTND\((stats\.netCarrier|stats\.netRule|cakadoStats\.netRule|balkisStats\.netRule|netTotalRevenue)\)\}', r'<AnimatedNumber value={\1} />', html)

# 5. Splash fade-out
splash_effect = """
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
"""
app_body_start = html.find('function App() {\n') + len('function App() {\n')
html = html[:app_body_start] + splash_effect + html[app_body_start:]

# 6. Make enrichIntigoRows call in App correct
# App calls it as: `enrichIntigoRows(rowsToEnrich, intigoApiKey, thisUploadId);`
enrich_call = r'enrichIntigoRows\(([^,]+),\s*intigoApiKey,\s*thisUploadId\);'
enrich_replacement = r"""
enrichIntigoRows(\1, intigoApiKey, thisUploadId, {
    setIsEnriching,
    setHealthStatus,
    setError,
    checkIsCancelled: () => thisUploadId !== currentUploadId.current,
    onBatchResolved: (batch) => {
        const updateArr = (arr) => arr.map(pr => {
            const updated = batch.find(ur => ur.id === pr.id);
            return updated ? { ...pr, productName: updated.productName, phone: updated.phone, needsEnrichment: updated.needsEnrichment, hasError: updated.hasError, enrichState: updated.enrichState } : pr;
        });
        setMasterRows(prev => updateArr(prev));
        setCakadoRows(prev => updateArr(prev));
        setBalkisRows(prev => updateArr(prev));
    }
});
"""
html = re.sub(enrich_call, enrich_replacement, html)

# Also update the progress store in the global enrichIntigoRows function.
global_enrich_progress = r'setEnrichProgress\(\{ current, total: rowsToEnrich.length, errors \}\);'
html = html.replace(global_enrich_progress, 'progressStore.set({ current, total: rowsToEnrich.length, errors });')
global_enrich_progress2 = r'setEnrichProgress\(\{'
html = html.replace(global_enrich_progress2, 'progressStore.set({')


with open('refactored_part3.html', 'w', encoding='utf-8') as f:
    f.write(html)

