import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/utils';

let lenisInstance = null;
export const getLenis = () => lenisInstance;

/** Buttery smooth scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger stays in sync. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function scrollToTop(immediate = true) {
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate });
  else window.scrollTo(0, 0);
}

export function scrollToEl(target) {
  if (lenisInstance) lenisInstance.scrollTo(target, { offset: -80 });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
