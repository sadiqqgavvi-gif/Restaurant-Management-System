import { useMemo, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { CalendarDays, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import { isTouch, money } from '../lib/utils';
import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';
import DishImage from '../components/ui/DishImage';
import menu from '../data/menu.json';

// Four dishes floating around the panel: position, tilt and parallax depth.
const FLOATERS = [
  { name: 'Wagyu Ribeye', cls: 'left-[3%] top-[9%] w-[170px] xl:w-[190px]', rotate: -9, depth: 1 },
  { name: 'Molten Chocolate Dome', cls: 'left-[7%] bottom-[8%] w-[140px] xl:w-[160px]', rotate: 7, depth: 0.6 },
  { name: 'Saffron Spritz', cls: 'right-[4%] top-[12%] w-[150px] xl:w-[170px]', rotate: 8, depth: 0.7 },
  { name: 'Miso Glazed Salmon', cls: 'right-[6%] bottom-[9%] w-[175px] xl:w-[195px]', rotate: -6, depth: 1.1 },
];

const AVATARS = ['#f59e0b', '#ea580c', '#f43f5e', '#84cc16'];

/** Open/closed badge based on the real clock (Tue–Sun, 5pm–11pm). */
function useOpenStatus() {
  return useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon
    const h = now.getHours() + now.getMinutes() / 60;
    if (day === 1) return { open: false, text: 'Closed Mondays · opens Tuesday 5pm' };
    if (h >= 17 && h < 23) return { open: true, text: 'Open now · kitchen until 11pm' };
    if (h < 17) return { open: false, text: 'Opens today at 5pm' };
    return { open: false, text: day === 0 ? 'Closed · opens Tuesday 5pm' : 'Closed · opens tomorrow 5pm' };
  }, []);
}

export default function ReserveCTA() {
  const root = useRef(null);
  const mx = useMotionValue(600);
  const my = useMotionValue(300);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(245,158,11,.16), transparent 55%)`;
  const status = useOpenStatus();
  const dishes = FLOATERS.map((f) => ({ ...f, dish: menu.find((m) => m.name === f.name) }));

  useGSAP(
    () => {
      gsap.fromTo('.cta-panel', { scale: 0.9, yPercent: 6 }, {
        scale: 1,
        yPercent: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: true },
      });

      // Floating dishes: drift at different speeds while scrolling…
      gsap.utils.toArray('.cta-float').forEach((el) => {
        const d = Number(el.dataset.depth);
        gsap.fromTo(el, { y: 90 * d }, {
          y: -90 * d,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from(el.firstElementChild, {
          scale: 0.6,
          opacity: 0,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        });
      });

      gsap.from('.cta-fade', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: { trigger: '.cta-panel', start: 'top 65%' },
      });

      // …and lean toward the cursor (desktop only).
      if (isTouch()) return;
      const inners = gsap.utils.toArray('.cta-float-inner').map((el) => ({
        d: Number(el.dataset.depth),
        x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' }),
      }));
      const panel = root.current.querySelector('.cta-panel');
      const move = (e) => {
        const r = panel.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
        inners.forEach((f) => {
          f.x(nx * 40 * f.d);
          f.y(ny * 30 * f.d);
        });
      };
      panel.addEventListener('mousemove', move);
      return () => panel.removeEventListener('mousemove', move);
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="cta-panel relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink-900 px-5 py-24 will-change-transform sm:px-12 sm:py-32">
          {/* dotted grid */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(245,237,225,.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
          {/* warm core glow */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[900px] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,88,12,.22),transparent_60%)]" />
          {/* rotating golden ring + static guide rings */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[min(150vw,820px)] -translate-1/2">
            <div className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,.9)_40deg,transparent_100deg,transparent_180deg,rgba(234,88,12,.7)_220deg,transparent_280deg)] [mask-image:radial-gradient(circle,transparent_63%,#000_63.5%,#000_64.2%,transparent_64.7%)]" />
            <div className="absolute inset-[18%] rounded-full border border-white/[0.06]" />
            <div className="absolute inset-[30%] rounded-full border border-dashed border-ember-400/15" />
          </div>
          {/* cursor spotlight */}
          <motion.div className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

          {/* floating dishes */}
          {dishes.map(({ dish, cls, rotate, depth }, i) => (
            <div key={dish.name} data-depth={depth} className={`cta-float absolute ${cls} ${i % 2 ? 'hidden lg:block' : 'hidden md:block'}`}>
              <div style={{ rotate: `${rotate}deg` }}>
                <div data-depth={depth} className="cta-float-inner overflow-hidden rounded-3xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl shadow-black/60">
                  <DishImage src={dish.image} alt={dish.name} accent={dish.accent} className="aspect-[4/5] rounded-[1.1rem]" />
                  <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-1 text-xs">
                    <span className="truncate font-medium text-cream/80">{dish.name}</span>
                    <span className="shrink-0 text-ember-400">{money(dish.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="relative mx-auto max-w-2xl text-center">
            <span className="cta-fade inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/60 px-4 py-2 text-xs text-cream/80">
              <span className="relative flex size-2">
                {status.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex size-2 rounded-full ${status.open ? 'bg-emerald-400' : 'bg-ember-400'}`} />
              </span>
              {status.text}
            </span>

            <SplitReveal
              text={'Your table is\n*warming* up.'}
              className="mt-8 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] font-light tracking-tight"
            />
            <p className="cta-fade mx-auto mt-6 max-w-md text-cream/60">
              Book in under a minute, or order the Ember kitchen to your door. Every table comes with a little fire.
            </p>

            <div className="cta-fade mt-8 flex flex-wrap justify-center gap-2 text-sm text-cream/70">
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><CalendarDays className="size-4 text-ember-400" /> Tue – Sun</span>
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><Clock className="size-4 text-ember-400" /> 5pm – 11pm</span>
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><Users className="size-4 text-ember-400" /> 1 – 20 guests</span>
            </div>

            <div className="cta-fade mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton to="/reservations" className="px-9 py-4 text-base">
                Reserve now <ArrowRight className="size-4" />
              </MagneticButton>
              <MagneticButton to="/menu" variant="ghost" className="px-9 py-4 text-base">Order online</MagneticButton>
            </div>

            <div className="cta-fade mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
              <div className="flex -space-x-2">
                {AVATARS.map((c, i) => (
                  <span key={c} className="grid size-9 place-items-center rounded-full border-2 border-ink-900 text-xs font-semibold text-ink-950" style={{ background: c }}>
                    {'SMHD'[i]}
                  </span>
                ))}
              </div>
              <div className="text-left text-sm">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-ember-400 text-ember-400" />)}
                  <span className="ml-1 font-semibold">4.9</span>
                </div>
                <p className="text-cream/50">from 2,400+ guest reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
