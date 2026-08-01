const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_move = `      const moveSelected = (targetZone) => {
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
        const movingRows = allRows.filter(r => idsToMove.has(r.id));`;
        
const r_move = `      const moveSelected = (targetZone) => {
        const idsToMove = new Set(selectedIds);
        
        // Gather from all first:
        const allRows = [...masterRows, ...cakadoRows, ...balkisRows];
        const movingRows = allRows.filter(r => idsToMove.has(r.id));`;

html = html.replace(s_move, r_move);
fs.writeFileSync('index.html', html);
console.log("moveSelected modified");
