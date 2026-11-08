import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, Star, Flame, WifiOff } from 'lucide-react';
import { fetchMenu } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { money, cn } from '../lib/utils';
import SplitReveal from '../components/ui/SplitReveal';
import TiltCard from '../components/ui/TiltCard';
import DishImage from '../components/ui/DishImage';
import Marquee from '../components/ui/Marquee';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Mains' },
  { id: 'grill', label: 'From the grill' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'drinks', label: 'Drinks' },
];

function DishCard({ dish, index }) {
  const { add } = useCart();
  const toast = useToast();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, rotateX: -20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <TiltCard max={8} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800">
        <div className="relative">
          <DishImage src={dish.image} alt={dish.name} accent={dish.accent} className="aspect-[4/3]" imgClassName="group-hover:scale-110 !duration-[1.2s]" />
          <div className="absolute inset-x-0 top-0 flex justify-between p-4">
            <span className="glass rounded-full bg-ink-950/50 px-3 py-1 text-xs capitalize">{dish.category}</span>
            {dish.spicy > 0 && (
              <span className="glass flex items-center gap-0.5 rounded-full bg-ink-950/50 px-2 py-1">
                {[...Array(dish.spicy)].map((_, i) => <Flame key={i} className="size-3 fill-red-500 text-red-500" />)}
              </span>
            )}
          </div>
        </div>
        <div className="p-6" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl leading-tight">{dish.name}</h3>
            <span className="font-display text-2xl text-ember-400">{money(dish.price)}</span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-cream/55">{dish.description}</p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {dish.tags?.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-cream/50">{t}</span>
              ))}
              <span className="flex items-center gap-1 px-1 text-xs text-cream/50"><Star className="size-3 fill-ember-400 text-ember-400" />{dish.rating}</span>
            </div>
            <button
              onClick={() => {
                add(dish);
                toast(`${dish.name} added to your order`);
              }}
              className="grid size-11 place-items-center rounded-full bg-ember-500 text-ink-950 transition hover:scale-110 hover:rotate-90"
              aria-label={`Add ${dish.name} to order`}
            >
              <Plus className="size-5" />
            </button>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Menu() {
  const [items, setItems] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchMenu().then(({ items, offline }) => {
      setItems(items);
      setOffline(offline);
      setLoading(false);
    });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) => (category === 'all' || i.category === category) && (!q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
    );
  }, [items, category, query]);

  return (
    <div className="pt-36 pb-28">
      <div className="container-x">
        <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> À la carte</span>
        <SplitReveal as="h1" scroll={false} text={'The *menu*'} className="mt-4 font-display text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-light tracking-tight" />
        <p className="mt-6 max-w-lg text-cream/60">Written each morning with our farmers. Add dishes to your order for pickup, delivery or to have ready at your table.</p>
      </div>

      <Marquee className="mt-14 border-y border-white/10 py-4 text-sm tracking-[0.3em] text-cream/40 uppercase" duration={40}>
        {['Seasonal', 'Wood-fired', 'Dry-aged', 'Gluten-free options', 'Halal grill', 'Vegetarian friendly'].map((w) => (
          <span key={w} className="flex items-center gap-8">{w}<Flame className="size-4 text-ember-500" /></span>
        ))}
      </Marquee>

      <div className="container-x">
        {offline && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <WifiOff className="size-4 shrink-0" /> Showing the offline menu — start the API server to enable online ordering.
          </div>
        )}

        <div className="sticky top-24 z-30 mt-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-ink-950/80 p-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn('relative isolate shrink-0 rounded-full px-5 py-2.5 text-sm transition-colors', category === c.id ? 'text-ink-950' : 'text-cream/60 hover:text-cream')}
              >
                {category === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-ember-400" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                {c.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" className="field rounded-full py-2.5 pl-11" />
          </label>
        </div>

        <motion.div layout className="mt-10 grid gap-6 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            [...Array(6)].map((_, i) => <div key={i} className="h-[440px] animate-pulse rounded-[2rem] bg-ink-800" />)}
          <AnimatePresence mode="popLayout">
            {visible.map((dish, i) => (
              <DishCard key={dish._id} dish={dish} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
        {!loading && visible.length === 0 && <p className="mt-16 text-center text-cream/50">No dishes match “{query}”.</p>}
      </div>
    </div>
  );
}
