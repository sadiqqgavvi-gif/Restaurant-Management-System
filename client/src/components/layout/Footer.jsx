import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, AtSign, Globe, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP } from '../../lib/gsap';
import { Logo } from './Navbar';

export default function Footer() {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.from('.footer-giant span', {
        yPercent: 100,
        stagger: 0.05,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.footer-giant', start: 'top 95%' },
      });
    },
    { scope: ref }
  );

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/10 bg-ink-900 pt-20">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-ember-600/10 blur-[120px]" />
      <div className="container-x relative grid gap-12 pb-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-cream/60">
            Fire-kissed cooking, seasonal produce and an open kitchen. Every plate is a little ceremony.
          </p>
          <div className="mt-6 flex gap-3">
            {[AtSign, Globe, MessageCircle, Mail].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="grid size-11 place-items-center rounded-full border border-white/10 transition hover:-translate-y-1 hover:border-ember-400 hover:text-ember-400">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Visit</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex gap-3"><MapPin className="size-4 shrink-0 text-ember-400" /> 21 Ember Lane, Old Town</li>
            <li className="flex gap-3"><Phone className="size-4 shrink-0 text-ember-400" /> +1 (555) 013-2026</li>
            <li className="flex gap-3"><Clock className="size-4 shrink-0 text-ember-400" /> Tue–Sun · 5pm – 11pm</li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <ul className="space-y-3 text-sm text-cream/70">
            {[['/menu', 'Menu'], ['/reservations', 'Reservations'], ['/checkout', 'Order online'], ['/admin', 'Staff dashboard']].map(([to, l]) => (
              <li key={to}>
                <Link to={to} className="group inline-flex items-center gap-1 hover:text-ember-400">
                  {l} <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer-giant container-x flex overflow-hidden font-display text-[23vw] leading-[0.8] font-light tracking-tighter text-white/[0.04] select-none">
        {'EMBER'.split('').map((l, i) => (
          <span key={i} className="inline-block">{l}</span>
        ))}
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-xs text-cream/40 sm:flex-row">
        <span>© {new Date().getFullYear()} Ember Restaurant. All rights reserved.</span>
        <span>Built with MongoDB · Express · React · Node</span>
      </div>
    </footer>
  );
}
