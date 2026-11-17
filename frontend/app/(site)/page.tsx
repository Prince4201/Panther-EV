import { HeroSlider } from '@/components/home/HeroSlider';
import { HelpStrip } from '@/components/home/HelpStrip';
import { VehicleShowcase } from '@/components/home/VehicleShowcase';
import { WhyPanther } from '@/components/home/WhyPanther';
import { Technology } from '@/components/home/Technology';
import { Business } from '@/components/home/Business';
import { FindYourPanther } from '@/components/home/FindYourPanther';
import { DealerCTA } from '@/components/home/DealerCTA';
import { JourneyTimeline } from '@/components/home/JourneyTimeline';
import { LatestFromPanther } from '@/components/home/LatestFromPanther';
import { ContactCTA } from '@/components/home/ContactCTA';
import { getHero } from '@/lib/hero';
import { getFinancePartners } from '@/lib/finance';
import { site } from '@/data/site';

export default async function Home() {
  const [hero, partners] = await Promise.all([getHero(), getFinancePartners()]);
  const org = { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url, logo: `${site.url}/brand/panther-logo.png`, email: site.email, telephone: site.phone, sameAs: site.social.map((x) => x.href) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <h1 className="sr-only">Panther EV – electric rickshaws built for power and business</h1>
      <HeroSlider slides={hero.slides} settings={hero.settings} />
      <HelpStrip />
      <VehicleShowcase />
      <WhyPanther />
      <Technology />
      <Business />
      <FindYourPanther />
      <DealerCTA />
      <JourneyTimeline />
      <LatestFromPanther partners={partners} />
      <ContactCTA />
    </>
  );
}
