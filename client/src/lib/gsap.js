import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: 'power3.out' });

export { gsap, ScrollTrigger, useGSAP };

// Handy for debugging in the browser console during development.
if (import.meta.env.DEV && typeof window !== 'undefined') window.ScrollTrigger = ScrollTrigger;
