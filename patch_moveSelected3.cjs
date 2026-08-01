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
          if (prevIds.size === 0) return prevIds;
          const ids = new Set(prevIds);
          
          setMasterRows(prevM => {
            setCakadoRows(prevC => {
              setBalkisRows(prevB => {
                const allRows = [...prevM, ...prevC, ...prevB];
                const movingRows = allRows.filter(r => ids.has(r.id));
                
                if (targetZone === 'master') {
                  // Wait, I can't setMasterRows inside setBalkisRows inside setCakadoRows inside setMasterRows.
                }
                return prevB;
              });
              return prevC;
            });
            return prevM;
          });
          return new Set();
        });
      };`;
// this is not valid yet
