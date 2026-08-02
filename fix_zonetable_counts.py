import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = r"const delCount = rows\.filter\(r=>r\.status==='delivered'\)\.length;\s*const retCount = rows\.filter\(r=>r\.status==='returned'\)\.length;\s*const inProgCount = rows\.filter\(r=>r\.status==='in_progress' \|\| r\.status==='return_in_progress'\)\.length;\s*const cancelCount = rows\.filter\(r=>r\.status==='cancelled'\)\.length;\s*const exchCount = rows\.filter\(r=>r\.status==='exchange'\)\.length;\s*let headerCounts = \[\];"

new_code = """const { delCount, retCount, inProgCount, cancelCount, exchCount, prepaidCount } = useMemo(() => {
          return {
            delCount: rows.filter(r=>r.status==='delivered').length,
            retCount: rows.filter(r=>r.status==='returned').length,
            inProgCount: rows.filter(r=>r.status==='in_progress' || r.status==='return_in_progress').length,
            cancelCount: rows.filter(r=>r.status==='cancelled').length,
            exchCount: rows.filter(r=>r.status==='exchange').length,
            prepaidCount: rows.filter(r=>r.status==='delivered' && r.totalSales === 0).length
          };
        }, [rows]);
        let headerCounts = [];"""

html = re.sub(pattern, new_code, html)
html = html.replace("const prepaidCount = rows.filter(r=>r.status==='delivered' && r.totalSales === 0).length;", "")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
