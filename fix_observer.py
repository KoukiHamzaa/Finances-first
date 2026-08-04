import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_observer = """        useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting && visibleCount < rows.length) {
                setVisibleCount((prev) => prev + 20);
              }
            },
            { rootMargin: '200px' }
          );
          if (sentinelRef.current) observer.observe(sentinelRef.current);
          return () => observer.disconnect();
        }, [visibleCount, rows.length]);"""

new_observer = """        const countRef = useRef({ visible: visibleCount, total: rows.length });
        useEffect(() => { countRef.current = { visible: visibleCount, total: rows.length }; }, [visibleCount, rows.length]);
        
        useEffect(() => {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting && countRef.current.visible < countRef.current.total) {
                setVisibleCount((prev) => prev + 20);
              }
            },
            { rootMargin: '200px' }
          );
          if (sentinelRef.current) observer.observe(sentinelRef.current);
          return () => observer.disconnect();
        }, []);"""

html = html.replace(old_observer, new_observer)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
