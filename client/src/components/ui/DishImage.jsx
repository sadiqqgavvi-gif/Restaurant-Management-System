import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Image with a rich gradient placeholder that stays if the photo fails to load. */
export default function DishImage({ src, alt, accent = '#f59e0b', className, imgClassName }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  return (
    <div
      className={cn('relative overflow-hidden bg-ink-800', className)}
      style={{ backgroundImage: `radial-gradient(circle at 30% 20%, ${accent}55, transparent 60%), radial-gradient(circle at 80% 90%, ${accent}30, transparent 55%)` }}
    >
      {state !== 'loaded' && (
        <div className="absolute inset-0 grid place-items-center">
          <UtensilsCrossed className={cn('size-10 text-white/20', state === 'loading' && 'animate-pulse')} />
        </div>
      )}
      {state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn(
            // absolute: a late-loading photo must never change the layout (it would
            // shift every scroll animation below it)
            'absolute inset-0 h-full w-full object-cover transition-all duration-700',
            state === 'loaded' ? 'scale-100 opacity-100' : 'scale-110 opacity-0',
            imgClassName
          )}
        />
      )}
    </div>
  );
}
