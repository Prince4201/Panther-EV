import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PartnerLogoCard } from '@/components/partners/PartnerLogoCard';
import { PARTNER_PREVIEW, type FinancePartner } from '@/types/finance';

// Finance partner logos only, from the same Admin > Finance data as the Finance page and the footer.
// Social media links live in the footer ("Follow Panther") and are deliberately not shown here.
export function LatestFromPanther({ partners = [] }: { partners?: FinancePartner[] }) {
  // Up to six partners here; "View all" opens the Finance page with every company.
  const logos = partners.filter((p) => p.logo).slice(0, PARTNER_PREVIEW);
  if (logos.length === 0) return null;
  return (
    <section aria-labelledby="latest-title" className="bg-fog py-20 md:py-28">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-6">
          <h2 id="latest-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Latest from Panther</h2>
          <Link href="/finance" className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-panther-red hover:text-ink">View all<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden /></Link>
        </div>
        <p className="mt-6 max-w-2xl text-steel">Our finance partners. Select a partner to visit their website.</p>
        <ul className={`mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 ${logos.length > 5 ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
          {logos.map((p) => <li key={p._id}><PartnerLogoCard partner={p} size="md" /></li>)}
        </ul>
      </div>
    </section>
  );
}
