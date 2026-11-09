import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { cn } from '../../lib/utils';

const WIDTHS = [320, 480, 640, 960, 1280];

/**
 * Unsplash's image CDN can resize and re-encode on the fly. Ask for AVIF/WebP at the
 * size actually displayed instead of one large JPEG (~200 KB → ~40–80 KB per photo).
 */
function responsive(src) {
  if (!src || !src.includes('images.unsplash.com')) return { src };
  const base = src.split('?')[0];
  const url = (w) => `${base}?auto=format&fit=crop&q=70&w=${w}`;
  return { src: url(800), srcSet: WIDTHS.map((w) => `${url(w)} ${w}w`).join(', ') };
}

/**
 * Image with a rich gradient placeholder that stays if the photo fails to load.
 * `sizes` tells the browser how wide the image is on screen so it downloads the right file.
 */
export default function DishImage({ src, alt, accent = '#f59e0b', className, imgClassName, sizes = '(max-width: 768px) 100vw, 50vw', priority = false }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  const img = responsive(src);
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
          src={img.src}
          srcSet={img.srcSet}
          sizes={img.srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={cn(
            // absolute: a late-loading photo must never change the layout (it would
            // shift every scroll animation below it)
            'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700',
            state === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
        />
      )}
    </div>
  );
}
