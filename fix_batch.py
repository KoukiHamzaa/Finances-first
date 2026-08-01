import re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix 401 error block
err_block = r"""                    const updateArr = \(arr\) => arr\.map\(pr => \{[\s\S]*?\}\);\s*setMasterRows\(prev => updateArr\(prev\)\);\s*setCakadoRows\(prev => updateArr\(prev\)\);\s*setBalkisRows\(prev => updateArr\(prev\)\);\s*progressStore\.set\(\{ current: 0, total: 0, errors: 0 \}\);"""
err_rep = """                    onBatchResolved(batch);
                    progressStore.set({ current, total: rowsToEnrich.length, errors });"""
html = re.sub(err_block, err_rep, html)

# Fix normal batch update
norm_block = r"""            const updateArr = \(arr\) => arr\.map\(pr => \{[\s\S]*?\}\);\s*setMasterRows\(prev => updateArr\(prev\)\);\s*setCakadoRows\(prev => updateArr\(prev\)\);\s*setBalkisRows\(prev => updateArr\(prev\)\);"""
norm_rep = """            onBatchResolved(batch);"""
html = re.sub(norm_block, norm_rep, html)

# Fix progressStore.set({ current: 0, total: 0, errors: 0 }) after updatedRowsPart = [];
norm_prog = r'updatedRowsPart = \[\];\s*progressStore\.set\(\{ current: 0, total: 0, errors: 0 \}\);'
norm_prog_rep = r'updatedRowsPart = [];\n            progressStore.set({ current, total: rowsToEnrich.length, errors });'
html = re.sub(norm_prog, norm_prog_rep, html)


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
