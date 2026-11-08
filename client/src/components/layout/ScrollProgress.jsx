import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 right-0 left-0 z-[80] h-[2px] origin-left bg-gradient-to-r from-ember-300 via-ember-500 to-ember-700"
    />
  );
}
