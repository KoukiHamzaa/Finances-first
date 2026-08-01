import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find progressStore
ps_pattern = r'const progressStore = \{[\s\S]*?\};\n'
ps_match = re.search(ps_pattern, html)
if ps_match:
    ps_code = ps_match.group(0)
    html = html[:ps_match.start()] + html[ps_match.end():]
    
    # Put it in pure js before checkHealth
    target = 'async function checkHealth'
    html = html.replace(target, ps_code + '\n' + target)
else:
    print("progressStore not found")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
