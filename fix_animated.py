import re

with open('refactored_part3.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = re.sub(r'\s*const AnimatedNumber = \(\{ value \}\) => \{[\s\S]*?return <>\S+</>;\s*\};\s*', '\n', html)
html = re.sub(r'\s*function useCountUp\(val, duration = 400\) \{[\s\S]*?return displayValue;\s*\}\s*', '\n', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

