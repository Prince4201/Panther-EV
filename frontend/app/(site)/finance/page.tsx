import type { Metadata } from 'next';
import { Globe, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { PartnerLogoCard } from '@/components/partners/PartnerLogoCard';
import { getFinancePartners } from '@/lib/finance';
import { categoryIntro, categoryTitle, type FinanceCategory } from '@/types/finance';

export const metadata: Metadata = { title: 'Finance', description: 'Finance partners and trusted companies of Panther EV.', alternates: { canonical: '/finance' } };

const order: FinanceCategory[] = ['financing', 'partner', 'trusted'];

export default async function FinancePage() {
  const partners = await getFinancePartners();
  // The detail list below is only for companies that publish more than a logo and a website.
  const detailed = partners.filter((p) => p.description || p.contactPhone || p.contactEmail);
  return (
    <>
      <PageHeader title="Finance" intro="Our finance partners and trusted companies. Ask the Panther team or your dealer about vehicle finance options." />
      {partners.length === 0 ? (
        <section className="mx-auto max-w-page px-5 py-14 md:px-10 md:py-20">
          <div className="border border-dashed border-line p-8 md:p-12">
            <p className="font-display text-4xl">Finance partners coming soon</p>
            <p className="mt-2 max-w-lg text-steel">Talk to the Panther team about finance options for your vehicle.</p>
            <div className="mt-6"><Button href="/contact" arrow>Contact Panther</Button></div>
          </div>
        </section>
      ) : (
        <>
          <section aria-labelledby="trusted-partners" className="mx-auto max-w-page px-5 py-14 md:px-10 md:py-20">
            <h2 id="trusted-partners" className="border-b border-ink pb-3 font-display text-4xl md:text-5xl">Trusted Partners</h2>
            <p className="mt-3 max-w-2xl text-steel">Banks and finance companies Panther works with. Select a partner to visit their website.</p>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 xl:grid-cols-5">
              {partners.map((p) => <li key={p._id}><PartnerLogoCard partner={p} size="lg" showName /></li>)}
            </ul>
          </section>

          {detailed.length > 0 && (
            <section className="mx-auto max-w-page px-5 pb-14 md:px-10 md:pb-20">
              {order.map((cat) => {
                const list = detailed.filter((p) => p.category === cat);
                if (!list.length) return null;
                return (
                  <div key={cat} className="mb-16 last:mb-0">
                    <h2 className="border-b border-ink pb-3 font-display text-4xl md:text-5xl">{categoryTitle[cat]}</h2>
                    <p className="mt-3 text-steel">{categoryIntro[cat]}</p>
                    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((p) => (
                        <li key={p._id} className="flex flex-col border border-line bg-white p-6">
                          <h3 className="font-display text-2xl">{p.name}</h3>
                          {p.description && <p className="mt-2 text-sm text-steel">{p.description}</p>}
                          <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
                            {p.website && <li><a href={p.website} rel="external" className="inline-flex items-center gap-2 hover:text-panther-red"><Globe className="h-4 w-4" aria-hidden />Visit website</a></li>}
                            {p.contactPhone && <li><a href={`tel:${p.contactPhone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-2 hover:text-panther-red"><Phone className="h-4 w-4" aria-hidden />{p.contactPhone}</a></li>}
                            {p.contactEmail && <li><a href={`mailto:${p.contactEmail}`} className="inline-flex items-center gap-2 break-all hover:text-panther-red"><Mail className="h-4 w-4 shrink-0" aria-hidden />{p.contactEmail}</a></li>}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          )}

        </>
      )}
    </>
  );
}
