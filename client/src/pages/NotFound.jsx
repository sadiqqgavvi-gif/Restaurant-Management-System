import SplitReveal from '../components/ui/SplitReveal';
import MagneticButton from '../components/ui/MagneticButton';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-screen flex-col items-center justify-center text-center">
      <SplitReveal as="h1" scroll={false} text="*404*" className="font-display text-[clamp(6rem,25vw,16rem)] leading-none font-light" />
      <p className="mt-4 text-cream/60">This table doesn’t exist — but plenty of others do.</p>
      <MagneticButton to="/" className="mt-10">Back home</MagneticButton>
    </div>
  );
}
