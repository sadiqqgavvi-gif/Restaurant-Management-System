import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { isTouch } from '../../lib/utils';

/** Dot + lagging ring cursor that grows over interactive elements and shows contextual labels. */
export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState('');
  const [enabled] = useState(() => !isTouch());

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-custom-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.1, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.1, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' });

    const move = (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    };
    const over = (e) => {
      const target = e.target.closest('[data-cursor], a, button, input, select, textarea');
      if (!target) {
        gsap.to(ring.current, { scale: 1, backgroundColor: 'rgba(245,158,11,0)', duration: 0.3 });
        setLabel('');
        return;
      }
      const text = target.getAttribute('data-cursor-label') || '';
      setLabel(text);
      gsap.to(ring.current, {
        scale: text ? 2.6 : 1.8,
        backgroundColor: text ? 'rgba(245,158,11,0.95)' : 'rgba(245,158,11,0.12)',
        duration: 0.35,
      });
    };
    const down = () => gsap.to(ring.current, { scale: '-=0.3', duration: 0.15 });
    const up = () => gsap.to(ring.current, { scale: '+=0.3', duration: 0.15 });

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-ember-400/70 mix-blend-difference max-md:hidden"
      >
        <span className="text-[5px] font-bold tracking-widest text-ink-950 uppercase">{label}</span>
      </div>
      <div ref={dot} className="pointer-events-none fixed top-0 left-0 z-[100] -mt-1 -ml-1 size-2 rounded-full bg-ember-400 max-md:hidden" />
    </>
  );
}
