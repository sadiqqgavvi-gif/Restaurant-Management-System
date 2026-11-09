import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, ClipboardList, CalendarCheck, UtensilsCrossed, LogOut, DollarSign, Flame, Users, BookOpen, RefreshCw, Trash2, Plus, Lock, Radio } from 'lucide-react';
import { api, API_BASE } from '../lib/api';
import { cn, money } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import MagneticButton from '../components/ui/MagneticButton';
import Counter from '../components/ui/Counter';
import TiltCard from '../components/ui/TiltCard';

const TOKEN_KEY = 'ember-admin-token';
const ORDER_STATUS = ['pending', 'preparing', 'ready', 'served', 'cancelled'];
const RES_STATUS = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
const STATUS_COLOR = {
  pending: 'bg-amber-500/15 text-amber-300', preparing: 'bg-orange-500/15 text-orange-300', ready: 'bg-lime-500/15 text-lime-300',
  served: 'bg-emerald-500/15 text-emerald-300', confirmed: 'bg-sky-500/15 text-sky-300', seated: 'bg-violet-500/15 text-violet-300',
  completed: 'bg-emerald-500/15 text-emerald-300', cancelled: 'bg-red-500/15 text-red-300',
};

const readToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };

function Login({ onLogin }) {
  const [email, setEmail] = useState(import.meta.env.DEV ? 'admin@ember.com' : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { email, password } });
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x grid min-h-screen place-items-center pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 40, rotateX: 20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md [perspective:1000px]">
        <TiltCard max={6} className="rounded-[2rem] border border-white/10 bg-ink-800/80 p-8 backdrop-blur-xl sm:p-10">
          <span className="grid size-14 place-items-center rounded-2xl bg-ember-500/15 text-ember-400"><Lock className="size-6" /></span>
          <h1 className="mt-6 font-display text-4xl">Staff dashboard</h1>
          <p className="mt-2 text-sm text-cream/50">Sign in to manage orders, reservations and the menu.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="Email" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="Password" />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <MagneticButton type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</MagneticButton>
          </form>
          {import.meta.env.DEV && <p className="mt-6 text-center text-xs text-cream/40">Dev default: admin@ember.com / admin123 (set in server/.env)</p>}
        </TiltCard>
      </motion.div>
    </div>
  );
}

function StatusSelect({ value, options, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn('rounded-full border-0 px-3 py-1.5 text-xs capitalize outline-none', STATUS_COLOR[value])}>
      {options.map((o) => <option key={o} value={o} className="bg-ink-900 text-cream">{o}</option>)}
    </select>
  );
}

function Overview({ stats }) {
  if (!stats) return null;
  const cards = [
    { icon: DollarSign, label: 'Total revenue', value: stats.revenue, prefix: '$', decimals: 2 },
    { icon: Flame, label: 'Active orders', value: stats.activeOrders },
    { icon: ClipboardList, label: 'Orders today', value: stats.ordersToday },
    { icon: Users, label: 'Upcoming bookings', value: stats.upcomingReservations },
    { icon: BookOpen, label: 'Menu items', value: stats.menuCount },
  ];
  const max = Math.max(1, ...stats.topItems.map((t) => t.sold));
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ icon: Icon, label, value, prefix, decimals }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <TiltCard max={10} className="rounded-3xl border border-white/10 bg-ink-800 p-5">
              <Icon className="size-5 text-ember-400" />
              <Counter scroll={false} value={value} prefix={prefix} decimals={decimals} className="mt-4 block font-display text-3xl" />
              <p className="mt-1 text-xs text-cream/50">{label}</p>
            </TiltCard>
          </motion.div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-ink-800 p-6">
        <h3 className="font-display text-2xl">Best sellers</h3>
        {stats.topItems.length === 0 && <p className="mt-4 text-sm text-cream/50">No orders yet — place one from the menu to see it here.</p>}
        <div className="mt-6 space-y-4">
          {stats.topItems.map((t, i) => (
            <div key={t.name}>
              <div className="mb-1.5 flex justify-between text-sm"><span>{t.name}</span><span className="text-cream/50">{t.sold} sold</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(t.sold / max) * 100}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-ember-400 to-ember-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Orders({ orders, onStatus }) {
  if (!orders.length) return <p className="text-cream/50">No orders yet.</p>;
  return (
    <div className="space-y-3">
      {orders.map((o, i) => (
        <motion.div key={o._id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-800 p-5 md:flex-row md:items-center">
          <div className="md:w-40">
            <a href={`/track/${o._id}`} target="_blank" rel="noreferrer" className="font-mono text-sm text-ember-400 hover:underline">#{o._id.slice(-6).toUpperCase()}</a>
            <p className="text-xs text-cream/40">{new Date(o.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex-1">
            <p className="font-medium">{o.customer.name} <span className="text-sm text-cream/40">· {o.customer.phone} · {o.type}{o.tableNumber ? ` #${o.tableNumber}` : ''}</span></p>
            <p className="mt-1 text-sm text-cream/60">{o.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}</p>
          </div>
          <span className="font-semibold md:w-24 md:text-right">{money(o.total)}</span>
          <StatusSelect value={o.status} options={ORDER_STATUS} onChange={(s) => onStatus(o._id, s)} />
        </motion.div>
      ))}
    </div>
  );
}

function ReservationsList({ reservations, onStatus }) {
  if (!reservations.length) return <p className="text-cream/50">No reservations yet.</p>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reservations.map((r, i) => (
        <motion.div key={r._id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl border border-white/10 bg-ink-800 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl">{r.name}</p>
              <p className="text-xs text-cream/40">{r.email} · {r.phone}</p>
            </div>
            <StatusSelect value={r.status} options={RES_STATUS} onChange={(s) => onStatus(r._id, s)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/5 px-3 py-1">{new Date(r.date).toLocaleDateString()}</span>
            <span className="rounded-full bg-white/5 px-3 py-1">{r.time}</span>
            <span className="rounded-full bg-white/5 px-3 py-1">{r.guests} guests</span>
            {r.occasion !== 'none' && <span className="rounded-full bg-ember-500/15 px-3 py-1 capitalize text-ember-300">{r.occasion}</span>}
          </div>
          {r.notes && <p className="mt-3 text-sm text-cream/60">“{r.notes}”</p>}
        </motion.div>
      ))}
    </div>
  );
}

const NEW_ITEM = { name: '', description: '', price: '', category: 'mains', image: '', featured: false };

function MenuManager({ items, token, reload }) {
  const toast = useToast();
  const [form, setForm] = useState(NEW_ITEM);
  const [showForm, setShowForm] = useState(false);

  const update = async (id, body) => {
    try {
      await api(`/menu/${id}`, { method: 'PUT', body, token });
      reload();
    } catch (err) { toast(err.message, 'error'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this dish?')) return;
    try {
      await api(`/menu/${id}`, { method: 'DELETE', token });
      toast('Dish deleted');
      reload();
    } catch (err) { toast(err.message, 'error'); }
  };
  const create = async (e) => {
    e.preventDefault();
    try {
      await api('/menu', { method: 'POST', body: { ...form, price: Number(form.price) }, token });
      toast('Dish added');
      setForm(NEW_ITEM);
      setShowForm(false);
      reload();
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <MagneticButton onClick={() => setShowForm((s) => !s)} variant="ghost" className="mb-6"><Plus className="size-4" /> New dish</MagneticButton>
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={create} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 grid gap-3 overflow-hidden sm:grid-cols-2">
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
            <input required type="number" min="0" step="0.5" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field capitalize">
              {['starters', 'mains', 'grill', 'desserts', 'drinks'].map((c) => <option key={c} value={c} className="bg-ink-900">{c}</option>)}
            </select>
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="field" />
            <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field sm:col-span-2" rows={2} />
            <label className="flex items-center gap-2 text-sm text-cream/70"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on home page orbit</label>
            <MagneticButton type="submit" className="sm:justify-self-end">Save dish</MagneticButton>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-white/[0.03] text-left text-xs tracking-wider text-cream/50 uppercase">
            <tr><th className="p-4">Dish</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Available</th><th className="p-4">Featured</th><th className="p-4" /></tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id} className="border-t border-white/5">
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4 capitalize text-cream/60">{m.category}</td>
                <td className="p-4">{money(m.price)}</td>
                <td className="p-4"><input type="checkbox" checked={m.available} onChange={(e) => update(m._id, { available: e.target.checked })} className="accent-amber-500" /></td>
                <td className="p-4"><input type="checkbox" checked={m.featured} onChange={(e) => update(m._id, { featured: e.target.checked })} className="accent-amber-500" /></td>
                <td className="p-4 text-right"><button onClick={() => remove(m._id)} className="text-cream/40 hover:text-red-400" aria-label={`Delete ${m.name}`}><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
];

export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ stats: null, orders: [], reservations: [], menu: [] });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [stats, orders, reservations, menu] = await Promise.all([
        api('/stats', { token }), api('/orders', { token }), api('/reservations', { token }), api('/menu', { token }),
      ]);
      setData({ stats, orders, reservations, menu });
    } catch (err) {
      if (err.status === 401) logout();
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, logout, toast]);

  useEffect(() => { load(); }, [load]);

  // Live kitchen feed: new orders and status changes arrive instantly (Server-Sent Events).
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!token) return;
    const es = new EventSource(`${API_BASE}/orders/stream?token=${encodeURIComponent(token)}`);
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);
    es.addEventListener('order', (e) => {
      const { type, order } = JSON.parse(e.data);
      if (type === 'created') {
        toast(`New order #${order._id.slice(-6).toUpperCase()} · ${order.customer.name} · ${money(order.total)}`, 'info');
      }
      load();
    });
    return () => es.close();
  }, [token, load, toast]);

  const login = (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  };

  const setStatus = (kind) => async (id, status) => {
    try {
      await api(`/${kind}/${id}/status`, { method: 'PATCH', body: { status }, token });
      toast(`Status updated to ${status}`);
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  if (!token) return <Login onLogin={login} />;

  return (
    <div className="container-x pt-32 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Ember HQ</span>
          <h1 className="mt-3 flex items-center gap-4 font-display text-5xl font-light sm:text-6xl">
            Dashboard
            <span className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-xs', live ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-cream/40')}>
              <Radio className={cn('size-3.5', live && 'animate-pulse')} /> {live ? 'Live' : 'Offline'}
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="grid size-11 place-items-center rounded-full border border-white/10 hover:border-ember-400" aria-label="Refresh">
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </button>
          <button onClick={logout} className="flex items-center gap-2 rounded-full border border-white/10 px-4 text-sm hover:border-red-400 hover:text-red-300">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-10 flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/[0.02] p-1.5 sm:w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn('relative isolate flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors', tab === id ? 'text-ink-950' : 'text-cream/60 hover:text-cream')}>
            {tab === id && <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-full bg-ember-400" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="mt-8">
          {tab === 'overview' && <Overview stats={data.stats} />}
          {tab === 'orders' && <Orders orders={data.orders} onStatus={setStatus('orders')} />}
          {tab === 'reservations' && <ReservationsList reservations={data.reservations} onStatus={setStatus('reservations')} />}
          {tab === 'menu' && <MenuManager items={data.menu} token={token} reload={load} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
