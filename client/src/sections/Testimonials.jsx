import { useRef } from 'react';
import { Quote, Star } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap';
import SectionHeading from '../components/ui/SectionHeading';

const REVIEWS = [
  { name: 'Sophia L.', text: 'The wagyu was unreal, but the cloche reveal at the chef’s table stole the night.', tag: 'Anniversary' },
  { name: 'Marcus T.', text: 'Best risotto I have had outside of Milan. The service is effortless and warm.', tag: 'Regular' },
  { name: 'Hana K.', text: 'Every course felt like a small surprise. The smoked old fashioned is a must.', tag: 'Food critic' },
  { name: 'Daniel R.', text: 'Booked the private room for 18 people — flawless from start to finish.', tag: 'Corporate' },
  { name: 'Amara O.', text: 'The molten chocolate dome should be illegal. We ordered two.', tag: 'Dessert lover' },
  { name: 'Lucas M.', text: 'You can feel the fire in every bite. Already planning our next visit.', tag: 'Local guide' },
];

function Review({ r }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-3xl border border-white/10 bg-ink-800 p-6 sm:w-[380px]">
      <div className="flex items-center justify-between">
        <Quote className="size-7 text-ember-400" />
        <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-ember-400 text-ember-400" />)}</div>
      </div>
      <blockquote className="mt-4 text-cream/80">{r.text}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-ember-400 to-ember-700 font-semibold text-ink-950">{r.name[0]}</span>
        <div>
          <p className="text-sm font-semibold">{r.name}</p>
          <p className="text-xs text-cream/40">{r.tag}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** Two rows of reviews that slide sideways in opposite directions as you scroll. */
export default function Testimonials() {
  const root = useRef(null);
  useGSAP(
    () => {
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 };
      gsap.fromTo('.rev-row-a', { x: '5%' }, { x: '-40%', ease: 'none', scrollTrigger: st });
      gsap.fromTo('.rev-row-b', { x: '-40%' }, { x: '5%', ease: 'none', scrollTrigger: { ...st } });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden py-28 sm:py-36">
      <div className="container-x mb-16">
        <SectionHeading eyebrow="Guest notes" title={'Loved by the\npeople we *feed*'} />
      </div>
      <div className="rev-row-a flex w-max gap-6 will-change-transform">
        {[...REVIEWS, ...REVIEWS].map((r, i) => <Review key={i} r={r} />)}
      </div>
      <div className="rev-row-b mt-6 flex w-max gap-6 will-change-transform">
        {[...REVIEWS].reverse().concat(REVIEWS).map((r, i) => <Review key={i} r={r} />)}
      </div>
    </section>
  );
}
