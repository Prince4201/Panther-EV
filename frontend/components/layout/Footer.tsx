import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PARTNER_PREVIEW } from '@/types/finance';
import { Logo } from '@/components/ui/Logo';
import { CountrySelector } from '@/components/layout/CountrySelector';
import { site } from '@/data/site';
import { activeCategories, getCatalog } from '@/lib/catalog';
import { SocialIcons } from '@/components/ui/SocialIcons';
import { PartnerLogoCard } from '@/components/partners/PartnerLogoCard';
import { getFinancePartners, withLogo } from '@/lib/finance';

const staticColumns = [
  { title: 'Company', links: [
    { label: 'Company', href: '/company' }, { label: 'Finance', href: '/finance' }, { label: 'Our Teams', href: '/our-teams' }, { label: 'Our journey', href: '/company#journey' }, { label: 'Why Panther', href: '/#why-panther' }, { label: 'Technology', href: '/#technology' },
    { label: 'News', href: '/news' }, { label: 'Contact', href: '/contact' } ] },
  { title: 'Services', links: [
    { label: 'Book service', href: '/services/book' }, { label: 'Warranty', href: '/services#warranty' }, { label: 'Service centres', href: '/services#centres' },
    { label: 'Spare parts', href: '/services#parts' }, { label: 'Support', href: '/contact' } ] },
  { title: 'Dealers', links: [{ label: 'Find a dealer', href: '/dealers' }, { label: 'Become a dealer', href: '/dealership' }] },
  { title: 'Legal', links: [{ label: 'Privacy policy', href: '/privacy-policy' }, { label: 'Terms & conditions', href: '/terms' }, { label: 'Cookie policy', href: '/cookie-policy' }] },
];

export async function Footer() {
  const [allPartners, catalog] = await Promise.all([getFinancePartners(), getCatalog()]);
  const partners = withLogo(allPartners);
  // The Vehicles column follows Admin > Vehicles: active categories first, then every vehicle.
  const columns = [
    { title: 'Vehicles', links: [...activeCategories(catalog).map((c) => ({ label: c.title, href: `/vehicles/${c.slug}` })), { label: 'Compare', href: '/compare' }, ...catalog.products.map((p) => ({ label: p.name, href: `/vehicles/${p.slug}` }))] },
    ...staticColumns,
  ];
  return (
    <footer className="bg-ink pb-28 text-white lg:pb-0">
      <div className="mx-auto max-w-page px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_3fr]">
          <div>
            <Logo onDark className="origin-left scale-110" />
            <p className="mt-8 font-display text-4xl leading-[0.95] md:text-5xl">Built for power.<br />Built for business.</p>
            <address className="mt-8 space-y-1 text-sm not-italic text-white/70">
              {site.address.map((l) => <p key={l}>{l}</p>)}
              <p className="pt-3"><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></p>
              <p><a href={site.phoneHref} className="hover:text-white">{site.phone}</a> (toll free)</p>
            </address>
            <div className="mt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-panther-amber">Follow Panther</p>
              <SocialIcons items={site.social} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 xl:grid-cols-5">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-panther-amber">{c.title}</p>
                <ul className="space-y-2.5 text-sm text-white/75">
                  {c.links.map((l) => <li key={l.href + l.label}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {partners.length > 0 && (
          <div className="mt-14 border-t border-white/15 pt-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-panther-amber">Finance partners</p>
            {/* Mobile: 2 columns. Tablet: 3. Desktop: one compact row. */}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-4">
              {partners.slice(0, PARTNER_PREVIEW).map((p) => <li key={p._id} className="lg:w-44"><PartnerLogoCard partner={p} size="sm" onDark /></li>)}
              {/* Up to six logos here; the Finance page lists every company. */}
              <li className="col-span-2 flex items-center sm:col-span-3 lg:pl-2">
                <Link href="/finance" className="group inline-flex items-center gap-2 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 transition-colors hover:text-white">View all<ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden /></Link>
              </li>
            </ul>
          </div>
        )}
        {/* Copyright (left), design credit (middle), country (right). The right cell leaves room for the Quick Enquiry button. */}
        <div className={`${partners.length > 0 ? 'mt-10' : 'mt-16'} grid items-center gap-5 border-t border-white/15 pt-8 text-sm text-white/60 md:grid-cols-3`}>
          <p>© {new Date().getFullYear()} Panther Electric Vehicles. All rights reserved.</p>
          {/* Only the two names are links. */}
          <p className="text-xs text-white/45 md:text-center">
            Designed by <a href="https://www.linkedin.com/in/ritesh-kumar-ghosh/" target="_blank" rel="noopener noreferrer" className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline">Ritesh</a> and <a href="https://subhasiniportfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline">Subhasini</a>
          </p>
          <div className="md:justify-self-end lg:pr-56 min-[1900px]:pr-0"><CountrySelector align="left" up className="-ml-2.5 text-white/80 [&_button]:text-sm" /></div>
        </div>
      </div>
    </footer>
  );
}
