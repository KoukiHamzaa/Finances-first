const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(`const [unknownGovs, setUnknownGovs] = useState([]);`, `const [unknownGovs, setUnknownGovs] = useState([]);\n      const [dismissedUnknownGovs, setDismissedUnknownGovs] = useState(false);`);

html = html.replace(`setUnknownGovs([]);
        setDuplicateNids([]);`, `setUnknownGovs([]);
        setDuplicateNids([]);
        setDismissedUnknownGovs(false);`);

html = html.replace(`{(cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (`, `{!dismissedUnknownGovs && (cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (`);

html = html.replace(`أضفها لتفادي الخطأ.</p>
                        </div>
                     </div>`, `أضفها لتفادي الخطأ.</p>
                        </div>
                        <button onClick={() => setDismissedUnknownGovs(true)} className="absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                     </div>`);

fs.writeFileSync('index.html', html);
console.log("Patch 17 successful");
