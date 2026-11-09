import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '/api';

/** Shows a small pill while the API is unreachable and re-checks every 5s until it comes up. */
export default function ApiStatus() {
  const [status, setStatus] = useState('checking'); // checking | online | offline | recovered

  useEffect(() => {
    let timer;
    let wasOffline = false;
    const check = async () => {
      try {
        const res = await fetch(`${BASE}/health`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        setStatus(wasOffline ? 'recovered' : 'online');
      } catch {
        wasOffline = true;
        setStatus('offline');
        timer = setTimeout(check, 5000);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, []);

  const show = status === 'offline' || status === 'recovered';
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-5 left-5 z-[89] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-full border border-white/10 bg-ink-900/90 py-2 pr-2 pl-4 text-xs shadow-2xl backdrop-blur-xl"
        >
          {status === 'offline' ? (
            <>
              <WifiOff className="size-4 shrink-0 text-amber-400" />
              <span className="text-cream/80">API offline: showing demo menu. Orders and bookings are disabled until the server starts.</span>
            </>
          ) : (
            <>
              <span className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-cream/80">API connected.</span>
              <button onClick={() => window.location.reload()} className="flex items-center gap-1 rounded-full bg-ember-500 px-3 py-1.5 font-semibold text-ink-950">
                <RefreshCw className="size-3" /> Reload
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
