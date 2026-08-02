import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace(
    "const cakadoStats = calculateStats(cakadoRows, cakadoFees);",
    "const cakadoStats = useMemo(() => calculateStats(cakadoRows, cakadoFees), [cakadoRows, cakadoFees]);"
)
html = html.replace(
    "const balkisStats = calculateStats(balkisRows, balkisFees);",
    "const balkisStats = useMemo(() => calculateStats(balkisRows, balkisFees), [balkisRows, balkisFees]);"
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
