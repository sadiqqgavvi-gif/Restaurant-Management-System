import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import SectionHeading from '../components/ui/SectionHeading';
import TiltCard from '../components/ui/TiltCard';

const CHEFS = [
  { name: 'Aria Moretti', role: 'Executive Chef', quote: 'Fire is an ingredient. Respect it.', hue: '#f59e0b', initials: 'AM' },
  { name: 'Kenji Watanabe', role: 'Head of Grill', quote: 'Patience is the best seasoning.', hue: '#ea580c', initials: 'KW' },
  { name: 'Leila Haddad', role: 'Pastry Chef', quote: 'Dessert should feel like a secret.', hue: '#f472b6', initials: 'LH' },
];

/** Chef cards fly in from alternating sides with rotation, then tilt in 3D on hover. */
export default function Chefs() {
  const root = useRef(null);
  useGSAP(
    () => {
      gsap.utils.toArray('.chef-card').forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        gsap.from(card, {
          x: fromLeft ? -220 : 220,
          rotate: fromLeft ? -12 : 12,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 60%', scrub: 1 },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden py-28 sm:py-36">
      <div className="container-x">
        <SectionHeading eyebrow="The brigade" title={'Hands behind\nthe *flame*'} align="center" />
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {CHEFS.map((c) => (
            <div key={c.name} className="chef-card">
              <TiltCard className="rounded-[2rem] border border-white/10 bg-ink-800 p-3">
                <div
                  className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[1.6rem]"
                  style={{ background: `radial-gradient(circle at 50% 30%, ${c.hue}66, transparent 60%), linear-gradient(160deg, #2a221c, #0a0806)` }}
                >
                  <span className="font-display text-[9rem] leading-none text-white/10" style={{ transform: 'translateZ(60px)' }}>{c.initials}</span>
                  <div className="absolute inset-x-6 bottom-6" style={{ transform: 'translateZ(80px)' }}>
                    <p className="font-display text-xl italic text-cream/90">“{c.quote}”</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 pt-4 pb-2" style={{ transform: 'translateZ(40px)' }}>
                  <div>
                    <h3 className="font-display text-2xl">{c.name}</h3>
                    <p className="text-sm text-cream/50">{c.role}</p>
                  </div>
                  <span className="size-3 rounded-full" style={{ background: c.hue, boxShadow: `0 0 20px ${c.hue}` }} />
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
