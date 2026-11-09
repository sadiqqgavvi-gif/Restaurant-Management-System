import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import DishImage from '../components/ui/DishImage';
import Counter from '../components/ui/Counter';

const STATEMENT =
  'We cook over live fire because it is honest. Oak, charcoal and time — no shortcuts. Every dish begins at dawn with a farmer’s call and ends at your table as a story worth telling.';

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', accent: '#f59e0b', speed: -0.25, cls: 'left-0 top-0 h-[55%] w-[58%]' },
  { src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&q=80', accent: '#ea580c', speed: 0.2, cls: 'right-0 top-[18%] h-[48%] w-[40%]' },
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80', accent: '#fbbf24', speed: -0.1, cls: 'left-[18%] bottom-0 h-[38%] w-[50%]' },
];

export default function About() {
  const root = useRef(null);

  useGSAP(
    () => {
      // Words light up one by one as you scroll through the statement.
      gsap.fromTo(
        '.stmt-word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: '.stmt', start: 'top 80%', end: 'bottom 45%', scrub: true },
        }
      );
      // Parallax collage: each image travels at its own speed + a subtle clip reveal.
      gsap.utils.toArray('.parallax-img').forEach((el) => {
        const speed = Number(el.dataset.speed);
        gsap.fromTo(el, { yPercent: speed * -60 }, {
          yPercent: speed * 60,
          ease: 'none',
          scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true },
        });
        gsap.from(el, {
          clipPath: 'inset(100% 0% 0% 0% round 2rem)',
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        });
      });
      gsap.from('.about-stat', {
        x: (i) => (i % 2 ? 80 : -80),
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        scrollTrigger: { trigger: '.about-stats', start: 'top 85%' },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="about" className="relative py-28 sm:py-40">
      <div className="container-x grid items-center gap-20 lg:grid-cols-2">
        <div>
          <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Our story</span>
          <p className="stmt mt-8 font-display text-3xl leading-[1.25] font-light sm:text-4xl lg:text-[2.6rem]">
            {STATEMENT.split(' ').map((w, i) => (
              <span key={i} className="stmt-word">{w} </span>
            ))}
          </p>
          <div className="about-stats mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { v: 12, s: '+', l: 'Years of fire' },
              { v: 48, s: '', l: 'Local farms' },
              { v: 4.9, d: 1, s: '★', l: 'Guest rating' },
            ].map((st) => (
              <div key={st.l} className="about-stat glass rounded-3xl p-5">
                <Counter value={st.v} decimals={st.d || 0} suffix={st.s} className="font-display text-4xl text-ember-400" />
                <p className="mt-1 text-sm text-cream/50">{st.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="collage relative h-[560px] sm:h-[680px]">
          {IMAGES.map((img, i) => (
            <div key={i} data-speed={img.speed} className={`parallax-img absolute overflow-hidden rounded-[2rem] shadow-2xl shadow-black/60 ${img.cls}`}>
              <DishImage src={img.src} alt="Inside Ember" accent={img.accent} className="h-full w-full" imgClassName="scale-110" sizes="(max-width: 1024px) 60vw, 30vw" />
            </div>
          ))}
          <div className="absolute top-[52%] left-[52%] z-10 grid size-28 -translate-1/2 place-items-center rounded-full bg-ember-500 text-ink-950 shadow-2xl">
            <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
              <defs>
                <path id="circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-ink-950 text-[10px] font-bold tracking-[0.25em] uppercase">
                <textPath href="#circle">Fire · Smoke · Soul · Since 2014 ·</textPath>
              </text>
            </svg>
            <span className="font-display text-3xl">E</span>
          </div>
        </div>
      </div>
    </section>
  );
}
