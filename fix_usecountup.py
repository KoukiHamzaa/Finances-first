import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'\s*function useCountUp\(val, duration = 400\) \{[\s\S]*?return current;\s*\}\s*'
html = re.sub(pattern, '\n', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
