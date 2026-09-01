import { Nav } from '@/components/navigation/Nav';
import { Hero } from '@/components/hero/Hero';
import { Statement } from '@/components/statement/Statement';
import { Fermentation } from '@/components/fermentation/Fermentation';
import { FlavourWorld } from '@/components/products/FlavourWorld';
import { Quiz } from '@/components/flavour-quiz/Quiz';
import { ProductShowcase } from '@/components/showcase/ProductShowcase';
import { People } from '@/components/people/People';
import { Culture } from '@/components/culture/Culture';
import { Cycle } from '@/components/sustainability/Cycle';
import { FindKumbayah } from '@/components/location/FindKumbayah';
import { Journal } from '@/components/journal/Journal';
import { D2C } from '@/components/commerce/D2C';
import { Outro } from '@/components/outro/Outro';
import { Footer } from '@/components/footer/Footer';

/**
 * The running order. Pacing is the point:
 *
 *   IMPACT      hero
 *   QUIET       three statements, alone on screen
 *   IMMERSION   thirty days of fermentation
 *   PRODUCT     the range, then the quiz, then one bottle in close-up
 *   STORY       the people, the culture, the loop
 *   UTILITY     where to find it, what to read
 *   CONVERSION  packs
 *   QUIET       the closing frame
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Fermentation />
        <FlavourWorld />
        <Quiz />
        <ProductShowcase />
        <People />
        <Culture />
        <Cycle />
        <FindKumbayah />
        <Journal />
        <D2C />
        <Outro />
      </main>
      <Footer />
    </>
  );
}
