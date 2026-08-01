import re

with open('original_index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. SPLASH SCREEN
splash_html = """
<div id="boot-splash" style="position:fixed;inset:0;z-index:9999;background-color:#ECEFF3;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Reem Kufi', sans-serif;">
  <div style="font-size:24px;font-weight:700;color:#0B1220;margin-bottom:24px;">لوحة إدارة الطلبات</div>
  <div style="width:200px;height:4px;background-color:rgba(15, 118, 110, 0.2);border-radius:2px;overflow:hidden;position:relative;">
    <div id="splash-progress" style="position:absolute;left:0;top:0;height:100%;width:40%;background-color:#0F766E;border-radius:2px;transition:left 0.5s ease-in-out;"></div>
  </div>
  <style>
    @keyframes sweep {
      0% { left: -40%; }
      100% { left: 100%; }
    }
    #splash-progress {
      animation: sweep 1.5s infinite ease-in-out;
    }
  </style>
  <div style="margin-top:12px;font-size:12px;color:#0B1220;opacity:0.7;font-family:'Tajawal', sans-serif;">جارٍ التحميل…</div>
</div>
"""
html = html.replace('<div id="root" dir="rtl"></div>', splash_html + '\n    <div id="root" dir="rtl"></div>')

# 2. Extract Pure JS
babel_start = html.find('<script type="text/babel">')
babel_prefix = html[:babel_start]
babel_content = html[babel_start:]

# Find App start
app_start_match = re.search(r'function App\(\)\s*\{', babel_content)
app_start_idx = app_start_match.start()

pure_js_1 = babel_content[27:app_start_idx] # skip <script ...> const { useState...
pure_js_1 = re.sub(r'const \{[^\}]+\}\s*=\s*React;', '', pure_js_1)

# Extract functions from App
def extract_func(name, content, is_async=False):
    pattern = r'(?:const\s+' + name + r'\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{|async\s+function\s+' + name + r'\s*\([^)]*\)\s*\{)'
    match = re.search(pattern, content)
    if not match: return "", content
    start_idx = match.start()
    
    # find matching brace
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break
    
    func_code = content[start_idx:end_idx]
    # remove from content
    new_content = content[:start_idx] + content[end_idx:]
    return func_code, new_content

app_content = babel_content[app_start_idx:]
extracted_funcs = {}
for fn in ['checkHealth', 'isValidName', 'getCachedName', 'setCachedName', 'enrichIntigoRows', 'calculateStats']:
    code, app_content = extract_func(fn, app_content)
    extracted_funcs[fn] = code

# Rewrite enrichIntigoRows
enrich = extracted_funcs['enrichIntigoRows']
# Remove list-join block
enrich = re.sub(r'const listJoinMap = new Map\(\);.*?try \{.*?const res = await fetch\(`https://api\.intigo\.net/api/v3/parcels/`.*?} catch \(e\) \{\}', '', enrich, flags=re.DOTALL)
enrich = re.sub(r'if \(listJoinMap\.has\(row\.nid\)\) \{.*?\} else \{', 'if (false) {} else {', enrich, flags=re.DOTALL)

# Modify enrichIntigoRows signature and replace React setters
enrich = enrich.replace('const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId) => {', 'const enrichIntigoRows = async (rowsToEnrich, apiKey, uploadId, callbacks) => {\n        const { setIsEnriching, setEnrichProgress, setError, setHealthStatus, onBatchResolved, checkIsCancelled } = callbacks;')
enrich = enrich.replace('if (uploadId !== currentUploadId.current)', 'if (checkIsCancelled())')

# Handle batch updates correctly in enrichIntigoRows (Section 4 batch write-backs)
# We will replace the batch updating logic.
batch_update_pattern = r'if \(updatedRowsPart\.length >= 10 \|\| current === rowsToEnrich\.length\) \{.*?(setEnrichProgress\([^)]+\);).*?\}'
batch_update_replacement = """
if (updatedRowsPart.length >= 10 || current === rowsToEnrich.length) {
    onBatchResolved([...updatedRowsPart]);
    updatedRowsPart = [];
    setEnrichProgress({ current, total: rowsToEnrich.length, errors });
}
"""
enrich = re.sub(r'if \(updatedRowsPart\.length >= 10 \|\| current === rowsToEnrich\.length\) \{[\s\S]*?(?=\s+if\s*\(checkIsCancelled\(\)\s*\)\s*\{\s*setIsEnriching\(false\))', batch_update_replacement, enrich)

# Also fix the 401 error batch updating logic
error_batch_pattern = r'const batch = \[\.\.\.updatedRowsPart, row\];[\s\S]*?setBalkisRows.*?setEnrichProgress'
error_batch_replacement = """
const batch = [...updatedRowsPart, row];
for (let j = i + 1; j < rowsToEnrich.length; j++) {
   const rem = { ...rowsToEnrich[j], enrichState: 'error', hasError: true, needsEnrichment: true, productName: 'توقف بسبب خطأ في المفتاح' };
   batch.push(rem);
}
onBatchResolved(batch);
setEnrichProgress"""
enrich = re.sub(error_batch_pattern, error_batch_replacement, enrich)

extracted_funcs['enrichIntigoRows'] = enrich

# Rewrite checkHealth
health = extracted_funcs['checkHealth']
health = health.replace('const checkHealth = useCallback(async (key) => {', 'const checkHealth = async (key, callbacks) => {\n    const { setHealthStatus, checkHealthRef } = callbacks;')
health = health.replace('checkHealth(intigoApiKey)', 'checkHealthRef.current(key)')
health = re.sub(r'\}, \[intigoApiKey, checkHealth\]\);', '};', health)
extracted_funcs['checkHealth'] = health

# Reconstruct plain JS
plain_js = "<script>\n" + pure_js_1 + "\n"
plain_js += f"const APP_VERSION = 'v1.0';\nconst CACHE_KEY_PREFIX = 'intigo_nid_';\n"
plain_js += extracted_funcs['isValidName'] + "\n"
plain_js += extracted_funcs['getCachedName'] + "\n"
plain_js += extracted_funcs['setCachedName'] + "\n"
plain_js += extracted_funcs['calculateStats'] + "\n"
plain_js += extracted_funcs['checkHealth'] + "\n"
plain_js += extracted_funcs['enrichIntigoRows'] + "\n"
plain_js += "</script>\n"

with open('refactored_part1.html', 'w', encoding='utf-8') as f:
    f.write(babel_prefix + plain_js + '<script type="text/babel">\nconst { useState, useCallback, useMemo, useRef, useEffect, startTransition } = React;\n' + app_content)

