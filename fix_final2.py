import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove duplicate APP_VERSION
html = html.replace("    const APP_VERSION = 'v1.0';\n\nconst APP_VERSION = 'v1.0';", "const APP_VERSION = 'v1.0';")
html = html.replace("    const APP_VERSION = 'v1.0';\nconst APP_VERSION = 'v1.0';", "const APP_VERSION = 'v1.0';")


# Fix checkHealth call in App
call_str = r"""      useEffect(() => {
         const t = setTimeout(() => { checkHealth(intigoApiKey); }, 500);
         return () => clearTimeout(t);
      }, [intigoApiKey, checkHealth]);"""
call_replacement = r"""      useEffect(() => {
         const t = setTimeout(() => { 
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => checkHealth(intigoApiKey, setHealthStatus));
            } else {
                checkHealth(intigoApiKey, setHealthStatus);
            }
         }, 500);
         return () => clearTimeout(t);
      }, [intigoApiKey]);"""
html = html.replace(call_str, call_replacement)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
