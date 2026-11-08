import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));
export const money = (n) => `$${Number(n || 0).toFixed(2)}`;
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
