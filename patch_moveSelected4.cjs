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
          if (prevIds.size === 0) return prevIds;
          const ids = new Set(prevIds);
          
          let movingRows = [];
          
          setMasterRows(prev => {
             movingRows.push(...prev.filter(r => ids.has(r.id)));
             return prev.filter(r => !ids.has(r.id));
          });
          setCakadoRows(prev => {
             movingRows.push(...prev.filter(r => ids.has(r.id)));
             return prev.filter(r => !ids.has(r.id));
          });
          setBalkisRows(prev => {
             movingRows.push(...prev.filter(r => ids.has(r.id)));
             const kept = prev.filter(r => !ids.has(r.id));
             
             setTimeout(() => {
               if (targetZone === 'master') setMasterRows(p => [...movingRows, ...p]);
               if (targetZone === 'cakado') setCakadoRows(p => [...movingRows, ...p]);
               if (targetZone === 'balkis') setBalkisRows(p => [...movingRows, ...p]);
             }, 0);
             
             return kept;
          });
          
          return new Set();
        });
      };`;

html = html.replace(s_move, r_move);
fs.writeFileSync('index.html', html);
console.log("moveSelected modified");
