import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract ZoneTable body
start_idx = html.find("const ZoneTable = ({ rows, title, zone, selectable = false, accentColor = '' }) => {")
if start_idx == -1:
    print("Could not find ZoneTable")
    exit(1)

# Find the end of ZoneTable (before renderFeeInputs)
end_idx = html.find("const renderFeeInputs =", start_idx)
if end_idx == -1:
    print("Could not find end of ZoneTable")
    exit(1)

zonetable_code = html[start_idx:end_idx]
# Remove ZoneTable from inside App
html = html[:start_idx] + html[end_idx:]

# Rewrite ZoneTable code
new_zonetable = zonetable_code.replace(
    "const ZoneTable = ({ rows, title, zone, selectable = false, accentColor = '' }) => {",
    "const ZoneTable = React.memo(({ rows, title, zone, selectable = false, accentColor = '', selectedIds, onToggleSelectAll, onDrop, onToggleSelect, onDragStart, onMoveDirect, onRetry }) => {"
)
new_zonetable = new_zonetable.replace("toggleSelectAll(rows)", "onToggleSelectAll(rows)")
new_zonetable = new_zonetable.replace("handleDrop(e, zone)", "onDrop(e, zone)")
new_zonetable = new_zonetable.replace("onToggle={toggleSelect}", "onToggle={onToggleSelect}")
new_zonetable = new_zonetable.replace("onDragStart={handleDragStart}", "onDragStart={onDragStart}")
new_zonetable = new_zonetable.replace("onMoveDirect={moveSelectedDirectly}", "onMoveDirect={onMoveDirect}")
new_zonetable = new_zonetable.replace("onRetry={handleRetryEnrichment}", "onRetry={onRetry}")
new_zonetable = new_zonetable.replace("      };\n      ", "      });\n")

# Put it before function App() {
app_idx = html.find("function App() {")
html = html[:app_idx] + new_zonetable + "\n" + html[app_idx:]

# Update usages of ZoneTable
for zone_name in ['viewMaster', 'viewCakado', 'viewBalkis']:
    html = html.replace(
        f"<ZoneTable rows={{{zone_name}}}",
        f"<ZoneTable \n  selectedIds={{selectedIds}}\n  onToggleSelectAll={{toggleSelectAll}}\n  onDrop={{handleDrop}}\n  onToggleSelect={{toggleSelect}}\n  onDragStart={{handleDragStart}}\n  onMoveDirect={{moveSelectedDirectly}}\n  onRetry={{handleRetryEnrichment}}\n  rows={{{zone_name}}}"
    )

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
