import { lazy, Suspense, useRef, useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { money } from '../lib/utils';
import DishImage from '../components/ui/DishImage';

const ClocheScene = lazy(() => import('../components/three/ClocheScene'));
const TAU = Math.PI * 2;

/**
 * Pinned section: dishes orbit a 3D cloche on an elliptical path.
 * Scrolling drives the orbit (plus a gentle idle spin) and lifts the cloche lid.
 */
export default function OrbitalMenu({ dishes }) {
  const root = useRef(null);
  const progress = useRef(0);
  const [front, setFront] = useState(0);
  const { add } = useCart();
  const toast = useToast();
  const list = dishes.slice(0, 8);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.orbit-card');
      if (!cards.length) return;
      const n = cards.length;
      let idle = 0;
      let scrollAngle = 0;
      let lastFront = -1;
      let rx = 0;
      let ry = 0;

      const measure = () => {
        const w = window.innerWidth;
        rx = Math.min(w * (w < 768 ? 0.36 : 0.36), 560);
        ry = rx * (w < 768 ? 0.55 : 0.32);
      };
      measure();

      // Static transform parts are set once; per frame we only write compositor-friendly
      // properties (transform + opacity) through quickSetters — no filters, no layout.
      gsap.set(cards, { xPercent: -50, yPercent: -50, transformPerspective: 1400, force3D: true });
      const setters = cards.map((card) => ({
        card,
        x: gsap.quickSetter(card, 'x', 'px'),
        y: gsap.quickSetter(card, 'y', 'px'),
        scale: gsap.quickSetter(card, 'scale'),
        rotY: gsap.quickSetter(card, 'rotationY', 'deg'),
        opacity: gsap.quickSetter(card, 'opacity'),
        shade: gsap.quickSetter(card.querySelector('.orbit-shade'), 'opacity'),
        z: -1,
      }));

      let visible = true;
      const render = (_, dt = 16) => {
        if (!visible) return; // section off-screen: skip all work
        idle += (Math.min(dt, 50) / 1000) * 0.12;
        const base = idle + scrollAngle;
        let best = -Infinity;
        let bestIdx = 0;
        setters.forEach((c, i) => {
          const theta = base + (i / n) * TAU;
          const depth = (Math.sin(theta) + 1) / 2; // 1 = front (bottom of ellipse)
          if (depth > best) {
            best = depth;
            bestIdx = i;
          }
          c.x(Math.cos(theta) * rx);
          c.y(Math.sin(theta) * ry);
          c.scale(0.55 + depth * 0.55);
          c.rotY(-Math.cos(theta) * 28);
          c.opacity(0.35 + depth * 0.65);
          c.shade(0.55 - depth * 0.55);
          const z = Math.round(depth * 100);
          if (z !== c.z) {
            c.z = z;
            c.card.style.zIndex = z;
          }
        });
        if (bestIdx !== lastFront) {
          lastFront = bestIdx;
          setFront(bestIdx);
        }
      };

      render();
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
      io.observe(root.current);
      gsap.ticker.add(render);
      window.addEventListener('resize', measure);

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: '+=250%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progress.current = self.progress;
          scrollAngle = self.progress * TAU * 1.25;
        },
      });

      gsap.from('.orbit-head > *', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });

      return () => {
        io.disconnect();
        gsap.ticker.remove(render);
        window.removeEventListener('resize', measure);
      };
    },
    { scope: root, dependencies: [list.length] }
  );

  const active = list[front];

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(234,88,12,.18),transparent_55%)]" />
      {/* orbit guide rings */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[36vw] max-h-[380px] w-[74vw] max-w-[1160px] -translate-1/2 rounded-[50%] border border-white/[0.06] max-md:h-[45vw]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[26vw] max-h-[280px] w-[54vw] max-w-[860px] -translate-1/2 rounded-[50%] border border-dashed border-ember-400/10" />

      <div className="orbit-head container-x relative z-[120] flex flex-col items-start justify-between gap-4 pt-28 md:flex-row md:items-end">
        <div>
          <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Orbit of flavours</span>
          <h2 className="mt-4 font-display text-4xl leading-none font-light sm:text-6xl">
            Signature <span className="text-gradient italic">plates</span>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-cream/50">Scroll to spin the table. The front dish is yours to add — the cloche lifts as you go.</p>
      </div>

      {/* centre 3D cloche */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-50 size-[min(100vw,760px)] -translate-1/2">
        <Suspense fallback={null}>
          <ClocheScene progress={progress} />
        </Suspense>
      </div>

      {/* orbiting cards */}
      <div className="absolute top-[54%] left-1/2">
        {list.map((dish, i) => (
          <article
            key={dish._id}
            className="orbit-card absolute top-0 left-0 w-[150px] overflow-hidden rounded-3xl border border-white/10 bg-ink-800 shadow-xl shadow-black/50 will-change-transform sm:w-[220px]"
            data-cursor="hover"
            data-cursor-label="Add"
            onClick={() => {
              add(dish);
              toast(`${dish.name} added to your order`);
            }}
          >
            <DishImage src={dish.image} alt={dish.name} accent={dish.accent} className="aspect-[4/3] w-full" sizes="220px" />
            <span className="orbit-shade pointer-events-none absolute inset-0 z-10 bg-black" />
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-display text-sm sm:text-lg">{dish.name}</h3>
                {i === front && <span className="size-2 shrink-0 rounded-full bg-ember-400 shadow-[0_0_12px_#f59e0b]" />}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-cream/50 sm:text-sm">
                <span className="text-ember-400">{money(dish.price)}</span>
                <span className="flex items-center gap-1"><Star className="size-3 fill-ember-400 text-ember-400" /> {dish.rating}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* active dish details */}
      {active && (
        <div className="absolute inset-x-0 bottom-8 z-[120] flex justify-center px-4">
          <div key={active._id} className="glass flex max-w-xl animate-[fadeUp_.6s_ease] items-center gap-4 rounded-full bg-ink-900/95 py-2 pr-2 pl-6">
            <p className="line-clamp-1 text-sm text-cream/70">
              <span className="font-semibold text-cream">{active.name}</span> — {active.description}
            </p>
            <button
              onClick={() => {
                add(active);
                toast(`${active.name} added to your order`);
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ember-500 text-ink-950 transition hover:scale-110"
              aria-label={`Add ${active.name}`}
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
