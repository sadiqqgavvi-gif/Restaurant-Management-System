import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../../lib/gsap';
import { cn, isTouch } from '../../lib/utils';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-ember-400 via-ember-500 to-ember-600 text-ink-950 shadow-[0_10px_40px_-10px_rgba(245,158,11,.7)]',
  ghost: 'border border-white/15 bg-white/[0.03] text-cream backdrop-blur-md hover:border-ember-400/60',
  dark: 'bg-ink-950 text-cream border border-white/10',
};

/** Button that is magnetically pulled toward the cursor, with a liquid fill on hover. */
export default function MagneticButton({ to, href, onClick, children, variant = 'primary', className, strength = 0.35, type, disabled, ...rest }) {
  const ref = useRef(null);
  const inner = useRef(null);

  useGSAP(
    () => {
      if (isTouch()) return;
      const el = ref.current;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const ixTo = gsap.quickTo(inner.current, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const iyTo = gsap.quickTo(inner.current, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
        ixTo(dx * strength * 0.4);
        iyTo(dy * strength * 0.4);
      };
      const leave = () => {
        xTo(0); yTo(0); ixTo(0); iyTo(0);
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      return () => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      };
    },
    { scope: ref }
  );

  const classes = cn(
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    className
  );
  const content = (
    <>
      <span className="absolute inset-0 -z-0 translate-y-full rounded-full bg-cream transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:translate-y-0" />
      <span ref={inner} className="relative z-10 inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-ink-950">
        {children}
      </span>
    </>
  );

  if (to) return <Link ref={ref} to={to} className={classes} data-cursor="hover" {...rest}>{content}</Link>;
  if (href) return <a ref={ref} href={href} className={classes} data-cursor="hover" {...rest}>{content}</a>;
  return (
    <button ref={ref} type={type || 'button'} onClick={onClick} disabled={disabled} className={classes} data-cursor="hover" {...rest}>
      {content}
    </button>
  );
}
