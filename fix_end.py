import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the end of ZoneTable which is right before function App() {
html = re.sub(
    r'\};\s*(?=function App\(\) \{)',
    r'});\n',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
