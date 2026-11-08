import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import DishImage from '../components/ui/DishImage';

const STEPS = [
  { n: '01', title: 'The Harvest', text: 'At dawn we walk the markets and call our 48 partner farms. The menu is written by what the land gives that day.', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', accent: '#84cc16' },
  { n: '02', title: 'The Fire', text: 'Oak and cherry wood burn down to glowing embers for six hours before the first steak ever touches the grill.', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80', accent: '#ea580c' },
  { n: '03', title: 'The Craft', text: 'Pasta rolled by hand, sauces reduced for days, desserts tempered to the degree. Precision you can taste.', img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1200&q=80', accent: '#f59e0b' },
  { n: '04', title: 'The Table', text: 'Plated at the pass and carried straight to you — warm, fragrant and exactly as the chef intended.', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80', accent: '#f43f5e' },
  { n: '05', title: 'The Memory', text: 'A smoked old fashioned, a slow dessert, a long conversation. The part of dinner that stays with you.', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80', accent: '#d97706' },
];

/** Vertical scroll → horizontal travel. Panels skew with scroll velocity and images parallax inside. */
export default function HorizontalJourney() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const distance = () => track.current.scrollWidth - window.innerWidth;
      const skewTo = gsap.quickTo('.journey-panel', 'skewX', { duration: 0.5, ease: 'power3' });

      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            skewTo(gsap.utils.clamp(-8, 8, self.getVelocity() / -400));
            gsap.set('.journey-progress', { scaleX: self.progress });
          },
          onScrubComplete: () => skewTo(0),
        },
      });

      gsap.utils.toArray('.journey-panel').forEach((panel) => {
        gsap.fromTo(panel.querySelector('.journey-img'), { xPercent: -12 }, {
          xPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
        gsap.from(panel.querySelectorAll('.journey-reveal'), {
          y: 80,
          opacity: 0,
          rotate: 3,
          stagger: 0.08,
          duration: 1,
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 70%' },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden bg-ink-900">
      <div className="absolute top-24 left-0 z-10 w-full sm:top-28">
        <div className="container-x flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> From farm to flame</span>
            <h2 className="mt-3 font-display text-3xl font-light sm:text-5xl">The Ember <span className="text-gradient italic">journey</span></h2>
          </div>
          <div className="hidden w-48 sm:block">
            <div className="h-px bg-white/10">
              <div className="journey-progress h-full origin-left scale-x-0 bg-ember-400" />
            </div>
          </div>
        </div>
      </div>

      <div ref={track} className="flex h-full w-max items-center gap-8 pt-28 pr-[10vw] pl-[6vw] sm:gap-12">
        {STEPS.map((s) => (
          <article key={s.n} className="journey-panel relative grid h-[62vh] w-[86vw] shrink-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-ink-800 will-change-transform md:w-[68vw] md:grid-cols-[1.2fr_1fr] lg:w-[58vw]">
            <div className="relative overflow-hidden max-md:h-[34vh]">
              <DishImage src={s.img} alt={s.title} accent={s.accent} className="journey-img absolute -inset-x-[15%] inset-y-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ink-800" />
            </div>
            <div className="relative flex flex-col justify-end gap-4 p-6 sm:p-10">
              <span className="journey-reveal font-display text-7xl text-transparent [-webkit-text-stroke:1px_rgba(251,191,36,.6)] sm:text-8xl">{s.n}</span>
              <h3 className="journey-reveal font-display text-3xl sm:text-5xl">{s.title}</h3>
              <p className="journey-reveal max-w-sm text-cream/60">{s.text}</p>
              <span className="journey-reveal inline-flex items-center gap-2 text-sm text-ember-400">Keep scrolling <ArrowRight className="size-4" /></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
