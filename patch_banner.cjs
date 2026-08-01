const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_banner = `            {duplicateNids.length > 0 && (
              <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">`;
              
const r_banner = `            {unrecognizedStatuses.length > 0 && (
              <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">حالات غير معروفة لم تُحتسب ضمن الإيرادات — راجع التصنيف:</p>
                  <p className="text-xs opacity-80 font-mono" dir="ltr">{unrecognizedStatuses.slice(0, 6).join(', ')}{unrecognizedStatuses.length > 6 ? ' و...' : ''}</p>
                </div>
                <button onClick={() => setUnrecognizedStatuses([])} className="absolute left-1 top-1 opacity-60 hover:opacity-100 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}
            
            {duplicateNids.length > 0 && (
              <div className="bg-warn/10 text-warn border border-warn/20 rounded-lg p-4 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-2">`;
              
html = html.replace(s_banner, r_banner);
fs.writeFileSync('index.html', html);
console.log("Banner added");
