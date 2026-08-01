const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_appTop = `      const currentUploadId = useRef(0);`;
const r_appTop = `      const currentUploadId = useRef(0);
      const [scrollPos, setScrollPos] = useState({ top: true, bottom: false });
      
      useEffect(() => {
         const handleScroll = () => {
            const isTop = window.scrollY < 100;
            const isBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100;
            setScrollPos({ top: isTop, bottom: isBottom });
         };
         window.addEventListener('scroll', handleScroll, { passive: true });
         handleScroll();
         // observe DOM changes to update bottom detection
         const observer = new MutationObserver(handleScroll);
         observer.observe(document.body, { childList: true, subtree: true });
         return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
         };
      }, []);
      
      const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });`;

html = html.replace(s_appTop, r_appTop);

const s_endMain = `          </main>
        </div>
      );`;
const r_endMain = `            {/* Scroll Nav FABs */}
            <div className={\`fixed right-4 sm:right-8 flex flex-col gap-2 z-40 transition-all duration-300 \${selectedIds.size > 0 ? 'bottom-[100px]' : 'bottom-6'}\`}>
               <button onClick={scrollToTop} className={\`p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 \${scrollPos.top ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}\`} aria-label="أعلى الصفحة">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
               </button>
               <button onClick={scrollToBottom} className={\`p-3 bg-surface border border-line text-ink rounded-full shadow-lg hover:shadow-xl transition-all duration-300 \${scrollPos.bottom ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}\`} aria-label="أسفل الصفحة">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
               </button>
            </div>
          </main>
        </div>
      );`;

html = html.replace(s_endMain, r_endMain);
fs.writeFileSync('index.html', html);
console.log("FABs patched");
