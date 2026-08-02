import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_retry = """      const handleRetryEnrichment = (e, row) => {
        e.stopPropagation();
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current, {"""

new_retry = """      const handleRetryEnrichment = useCallback((e, row) => {
        e.stopPropagation();
        enrichIntigoRows([row], intigoApiKey, currentUploadId.current, {"""

html = html.replace(old_retry, new_retry)
html = html.replace("onFinish: () => {}\n        });\n      };", "onFinish: () => {}\n        });\n      }, [intigoApiKey]);")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
