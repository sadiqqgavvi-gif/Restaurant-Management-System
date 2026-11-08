import { useEffect, useState } from 'react';
import { fetchMenu } from '../lib/api';
import Hero from '../sections/Hero';
import MarqueeBand from '../sections/MarqueeBand';
import About from '../sections/About';
import OrbitalMenu from '../sections/OrbitalMenu';
import HorizontalJourney from '../sections/HorizontalJourney';
import StackedExperiences from '../sections/StackedExperiences';
import Chefs from '../sections/Chefs';
import Testimonials from '../sections/Testimonials';
import ReserveCTA from '../sections/ReserveCTA';

export default function Home() {
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchMenu({ featured: 'true' }).then(({ items }) => alive && setFeatured(items));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <Hero />
      <MarqueeBand />
      <About />
      {/* Pinned sections mount together (after data) so ScrollTrigger pins are created in DOM order. */}
      {featured && (
        <>
          <OrbitalMenu dishes={featured} />
          <HorizontalJourney />
          <StackedExperiences />
          <Chefs />
          <Testimonials />
          <ReserveCTA />
        </>
      )}
    </>
  );
}
