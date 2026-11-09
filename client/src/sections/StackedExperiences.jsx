import { useRef } from 'react';
import { ChefHat, Wine, Users, Flame } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import SectionHeading from '../components/ui/SectionHeading';
import DishImage from '../components/ui/DishImage';
import MagneticButton from '../components/ui/MagneticButton';

const EXPERIENCES = [
  { icon: ChefHat, title: 'Chef’s Table', price: 'From $145 pp', text: 'Ten courses at the pass, cooked and explained by our head chef. Eight seats, two seatings a night.', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80', color: 'from-ember-500/30' },
  { icon: Wine, title: 'Cellar Pairing', price: 'From $85 pp', text: 'Our sommelier pairs each course with natural and old-world wines from a 600-label cellar.', img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=80', color: 'from-rose-500/30' },
  { icon: Users, title: 'Private Dining', price: 'Up to 24 guests', text: 'A candle-lit room with its own fireplace and a menu designed with you for birthdays, launches and weddings.', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', color: 'from-amber-300/30' },
  { icon: Flame, title: 'Fire Masterclass', price: 'Saturdays · $120', text: 'Learn to build, read and cook over live fire with our grill team. Lunch and a glass of wine included.', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80', color: 'from-orange-600/30' },
];

/** Sticky card stack: each card pins, then shrinks and dims as the next one slides over it. */
export default function StackedExperiences() {
  const root = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('.stack-card');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const st = { trigger: cards[i + 1], start: 'top bottom', end: 'top 15%', scrub: true };
        gsap.to(card.querySelector('.stack-shade'), { opacity: 0.6, ease: 'none', scrollTrigger: st });
        gsap.to(card.querySelector('.stack-inner'), {
          scale: 0.88 + i * 0.025,
          rotateX: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top 15%',
            scrub: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow="Beyond dinner" title={'Experiences worth\n*booking* ahead'} subtitle="Four ways to go deeper into the Ember kitchen." />
        <div className="mt-16 space-y-[12vh]">
          {EXPERIENCES.map((exp, i) => {
            const Icon = exp.icon;
            return (
              <div key={exp.title} className="stack-card sticky [perspective:1200px]" style={{ top: `calc(12vh + ${i * 24}px)` }}>
                <div className={`stack-inner grid origin-top bg-ink-800 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br ${exp.color} to-ink-800 to-60% shadow-2xl shadow-black/50 md:min-h-[60vh] md:grid-cols-2 relative will-change-transform`}>
                  <div className="stack-shade pointer-events-none absolute inset-0 z-10 bg-black opacity-0" />
                  <div className="flex flex-col justify-between gap-10 p-8 sm:p-12">
                    <div className="flex items-center justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl bg-ink-950/50 text-ember-400"><Icon className="size-7" /></span>
                      <span className="font-display text-6xl text-white/10">0{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm tracking-widest text-ember-400 uppercase">{exp.price}</p>
                      <h3 className="mt-3 font-display text-4xl sm:text-5xl">{exp.title}</h3>
                      <p className="mt-4 max-w-md text-cream/60">{exp.text}</p>
                      <MagneticButton to="/reservations" variant="ghost" className="mt-8">Enquire</MagneticButton>
                    </div>
                  </div>
                  <DishImage src={exp.img} alt={exp.title} className="min-h-[260px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
