import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r'\s*const AnimatedNumber = \(\{ value \}\) => \{\s*const displayValue = useCountUp\(value, 400\);\s*return <>{formatTND\(displayValue\)}</>;\s*\};\s*'
html = re.sub(pattern, '\n', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
