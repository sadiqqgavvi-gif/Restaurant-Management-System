import SplitReveal from './SplitReveal';
import { cn } from '../../lib/utils';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', className }) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <span className="eyebrow">
          <span className="h-px w-8 bg-ember-400" /> {eyebrow}
        </span>
      )}
      <SplitReveal
        text={title}
        className="mt-4 font-display text-4xl leading-[1.02] font-light tracking-tight sm:text-5xl lg:text-6xl"
      />
      {subtitle && <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">{subtitle}</p>}
    </div>
  );
}
