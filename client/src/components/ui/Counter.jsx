import { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';

/** Number that counts up when scrolled into view. */
export default function Counter({ value, decimals = 0, prefix = '', suffix = '', className, scroll = true }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: scroll ? { trigger: ref.current, start: 'top 90%' } : undefined,
        onUpdate: () => {
          if (ref.current) ref.current.textContent = `${prefix}${obj.v.toFixed(decimals)}${suffix}`;
        },
      });
    },
    { dependencies: [value] }
  );
  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
