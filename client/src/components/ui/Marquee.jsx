import { cn } from '../../lib/utils';

/** Infinite CSS marquee. Duplicates children for a seamless loop. */
export default function Marquee({ children, reverse, duration = 30, gap = '2rem', className, pauseOnHover }) {
  return (
    <div
      className={cn('group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]', className)}
      style={{ '--duration': `${duration}s`, '--gap': gap, gap }}
    >
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1}
          className={cn('flex shrink-0 items-center animate-marquee', pauseOnHover && 'group-hover:[animation-play-state:paused]')}
          style={{ gap, animationDirection: reverse ? 'reverse' : 'normal' }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
