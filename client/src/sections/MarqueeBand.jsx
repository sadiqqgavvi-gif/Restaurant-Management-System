import { useRef } from 'react';
import { Sparkle } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';

const WORDS = ['Wood-fired', 'Seasonal', 'Dry-aged', 'Handmade pasta', 'Natural wines', 'Chef’s table', 'Open kitchen'];

/** Two tilted ribbons sliding in opposite directions, speed tied to scroll. */
export default function MarqueeBand() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo('.ribbon-a', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
      gsap.fromTo('.ribbon-b', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    },
    { scope: root }
  );

  const row = (outline) =>
    [...WORDS, ...WORDS].map((w, i) => (
      <span key={i} className="flex shrink-0 items-center gap-8 px-4">
        <span
          className={
            outline
              ? 'font-display text-5xl text-transparent italic [-webkit-text-stroke:1px_rgba(245,237,225,.35)] sm:text-7xl'
              : 'font-display text-5xl sm:text-7xl'
          }
        >
          {w}
        </span>
        <Sparkle className="size-7 shrink-0 fill-current text-ember-400" />
      </span>
    ));

  return (
    <section ref={root} className="relative overflow-hidden py-20">
      <div className="-rotate-2 border-y border-white/10 bg-ember-500 py-5 text-ink-950">
        <div className="ribbon-a flex w-max">{row(false)}</div>
      </div>
      <div className="mt-4 rotate-1 py-4">
        <div className="ribbon-b flex w-max">{row(true)}</div>
      </div>
    </section>
  );
}
