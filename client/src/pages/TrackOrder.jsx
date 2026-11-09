import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardCheck, ChefHat, BellRing, UtensilsCrossed, XCircle, Radio } from 'lucide-react';
import { api, API_BASE } from '../lib/api';
import { cn, money } from '../lib/utils';
import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';

const STEPS = [
  { id: 'pending', label: 'Received', text: 'The kitchen has your order.', icon: ClipboardCheck },
  { id: 'preparing', label: 'On the fire', text: 'Our chefs are cooking it now.', icon: ChefHat },
  { id: 'ready', label: 'Ready', text: 'Plated and waiting at the pass.', icon: BellRing },
  { id: 'served', label: 'Enjoy', text: 'Served — bon appétit!', icon: UtensilsCrossed },
];

/** Customer order page that updates itself in real time via Server-Sent Events. */
export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let es;
    api(`/orders/${id}`)
      .then((o) => {
        setOrder(o);
        es = new EventSource(`${API_BASE}/orders/${id}/stream`);
        es.onopen = () => setLive(true);
        es.onerror = () => setLive(false); // EventSource reconnects by itself
        es.addEventListener('status', (e) => {
          const next = JSON.parse(e.data);
          setOrder((prev) => {
            if (prev && prev.status !== next.status) {
              setFlash(true);
              setTimeout(() => setFlash(false), 1200);
            }
            return next;
          });
        });
      })
      .catch((err) => setError(err.status === 404 || err.status === 400 ? 'We couldn’t find that order.' : err.message));
    return () => es?.close();
  }, [id]);

  if (error) {
    return (
      <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-28 text-center">
        <h1 className="font-display text-5xl">Order not found</h1>
        <p className="mt-3 text-cream/60">{error}</p>
        <MagneticButton to="/menu" className="mt-8">Back to menu</MagneticButton>
      </div>
    );
  }
  if (!order) return <div className="min-h-screen" />;

  const cancelled = order.status === 'cancelled';
  const current = Math.max(0, STEPS.findIndex((s) => s.id === order.status));
  const progress = cancelled ? 0 : current / (STEPS.length - 1);
  const step = STEPS[current];

  return (
    <div className="relative overflow-hidden pt-36 pb-28">
      <div className="pointer-events-none absolute top-20 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(234,88,12,.18),transparent_60%)]" />
      <div className="container-x relative max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Order #{order._id.slice(-6).toUpperCase()}</span>
          <span className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs', live ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-cream/50')}>
            <Radio className={cn('size-3.5', live && 'animate-pulse')} /> {live ? 'Live updates on' : 'Connecting…'}
          </span>
        </div>
        <SplitReveal as="h1" scroll={false} text={`Thanks, *${order.customerName || 'friend'}*.`} className="mt-4 font-display text-5xl font-light sm:text-7xl" />
        <p className="mt-3 text-cream/60">This page updates by itself — no need to refresh.</p>

        {/* status card */}
        <motion.div
          animate={flash ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0 0 rgba(245,158,11,0)', '0 0 0 12px rgba(245,158,11,.15)', '0 0 0 0 rgba(245,158,11,0)'] } : {}}
          transition={{ duration: 1.1 }}
          className="mt-10 rounded-[2rem] border border-white/10 bg-ink-800 p-6 sm:p-10"
        >
          {cancelled ? (
            <div className="flex items-center gap-4 text-red-300">
              <XCircle className="size-10" />
              <div>
                <p className="font-display text-3xl">Order cancelled</p>
                <p className="text-sm text-cream/60">Please call us if this wasn’t expected.</p>
              </div>
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div key={step.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex items-center gap-4">
                  <span className="grid size-16 place-items-center rounded-2xl bg-ember-500 text-ink-950"><step.icon className="size-8" /></span>
                  <div>
                    <p className="font-display text-3xl sm:text-4xl">{step.label}</p>
                    <p className="text-cream/60">{step.text}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="relative mt-10">
                <div className="absolute top-5 right-5 left-5 h-0.5 bg-white/10" />
                <motion.div
                  className="absolute top-5 left-5 h-0.5 origin-left bg-gradient-to-r from-ember-400 to-ember-600"
                  style={{ right: 20 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress }}
                  transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
                />
                <ol className="relative grid grid-cols-4">
                  {STEPS.map((s, i) => {
                    const done = i <= current;
                    return (
                      <li key={s.id} className="flex flex-col items-center text-center">
                        <motion.span
                          animate={{ scale: i === current ? 1.15 : 1 }}
                          className={cn('grid size-10 place-items-center rounded-full border-2 transition-colors duration-500', done ? 'border-ember-400 bg-ember-500 text-ink-950' : 'border-white/15 bg-ink-900 text-cream/40')}
                        >
                          <s.icon className="size-4" />
                        </motion.span>
                        <span className={cn('mt-3 text-xs sm:text-sm', done ? 'text-cream' : 'text-cream/40')}>{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </>
          )}
        </motion.div>

        {/* receipt */}
        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-ink-800 p-6">
            <h2 className="font-display text-2xl">Your order</h2>
            <ul className="mt-4 divide-y divide-white/5 text-sm">
              {order.items.map((it) => (
                <li key={it.name} className="flex justify-between py-2.5">
                  <span><span className="text-ember-400">{it.quantity}×</span> {it.name}</span>
                  <span className="text-cream/70">{money(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-ink-800 p-6 text-sm">
            <p className="text-cream/50 capitalize">{order.type === 'dine-in' ? `Dine-in · table ${order.tableNumber ?? '—'}` : order.type}</p>
            <p className="mt-1 text-cream/50">Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              <div className="flex justify-between text-cream/60"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              <div className="flex justify-between text-cream/60"><span>Tax</span><span>{money(order.tax)}</span></div>
              <div className="flex justify-between pt-1 text-lg font-semibold"><span>Total</span><span className="text-ember-400">{money(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
