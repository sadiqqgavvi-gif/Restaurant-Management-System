import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { setAppReady } from '../../lib/ready';
import { getLenis } from '../../hooks/useLenis';

/** Count-up preloader with a curved curtain that lifts to reveal the site. */
export default function Preloader() {
  const root = useRef(null);
  const count = useRef(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      getLenis()?.stop();
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          getLenis()?.start();
          setDone(true);
        },
      });
      tl.from('.pl-letter', { yPercent: 120, stagger: 0.06, duration: 0.9, ease: 'expo.out' })
        .to(counter, {
          v: 100,
          duration: 1.4,
          ease: 'power2.inOut',
          onUpdate: () => (count.current.textContent = String(Math.round(counter.v)).padStart(3, '0')),
        }, 0)
        .to('.pl-bar', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0)
        .to('.pl-letter', { yPercent: -120, stagger: 0.04, duration: 0.6, ease: 'expo.in' })
        .to('.pl-meta', { opacity: 0, duration: 0.3 }, '<')
        .add(() => setAppReady(), '-=0.1')
        .to(root.current, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
        .to('.pl-curve', { attr: { d: 'M0 0 L100 0 L100 0 Q50 0 0 0 Z' }, duration: 1.1, ease: 'expo.in' }, '<');
    },
    { scope: root }
  );

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-ink-950">
      <svg className="absolute top-full left-0 h-[18vh] w-full fill-ink-950" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="pl-curve" d="M0 0 L100 0 L100 0 Q50 100 0 0 Z" />
      </svg>
      <div className="flex overflow-hidden font-display text-7xl font-light tracking-tight sm:text-9xl">
        {'EMBER'.split('').map((l, i) => (
          <span key={i} className="pl-letter inline-block">{l}</span>
        ))}
      </div>
      <div className="pl-meta mt-8 flex w-56 flex-col items-center gap-3">
        <div className="h-px w-full overflow-hidden bg-white/10">
          <div className="pl-bar h-full w-full origin-left scale-x-0 bg-gradient-to-r from-ember-400 to-ember-600" />
        </div>
        <div className="flex w-full justify-between text-[10px] tracking-[0.35em] text-cream/50 uppercase">
          <span>Igniting</span>
          <span ref={count}>000</span>
        </div>
      </div>
    </div>
  );
}
