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
      gsap.set(words, { yPercent: 115, rotate: 6, opacity: 0 });
      if (!scroll && !ready) return;
      gsap.to(words, {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: scroll ? { trigger: ref.current, start } : undefined,
      });
    },
    { scope: ref, dependencies: [ready, text] }
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
              <span key={wi} className="split-word overflow-hidden pb-[0.08em] align-bottom">
                <span data-word className={cn('inline-block origin-bottom-left', accent && 'text-gradient italic')}>
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
