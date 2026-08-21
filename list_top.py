import re

with open('app_full.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# simple regex for functions and consts
matches = re.findall(r'^(?:const|let|var|function)\s+([a-zA-Z0-9_]+)', code, re.MULTILINE)
print(matches)
