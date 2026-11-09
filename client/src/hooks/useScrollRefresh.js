import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap';

/**
 * Keeps ScrollTrigger positions correct when the page height changes after load
 * (web fonts swapping in, images, data arriving). Without this, animations further
 * down the page fire at stale positions — or never fire at all.
 */
export function useScrollRefresh() {
  useEffect(() => {
    let timer;
    let lastHeight = document.documentElement.scrollHeight;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ScrollTrigger.sort(); // React creates triggers child-first; refresh them in page order
        ScrollTrigger.refresh();
      }, 200);
    };

    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    // Pin spacers change the height too, so only react to changes in the content itself.
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        refresh();
      }
    });
    ro.observe(document.getElementById('root'));

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('load', refresh);
    };
  }, []);
}
