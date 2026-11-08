import { useEffect, useState } from 'react';

/** Lightweight IntersectionObserver hook — used to pause WebGL canvases that are off-screen. */
export function useInView(ref, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
