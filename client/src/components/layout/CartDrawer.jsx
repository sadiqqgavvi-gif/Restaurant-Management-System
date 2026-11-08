import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { money } from '../../lib/utils';
import DishImage from '../ui/DishImage';
import MagneticButton from '../ui/MagneticButton';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, tax, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            className="fixed top-0 right-0 z-[86] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h3 className="font-display text-2xl">Your order</h3>
                <p className="text-sm text-cream/50">{count} item{count === 1 ? '' : 's'}</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-white/10" aria-label="Close cart">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {items.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-cream/50">
                  <ShoppingBag className="size-12" />
                  <p>Your cart is empty — the grill is waiting.</p>
                  <MagneticButton variant="ghost" onClick={() => { setOpen(false); navigate('/menu'); }}>
                    Explore the menu
                  </MagneticButton>
                </div>
              )}
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 80, height: 0, marginTop: 0 }}
                    className="flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <DishImage src={item.image} alt={item.name} accent={item.accent} className="size-20 shrink-0 rounded-xl" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium leading-tight">{item.name}</p>
                        <button onClick={() => remove(item._id)} className="text-cream/40 hover:text-red-400" aria-label={`Remove ${item.name}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-white/10 p-1">
                          <button onClick={() => setQty(item._id, item.quantity - 1)} className="grid size-7 place-items-center rounded-full hover:bg-white/10" aria-label="Decrease">
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => setQty(item._id, item.quantity + 1)} className="grid size-7 place-items-center rounded-full hover:bg-white/10" aria-label="Increase">
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="font-semibold text-ember-400">{money(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 border-t border-white/10 p-6 text-sm">
                <div className="flex justify-between text-cream/60"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-cream/60"><span>Tax (8%)</span><span>{money(tax)}</span></div>
                <div className="flex justify-between pt-2 text-lg font-semibold"><span>Total</span><span className="text-ember-400">{money(total)}</span></div>
                <MagneticButton className="mt-4 w-full" onClick={() => { setOpen(false); navigate('/checkout'); }}>
                  Checkout
                </MagneticButton>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
