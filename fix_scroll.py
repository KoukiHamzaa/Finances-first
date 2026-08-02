import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(
    "setScrollPos({ top: isTop, bottom: isBottom });",
    "setScrollPos(prev => (prev.top === isTop && prev.bottom === isBottom) ? prev : { top: isTop, bottom: isBottom });"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
