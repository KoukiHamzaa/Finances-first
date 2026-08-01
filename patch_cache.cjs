const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldCache = `      const getCachedName = (nid) => {
        try {
           const val = localStorage.getItem(CACHE_KEY_PREFIX + nid);
           if (val) {
              const obj = JSON.parse(val);
              if (obj && Date.now() - obj.fetchedAt < 7 * 24 * 60 * 60 * 1000) return obj;
           }
        } catch (e) {}
        return null;
      };
      
      const setCachedName = (nid, data) => {
         try {
            localStorage.setItem(CACHE_KEY_PREFIX + nid, JSON.stringify({ ...data, fetchedAt: Date.now() }));
         } catch(e) {}
      };`;

const newCache = `      const getCachedName = (nid) => {
        try {
           const val = localStorage.getItem(CACHE_KEY_PREFIX + nid);
           if (val) {
              const obj = JSON.parse(val);
              if (obj && Date.now() - obj.fetchedAt < 7 * 24 * 60 * 60 * 1000) {
                 if (isValidName(obj.description)) return obj;
                 else localStorage.removeItem(CACHE_KEY_PREFIX + nid);
              }
           }
        } catch (e) {}
        return null;
      };
      
      const setCachedName = (nid, data) => {
         if (!isValidName(data.description)) return;
         try {
            localStorage.setItem(CACHE_KEY_PREFIX + nid, JSON.stringify({ ...data, fetchedAt: Date.now() }));
         } catch(e) {}
      };`;

if (html.includes(oldCache)) {
  html = html.replace(oldCache, newCache);
  fs.writeFileSync('index.html', html);
  console.log("Patch cache successful");
} else {
  console.log("Could not find old cache block");
}
