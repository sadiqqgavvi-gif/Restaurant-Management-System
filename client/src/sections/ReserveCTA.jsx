import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { CalendarDays, Clock, Users } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';

/** Spotlight panel (cursor-following glow) that scales up from a rounded card as it enters. */
export default function ReserveCTA() {
  const root = useRef(null);
  const mx = useMotionValue(400);
  const my = useMotionValue(200);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${mx}px ${my}px, rgba(245,158,11,.22), transparent 50%)`;

  useGSAP(
    () => {
      gsap.fromTo('.cta-panel', { scale: 0.85, borderRadius: '6rem' }, {
        scale: 1,
        borderRadius: '2.5rem',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 30%', scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="py-20 sm:py-28">
      <div className="container-x">
        <div
          className="cta-panel relative overflow-hidden border border-white/10 bg-ink-800 px-6 py-20 text-center sm:px-16 sm:py-28"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(e.clientX - r.left);
            my.set(e.clientY - r.top);
          }}
        >
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} />
          <div className="pointer-events-none absolute -bottom-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-ember-600/20 blur-[100px]" />
          <div className="relative">
            <span className="eyebrow justify-center">Tonight · Tomorrow · Always</span>
            <SplitReveal text={'Your table is\n*warming* up.'} className="mx-auto mt-6 font-display text-5xl leading-[0.95] font-light sm:text-7xl lg:text-8xl" />
            <div className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-3 text-sm text-cream/60">
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><CalendarDays className="size-4 text-ember-400" /> Tue – Sun</span>
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><Clock className="size-4 text-ember-400" /> 5pm – 11pm</span>
              <span className="glass flex items-center gap-2 rounded-full px-4 py-2"><Users className="size-4 text-ember-400" /> 1 – 20 guests</span>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <MagneticButton to="/reservations" className="px-10 py-5 text-base">Reserve now</MagneticButton>
              <MagneticButton to="/menu" variant="ghost" className="px-10 py-5 text-base">Order online</MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
