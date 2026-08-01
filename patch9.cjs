const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const bannerStart = `            {autoFeesInfo && (
              <div className="bg-pos/10 text-pos border border-pos/20 rounded-lg p-4 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm font-medium">تم ضبط الرسوم تلقائياً من Logista.</p>
              </div>
            )}`;

const bannerNew = `            {autoFeesInfo && (
              <div className="bg-pos/10 text-pos border border-pos/20 rounded-lg p-4 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm font-medium">تم ضبط الرسوم تلقائياً من Logista.</p>
              </div>
            )}
            
            {duplicateNids.length > 0 && (
              <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">تم العثور على {duplicateNids.length} معرفات (NID) مكررة في الملف وتم تجاهل التكرار:</p>
                  <p className="text-xs opacity-80 font-mono" dir="ltr">{duplicateNids.slice(0, 6).join(', ')}{duplicateNids.length > 6 ? ' و...' : ''}</p>
                </div>
                <button onClick={() => setDuplicateNids([])} className="absolute left-3 top-3 opacity-60 hover:opacity-100 p-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
            
            {(cakadoStats.newUnknownGovs.length > 0 || balkisStats.newUnknownGovs.length > 0) && (
               (() => {
                 const unk = [...new Set([...cakadoStats.newUnknownGovs, ...balkisStats.newUnknownGovs])];
                 if (unk.length > 0) {
                   return (
                     <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div className="flex-1">
                           <p className="text-sm font-medium mb-1">ولايات غير معروفة في خريطة الرسوم (تم احتساب 2 د.ت):</p>
                           <p className="text-xs opacity-80" dir="ltr">{unk.slice(0, 6).join(', ')}{unk.length > 6 ? ' و...' : ''}</p>
                           <p className="text-xs opacity-80 mt-1">أضفها لتفادي الخطأ.</p>
                        </div>
                     </div>
                   );
                 }
                 return null;
               })()
            )}
            `;

const s = html.indexOf(bannerStart);
if (s > -1) {
  html = html.substring(0, s) + bannerNew + html.substring(s + bannerStart.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 9 successful");
} else {
  console.log("Could not find banner insertion point");
  process.exit(1);
}
