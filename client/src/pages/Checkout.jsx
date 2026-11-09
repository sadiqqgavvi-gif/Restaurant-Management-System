import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bike, ShoppingBag, UtensilsCrossed, Minus, Plus, Radio } from 'lucide-react';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { cn, money } from '../lib/utils';
import MagneticButton from '../components/ui/MagneticButton';
import SuccessCheck from '../components/ui/SuccessCheck';
import DishImage from '../components/ui/DishImage';
import SplitReveal from '../components/ui/SplitReveal';

const TYPES = [
  { id: 'takeaway', label: 'Pickup', icon: ShoppingBag },
  { id: 'delivery', label: 'Delivery', icon: Bike },
  { id: 'dine-in', label: 'At my table', icon: UtensilsCrossed },
];

export default function Checkout() {
  const { items, subtotal, tax, total, setQty, clear } = useCart();
  const [type, setType] = useState('takeaway');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const set = (k) => (e) => setCustomer((c) => ({ ...c, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api('/orders', {
        method: 'POST',
        body: {
          customer,
          type,
          notes,
          tableNumber: type === 'dine-in' && tableNumber ? Number(tableNumber) : undefined,
          items: items.map((i) => ({ id: i._id, quantity: i.quantity })),
        },
      });
      setOrder(data);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-28 text-center">
        <SuccessCheck className="size-28" />
        <h1 className="mt-6 font-display text-5xl sm:text-6xl">Order received</h1>
        <p className="mt-3 text-cream/60">The kitchen is firing up. Order <span className="text-ember-400">#{order._id.slice(-6).toUpperCase()}</span> · {money(order.total)}</p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-10 flex flex-wrap justify-center gap-4">
          <MagneticButton to={`/track/${order._id}`}>
            <Radio className="size-4" /> Track your order live
          </MagneticButton>
          <MagneticButton to="/menu" variant="ghost">Back to menu</MagneticButton>
        </motion.div>
        <p className="mt-4 text-xs text-cream/40">Bookmark the tracking page — it updates the moment the kitchen does.</p>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-28">
      <div className="container-x">
        <SplitReveal as="h1" scroll={false} text="*Checkout*" className="font-display text-6xl font-light sm:text-8xl" />
        {items.length === 0 ? (
          <div className="mt-12 rounded-[2rem] border border-white/10 p-12 text-center text-cream/60">
            Your cart is empty.
            <div className="mt-6"><MagneticButton to="/menu">Browse the menu</MagneticButton></div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {TYPES.map(({ id, label, icon: Icon }) => (
                  <button type="button" key={id} onClick={() => setType(id)}
                    className={cn('relative isolate flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm transition', type === id ? 'border-ember-400 text-ember-300' : 'border-white/10 text-cream/60 hover:border-white/30')}>
                    {type === id && <motion.span layoutId="type-bg" className="absolute inset-0 -z-10 rounded-2xl bg-ember-400/10" />}
                    <Icon className="size-5" /> {label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full name" value={customer.name} onChange={set('name')} className="field" />
                <input required type="tel" placeholder="Phone" value={customer.phone} onChange={set('phone')} className="field" />
              </div>
              <input type="email" placeholder="Email (for receipt)" value={customer.email} onChange={set('email')} className="field" />
              {type === 'delivery' && <input required placeholder="Delivery address" value={customer.address} onChange={set('address')} className="field" />}
              {type === 'dine-in' && <input required type="number" min="1" placeholder="Table number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} className="field" />}
              <textarea rows={3} placeholder="Notes for the kitchen" value={notes} onChange={(e) => setNotes(e.target.value)} className="field resize-none" />
              {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            </div>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-ink-800/70 p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl">Summary</h2>
              <div className="mt-5 space-y-3">
                {items.map((i) => (
                  <div key={i._id} className="flex items-center gap-3">
                    <DishImage src={i.image} alt={i.name} accent={i.accent} className="size-14 shrink-0 rounded-xl" sizes="56px" />
                    <div className="flex-1">
                      <p className="text-sm leading-tight">{i.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-cream/50">
                        <button type="button" onClick={() => setQty(i._id, i.quantity - 1)} aria-label="Decrease"><Minus className="size-3.5" /></button>
                        <span className="text-xs">{i.quantity}</span>
                        <button type="button" onClick={() => setQty(i._id, i.quantity + 1)} aria-label="Increase"><Plus className="size-3.5" /></button>
                      </div>
                    </div>
                    <span className="text-sm">{money(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-cream/60"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-cream/60"><span>Tax (8%)</span><span>{money(tax)}</span></div>
                <div className="flex justify-between pt-2 text-xl font-semibold"><span>Total</span><span className="text-ember-400">{money(total)}</span></div>
              </div>
              <MagneticButton type="submit" className="mt-6 w-full py-4" disabled={loading}>
                {loading ? 'Placing order…' : `Place order · ${money(total)}`}
              </MagneticButton>
              <p className="mt-3 text-center text-xs text-cream/40">Pay at pickup, on delivery or at your table.</p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
