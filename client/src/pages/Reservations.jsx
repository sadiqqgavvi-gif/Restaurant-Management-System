import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Clock, Users, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';
import SuccessCheck from '../components/ui/SuccessCheck';
import TiltCard from '../components/ui/TiltCard';

const TIMES = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
const OCCASIONS = ['none', 'birthday', 'anniversary', 'date night', 'business', 'celebration'];
const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const EMPTY = { name: '', email: '', phone: '', date: todayISO(), time: '19:00', guests: 2, occasion: 'none', notes: '' };

export default function Reservations() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const data = await api('/reservations', { method: 'POST', body: { ...form, guests: Number(form.guests) } });
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.errors ? Object.values(err.errors).join(' · ') : err.message);
      setStatus('idle');
    }
  };

  return (
    <div className="relative overflow-hidden pt-36 pb-28">
      <div className="pointer-events-none absolute top-0 right-0 size-[600px] rounded-full bg-ember-600/15 blur-[140px]" />
      <div className="container-x grid gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="eyebrow"><span className="h-px w-8 bg-ember-400" /> Reservations</span>
          <SplitReveal as="h1" scroll={false} text={'Save your\nseat by the\n*fire*.'} className="mt-4 font-display text-6xl leading-[0.92] font-light sm:text-8xl" />
          <p className="mt-6 max-w-md text-cream/60">Tables are released 60 days ahead. For groups larger than 20 or private dining, mention it in the notes and we’ll reach out.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[[CalendarDays, 'Tue–Sun'], [Clock, '5–11pm'], [Users, '1–20']].map(([Icon, l]) => (
              <div key={l} className="glass rounded-2xl p-4 text-center">
                <Icon className="mx-auto size-5 text-ember-400" />
                <p className="mt-2 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <TiltCard max={4} glare={false} className="rounded-[2.5rem] border border-white/10 bg-ink-800/70 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-10">
          <AnimatePresence mode="wait">
            {status === 'done' ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center">
                <SuccessCheck />
                <h2 className="mt-6 font-display text-4xl">You’re booked!</h2>
                <p className="mt-3 max-w-sm text-cream/60">
                  {result.name}, we’ve held a table for {result.guests} on {new Date(result.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {result.time}. A confirmation is on its way to {result.email}.
                </p>
                <p className="mt-4 text-xs tracking-widest text-cream/40 uppercase">Ref · {result._id.slice(-6)}</p>
                <MagneticButton variant="ghost" className="mt-8" onClick={() => { setForm(EMPTY); setStatus('idle'); }}>Make another booking</MagneticButton>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                <div>
                  <p className="mb-3 text-sm text-cream/60">Party size</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <button type="button" key={n} onClick={() => set('guests')(n)}
                        className={cn('grid size-12 place-items-center rounded-2xl border text-sm transition', Number(form.guests) === n ? 'border-ember-400 bg-ember-400 text-ink-950' : 'border-white/10 hover:border-ember-400/50')}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-sm text-cream/60">Date</span>
                    <input type="date" required min={todayISO()} value={form.date} onChange={set('date')} className="field" />
                  </label>
                  <label className="block"><span className="mb-2 block text-sm text-cream/60">Occasion</span>
                    <select value={form.occasion} onChange={set('occasion')} className="field capitalize">
                      {OCCASIONS.map((o) => <option key={o} value={o} className="bg-ink-900">{o}</option>)}
                    </select>
                  </label>
                </div>
                <div>
                  <p className="mb-3 text-sm text-cream/60">Time</p>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map((t) => (
                      <button type="button" key={t} onClick={() => set('time')(t)}
                        className={cn('rounded-full border px-4 py-2 text-sm transition', form.time === t ? 'border-ember-400 bg-ember-400/15 text-ember-300' : 'border-white/10 text-cream/70 hover:border-white/30')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required placeholder="Full name" value={form.name} onChange={set('name')} className="field" />
                  <input required type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} className="field" />
                </div>
                <input required type="email" placeholder="Email" value={form.email} onChange={set('email')} className="field" />
                <textarea rows={3} placeholder="Allergies, seating preferences, surprises…" value={form.notes} onChange={set('notes')} className="field resize-none" />
                {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
                <MagneticButton type="submit" className="w-full py-4" disabled={status === 'loading'}>
                  <Sparkles className="size-4" /> {status === 'loading' ? 'Reserving…' : 'Confirm reservation'}
                </MagneticButton>
              </motion.form>
            )}
          </AnimatePresence>
        </TiltCard>
      </div>
    </div>
  );
}
