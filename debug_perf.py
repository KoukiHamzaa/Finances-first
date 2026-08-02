import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace("const toggleSelect = (e, id) => {", "const toggleSelect = (e, id) => {\nconsole.time('toggleSelect');")
html = html.replace("setSelectedIds(newSet);\n      };", "setSelectedIds(newSet);\nconsole.timeEnd('toggleSelect');\n      };")

html = html.replace("function App() {", "function App() {\nconsole.time('App Render');\nuseEffect(() => { console.timeEnd('App Render'); });")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
