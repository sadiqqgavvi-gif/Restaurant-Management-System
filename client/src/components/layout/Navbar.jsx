import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ShoppingBag, Menu as MenuIcon, X, Flame } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { cn } from '../../lib/utils';
import MagneticButton from '../ui/MagneticButton';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/reservations', label: 'Reserve' },
  { to: '/admin', label: 'Dashboard' },
];

export function Logo({ className }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2', className)} data-cursor="hover">
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-ember-400 to-ember-700 shadow-lg shadow-ember-600/30 transition-transform duration-500 group-hover:rotate-[360deg]">
        <Flame className="size-5 text-ink-950" strokeWidth={2.5} />
      </span>
      <span className="font-display text-2xl tracking-tight">Ember</span>
    </Link>
  );
}

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 300 && !mobile);
    setScrolled(y > 40);
  });

  useEffect(() => setMobile(false), [pathname]);

  return (
    <>
      <motion.header
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50 pt-4"
      >
        <nav
          className={cn(
            'container-x flex items-center justify-between rounded-full transition-all duration-500',
            scrolled && 'glass mx-auto max-w-6xl bg-ink-950/60 py-2.5 shadow-2xl shadow-black/40'
          )}
        >
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn('relative isolate rounded-full px-4 py-2 text-sm transition-colors', isActive ? 'text-ink-950' : 'text-cream/70 hover:text-cream')
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-ember-400"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="relative grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-ember-400/60"
              aria-label="Open cart"
            >
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-ember-500 text-[10px] font-bold text-ink-950"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <MagneticButton to="/reservations" className="hidden px-5 py-2.5 lg:inline-flex">
              Book a table
            </MagneticButton>
            <button
              onClick={() => setMobile((m) => !m)}
              className="grid size-11 place-items-center rounded-full border border-white/10 md:hidden"
              aria-label="Toggle menu"
            >
              {mobile ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-ink-900 px-8 md:hidden"
          >
            {LINKS.map(({ to, label }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
              >
                <Link to={to} className="block py-3 font-display text-5xl font-light">
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
