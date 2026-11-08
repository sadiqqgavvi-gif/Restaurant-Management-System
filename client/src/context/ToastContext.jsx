import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(() => {});
const ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const Icon = ICONS[type];
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="glass pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink-900/80 px-4 py-3 text-sm shadow-2xl shadow-black/50"
              >
                <Icon className={type === 'error' ? 'size-5 text-red-400' : 'size-5 text-ember-400'} />
                <span>{message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
