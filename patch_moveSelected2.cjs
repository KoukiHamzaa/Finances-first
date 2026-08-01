const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_move = `      const moveSelected = (targetZone) => {
        const idsToMove = new Set(selectedIds);
        
        // Gather from all first:
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

const r_move = `      const moveSelected = (targetZone) => {
        setSelectedIds(prevIds => {
           const idsToMove = new Set(prevIds);
           if (idsToMove.size === 0) return new Set();
           
           let movingRows = [];
           
           setMasterRows(prev => {
              const fromHere = prev.filter(r => idsToMove.has(r.id));
              movingRows.push(...fromHere);
              return prev; // we'll update it properly below
           });
           
           // React batches these, but since we need movingRows, we can just do:
           // Wait, a better way is to do the update inside the functional setter:
        });
      };`;

html = html.replace(s_move, r_move);
// No wait, let me write this perfectly.
