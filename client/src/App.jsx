import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollTrigger } from './lib/gsap';
import { useLenis, scrollToTop } from './hooks/useLenis';
import { useScrollRefresh } from './hooks/useScrollRefresh';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import CustomCursor from './components/layout/CustomCursor';
import Preloader from './components/layout/Preloader';
import ScrollProgress from './components/layout/ScrollProgress';
import ApiStatus from './components/layout/ApiStatus';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reservations from './pages/Reservations';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const EASE = [0.7, 0, 0.2, 1];

/** Each route fades in under a sweeping ember curtain. */
function Page({ children }) {
  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[94] origin-bottom bg-gradient-to-t from-ember-600 to-ember-400"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.7, ease: EASE, delay: 0.05 } }}
        exit={{ scaleY: 0 }}
        style={{ originY: 0 }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-[94] bg-ink-950"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1, transition: { duration: 0.5, ease: EASE } }}
        style={{ originY: 1 }}
      />
      <motion.main initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
        {children}
      </motion.main>
    </>
  );
}

export default function App() {
  useLenis();
  useScrollRefresh();
  const location = useLocation();

  return (
    <>
      <Preloader />
      <CustomCursor />
      <ScrollProgress />
      <div className="grain" aria-hidden />
      <Navbar />
      <CartDrawer />
      <ApiStatus />
      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          scrollToTop();
          requestAnimationFrame(() => ScrollTrigger.refresh());
        }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/menu" element={<Page><Menu /></Page>} />
          <Route path="/reservations" element={<Page><Reservations /></Page>} />
          <Route path="/checkout" element={<Page><Checkout /></Page>} />
          <Route path="/admin" element={<Page><Admin /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
