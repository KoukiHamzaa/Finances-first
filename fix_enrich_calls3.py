with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix checkIsCancelled
import re
html = re.sub(r'checkIsCancelled:\s*\(\)\s*=>\s*currentUploadId\.current !== currentUploadId\.current', 'checkIsCancelled: function() { return thisUploadId !== currentUploadId.current; }', html)

# Wait, `thisUploadId` might not be defined for line 1244.
# Let's fix line 1244 to define it.
html = html.replace('setTimeout(() => enrichIntigoRows(allToEnrich, intigoApiKey, currentUploadId.current, {', 'const thisUploadId = currentUploadId.current; setTimeout(() => enrichIntigoRows(allToEnrich, intigoApiKey, thisUploadId, {')

html = html.replace('enrichIntigoRows([{ ...row, needsEnrichment: true }], intigoApiKey, currentUploadId.current, {', 'const thisUploadId = currentUploadId.current; enrichIntigoRows([{ ...row, needsEnrichment: true }], intigoApiKey, thisUploadId, {')

# Wait, the `// wait, for timeout ...` comment should be removed
html = re.sub(r'// wait, for timeout we need a captured one, or just use currentUploadId\.current', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
