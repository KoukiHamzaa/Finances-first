const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const moveSelectedStart = "      const moveSelected = (targetZone) => {";
const moveSelectedEnd = "setSelectedIds(new Set());\n      };";

const newMoveSelected = `      const moveSelected = (targetZone) => {
        const idsToMove = new Set(selectedIds);
        
        setMasterRows(prev => {
           const toKeep = prev.filter(r => !idsToMove.has(r.id));
           if (targetZone === 'master') {
              const fromCakado = cakadoRows.filter(r => idsToMove.has(r.id));
              const fromBalkis = balkisRows.filter(r => idsToMove.has(r.id));
              const fromMaster = prev.filter(r => idsToMove.has(r.id)); // in case they were already there, though shouldn't happen normally, wait... Actually we need to gather all first.
           }
           // Wait, a functional updater for 3 arrays that depend on each other's previous states is tricky.
           // Since React state updates in one batch, it's safer to use the closure for gathering if we are sure it's the latest, but functional is required.
           return toKeep; // Wait, I will write this better
        });
        
        // Actually, let's gather from all first:
        const allRows = [...masterRows, ...cakadoRows, ...balkisRows];
        const movingRows = allRows.filter(r => idsToMove.has(r.id));
        
        setMasterRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'master' ? [...kept, ...movingRows] : kept;
        });
        setCakadoRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'cakado' ? [...kept, ...movingRows] : kept;
        });
        setBalkisRows(prev => {
           const kept = prev.filter(r => !idsToMove.has(r.id));
           return targetZone === 'balkis' ? [...kept, ...movingRows] : kept;
        });

        setSelectedIds(new Set());
      };`;

const s = html.indexOf(moveSelectedStart);
const e = html.indexOf(moveSelectedEnd, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newMoveSelected + html.substring(e + moveSelectedEnd.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 12 successful");
} else {
  console.log("Could not find moveSelected block");
  process.exit(1);
}
