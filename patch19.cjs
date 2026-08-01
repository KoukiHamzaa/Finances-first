const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('recon-theme', theme);
      }, [theme]);`;

const newStr = `useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('recon-theme', theme);
      }, [theme]);
      
      useEffect(() => {
        const handleBeforeUnload = (e) => {
          if (masterRows.length > 0 || cakadoRows.length > 0 || balkisRows.length > 0) {
            e.preventDefault();
            e.returnValue = '';
          }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
      }, [masterRows.length, cakadoRows.length, balkisRows.length]);`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, newStr);
  fs.writeFileSync('index.html', html);
  console.log("Patch 19 successful");
} else {
  console.log("Could not find beforeunload insertion point");
}
