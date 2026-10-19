import { MegaNav } from '../components/marketing/MegaNav';
import { Hero } from '../components/marketing/Hero';
import { CategoryMarquee } from '../components/marketing/CategoryMarquee';
import { ProblemSolution } from '../components/marketing/ProblemSolution';
import { ProductShowcase } from '../components/marketing/ProductShowcase';
import { HowItWorks } from '../components/marketing/HowItWorks';
import { Templates } from '../components/marketing/Templates';
import { Comparison } from '../components/marketing/Comparison';
import { Testimonials } from '../components/marketing/Testimonials';
import { PricingTeaser } from '../components/marketing/PricingTeaser';
import { Faq } from '../components/marketing/Faq';
import { FinalCta } from '../components/marketing/FinalCta';
import { Footer } from '../components/marketing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <MegaNav />
      <main>
        <Hero />
        <CategoryMarquee />
        <ProblemSolution />
        <ProductShowcase />
        <HowItWorks />
        <Templates />
        <Comparison />
        <Testimonials />
        <PricingTeaser />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
