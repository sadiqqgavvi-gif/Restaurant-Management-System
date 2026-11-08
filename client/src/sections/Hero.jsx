import { lazy, Suspense, useRef } from 'react';
import { ArrowDown, Star, Flame, Award } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import { useAppReady } from '../lib/ready';
import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';

const HeroScene = lazy(() => import('../components/three/HeroScene'));

export default function Hero() {
  const root = useRef(null);
  const ready = useAppReady();

  useGSAP(
    () => {
      gsap.set('.hero-fade', { opacity: 0, y: 30 });
      gsap.set('.hero-canvas', { opacity: 0, filter: 'blur(24px)' });
      if (!ready) return;

      gsap.timeline({ delay: 0.15 })
        .to('.hero-canvas', { opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'expo.out', clearProps: 'filter' })
        .to('.hero-fade', { opacity: 1, y: 0, stagger: 0.1, duration: 1 }, 0.5);

      // Scroll-out: content drifts up and fades while the 3D dish rises (handled in-scene).
      gsap.to('.hero-content', {
        yPercent: -30,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-glow', {
        scale: 1.6,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="hero-glow pointer-events-none absolute top-1/2 left-1/2 size-[70vmin] -translate-1/2 rounded-full bg-ember-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-ink-950)_80%)]" />

      <div className="hero-canvas absolute inset-0 md:left-[30%]">
        <div className="absolute inset-0 max-md:top-[35%] max-md:opacity-60">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>
      </div>

      <div className="hero-content container-x pointer-events-none relative z-10 flex h-full flex-col justify-center pt-20">
        <span className="hero-fade eyebrow">
          <Flame className="size-3.5" /> Open-fire kitchen · Est. 2014
        </span>
        <SplitReveal
          as="h1"
          scroll={false}
          delay={0.2}
          stagger={0.07}
          text={'Where *fire*\nmeets fine\ndining.'}
          className="mt-6 max-w-3xl font-display text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.92] font-light tracking-tight"
        />
        <p className="hero-fade mt-8 max-w-md text-base leading-relaxed text-cream/60 sm:text-lg">
          Seasonal ingredients, kissed by oak embers and plated with obsession. Reserve your table or order the
          experience home.
        </p>
        <div className="hero-fade pointer-events-auto mt-10 flex flex-wrap gap-4">
          <MagneticButton to="/reservations">Reserve a table</MagneticButton>
          <MagneticButton to="/menu" variant="ghost">Explore menu</MagneticButton>
        </div>

        <div className="hero-fade mt-14 flex flex-wrap items-center gap-8 text-sm text-cream/60">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-ember-400 text-ember-400" />
              ))}
            </div>
            <span>4.9 · 2,400+ reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-ember-400" /> Michelin Guide 2026
          </div>
        </div>
      </div>

      <div className="hero-fade absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.4em] text-cream/40 uppercase">
        Scroll
        <span className="grid h-10 w-6 place-items-start justify-center rounded-full border border-white/20 p-1">
          <ArrowDown className="size-3 animate-bounce text-ember-400" />
        </span>
      </div>
    </section>
  );
}
