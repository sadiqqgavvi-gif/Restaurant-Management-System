import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'ember-cart';
const TAX_RATE = 0.08;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart just won't persist */
    }
  }, [items]);

  const add = useCallback((dish, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i._id === dish._id);
      if (found) return prev.map((i) => (i._id === dish._id ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { _id: dish._id, name: dish.name, price: dish.price, image: dish.image, accent: dish.accent, quantity: qty }];
    });
  }, []);

  const setQty = useCallback((id, quantity) => {
    setItems((prev) =>
      quantity <= 0 ? prev.filter((i) => i._id !== id) : prev.map((i) => (i._id === id ? { ...i, quantity } : i))
    );
  }, []);

  const remove = useCallback((id) => setItems((prev) => prev.filter((i) => i._id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { items, count, subtotal, tax, total: subtotal + tax, add, setQty, remove, clear, open, setOpen };
  }, [items, add, setQty, remove, clear, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
