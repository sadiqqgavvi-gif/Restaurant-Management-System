import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { cn } from '../../lib/utils';
import { useAppReady } from '../../lib/ready';

/**
 * Word-by-word masked text reveal (GSAP).
 * - Use "\n" for explicit line breaks.
 * - Wrap a word in *asterisks* to give it the animated gradient.
 */
export default function SplitReveal({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  stagger = 0.05,
  scroll = true,
  start = 'top 85%',
}) {
  const ref = useRef(null);
  const ready = useAppReady();

  useGSAP(
    () => {
      const words = ref.current.querySelectorAll('[data-word]');
      // Always pin BOTH y and yPercent: a stale pixel `y` left in GSAP's cache (e.g. after a
      // StrictMode re-mount) would otherwise leave the words parked below their line mask —
      // the heading then looks missing even though the animation "finished".
      const hidden = { y: 0, yPercent: 140, rotate: 6, opacity: 0 }; // 140%: clears the line mask's descender padding
      gsap.set(words, hidden);
      if (!scroll && !ready) return;
      gsap.fromTo(words, hidden, {
        y: 0,
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        clearProps: 'transform',
        duration: 1.2,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: scroll ? { trigger: ref.current, start, once: true } : undefined,
      });
    },
    // Scroll-driven reveals don't depend on the preloader; re-running them on `ready`
    // used to stack a second tween + trigger on the same words.
    { scope: ref, dependencies: [scroll ? 0 : ready, text], revertOnUpdate: true }
  );

  const lines = text.split('\n');
  return (
    <Tag ref={ref} className={cn(className)} aria-label={text.replace(/\*/g, '')}>
      {lines.map((line, li) => (
        <span key={li} className="split-line" aria-hidden="true">
          {line.split(' ').map((raw, wi, arr) => {
            const m = raw.match(/^\*(.+)\*([^\w]*)$/); // *word* with optional trailing punctuation
            const accent = Boolean(m);
            const word = m ? m[1] : raw;
            const trail = m ? m[2] : '';
            return (
              <span key={wi} className="split-word align-bottom">
                <span data-word className={cn('inline-block origin-bottom-left', accent && 'text-gradient -mb-[0.2em] pr-[0.1em] pb-[0.2em] italic')}>
                  {word}
                </span>
                <span data-word className="inline-block">
                  {trail}
                  {wi < arr.length - 1 ? '\u00A0' : ''}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
