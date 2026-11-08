import { motion } from 'framer-motion';

/** Animated drawn checkmark used on successful submissions. */
export default function SuccessCheck({ className = 'size-24' }) {
  return (
    <motion.svg viewBox="0 0 100 100" className={className} initial="hidden" animate="visible">
      <motion.circle
        cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="4"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { duration: 0.8 } } }}
      />
      <motion.path
        d="M30 52 L45 66 L71 38" fill="none" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1, transition: { delay: 0.6, duration: 0.5 } } }}
      />
    </motion.svg>
  );
}
