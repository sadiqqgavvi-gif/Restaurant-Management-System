import { useRef } from 'react';
import { ChefHat, Wine, Users, Flame, ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import SplitReveal from '../components/ui/SplitReveal';
import DishImage from '../components/ui/DishImage';
import MagneticButton from '../components/ui/MagneticButton';

const EXPERIENCES = [
  { icon: ChefHat, title: 'Chef’s Table', price: 'From $145 pp', text: 'Ten courses at the pass, cooked and explained by our head chef. Eight seats, two seatings a night.', tags: ['10 courses', '8 seats', 'Tue–Sat'], img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80', tint: 'rgba(245,158,11,.28)' },
  { icon: Wine, title: 'Cellar Pairing', price: 'From $85 pp', text: 'Our sommelier pairs each course with natural and old-world wines from a 600-label cellar.', tags: ['600 labels', 'Sommelier-led', 'Any menu'], img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=80', tint: 'rgba(244,63,94,.26)' },
  { icon: Users, title: 'Private Dining', price: 'Up to 24 guests', text: 'A candle-lit room with its own fireplace and a menu designed with you for birthdays, launches and weddings.', tags: ['Fireplace room', 'Custom menu', 'AV ready'], img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', tint: 'rgba(252,211,77,.24)' },
  { icon: Flame, title: 'Fire Masterclass', price: 'Saturdays · $120', text: 'Learn to build, read and cook over live fire with our grill team. Lunch and a glass of wine included.', tags: ['3 hours', 'Hands-on', 'Lunch included'], img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80', tint: 'rgba(234,88,12,.3)' },
];

/**
 * Pinned card deck: the section stays in place while each scroll step slides the next
 * card up over the previous one, which recedes (scales back, lifts, darkens).
 * One card per viewport of scroll keeps the pace calm and readable.
 */
export default function StackedExperiences() {
  const root = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.deck-card');
      const n = cards.length;
      const counter = root.current.querySelector('.deck-count');
      const bar = root.current.querySelector('.deck-bar');
      gsap.set(cards.slice(1), { yPercent: 115, rotate: 4 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 1 },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${(n - 1) * window.innerHeight}`,
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(n - 1, Math.round(self.progress * (n - 1)));
            counter.textContent = String(idx + 1).padStart(2, '0');
            bar.style.transform = `scaleX(${(idx + 1) / n})`;
          },
        },
      });

      for (let i = 1; i < n; i++) {
        const at = i - 1;
        tl.to(cards[i], { yPercent: 0, rotate: 0 }, at);
        // every card already on the deck steps one level further back
        for (let j = 0; j < i; j++) {
          const depth = i - j;
          tl.to(cards[j], { scale: 1 - depth * 0.05, yPercent: -depth * 2.5 }, at);
          tl.to(cards[j].querySelector('.deck-shade'), { opacity: Math.min(0.25 * depth, 0.7) }, at);
        }
      }
      // short hold at the end so the last card can be read before the pin releases
      tl.to({}, { duration: 0.35 });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(234,88,12,.12),transparent_55%)]" />
      <div className="container-x relative flex h-full flex-col pt-24 pb-6 sm:pt-28 sm:pb-10">
        <div className="relative z-20 flex items-end justify-between gap-6">
          <div>
            <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Beyond dinner</span>
            <SplitReveal text={'Experiences worth *booking*'} className="mt-3 font-display text-3xl leading-none font-light sm:text-5xl" />
          </div>
          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <span className="font-display text-4xl text-ember-400 tabular-nums"><span className="deck-count">01</span></span>
            <div>
              <span className="text-xs tracking-widest text-cream/40 uppercase">of {String(EXPERIENCES.length).padStart(2, '0')}</span>
              <div className="mt-2 h-px w-28 bg-white/10">
                <div className="deck-bar h-full origin-left bg-ember-400 transition-transform duration-500" style={{ transform: `scaleX(${1 / EXPERIENCES.length})` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex-1 sm:mt-12">
          {EXPERIENCES.map((exp, i) => {
            const Icon = exp.icon;
            return (
              <article
                key={exp.title}
                className="deck-card absolute inset-0 origin-top overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800 shadow-[0_-20px_60px_-20px_rgba(0,0,0,.8)] will-change-transform sm:rounded-[2.5rem]"
                style={{ zIndex: i + 1 }}
              >
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 15% 20%, ${exp.tint}, transparent 55%)` }} />
                <div className="relative flex h-full flex-col-reverse md:grid md:grid-cols-[1.1fr_1fr]">
                  <div className="flex flex-1 flex-col justify-between gap-4 p-6 sm:p-10 lg:p-12">
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-ink-950/60 text-ember-400 sm:size-14"><Icon className="size-6 sm:size-7" /></span>
                      <span className="font-display text-5xl text-white/10 sm:text-7xl">0{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest text-ember-400 uppercase sm:text-sm">{exp.price}</p>
                      <h3 className="mt-2 font-display text-3xl sm:text-5xl">{exp.title}</h3>
                      <p className="mt-3 max-w-md text-sm text-cream/60 sm:text-base">{exp.text}</p>
                      <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
                        {exp.tags.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-cream/60">{t}</span>
                        ))}
                      </div>
                      <MagneticButton to="/reservations" variant="ghost" className="mt-5 px-5 py-2.5 sm:mt-8">
                        Enquire <ArrowUpRight className="size-4" />
                      </MagneticButton>
                    </div>
                  </div>
                  <div className="relative h-[34%] shrink-0 md:h-full">
                    <DishImage src={exp.img} alt={exp.title} accent="#f59e0b" className="absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent md:bg-gradient-to-r" />
                  </div>
                </div>
                <div className="deck-shade pointer-events-none absolute inset-0 z-10 bg-black opacity-0" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
