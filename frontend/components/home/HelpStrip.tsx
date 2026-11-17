import Link from 'next/link';

const links = [
  { label: 'Find a dealer', href: '/dealers' },
  { label: 'Enquire now', href: '/contact' },
  { label: 'Book a service', href: '/services/book' },
];

/** Slim black strip under the hero. The right edge is angled, echoing the forward-leaning P mark. */
export function HelpStrip() {
  return (
    <div className="bg-white">
      <div className="mx-auto flex h-16 max-w-page items-stretch">
        <div className="flex w-full items-center gap-6 bg-ink px-5 text-white [clip-path:polygon(0_0,100%_0,calc(100%-28px)_100%,0_100%)] md:w-auto md:min-w-[560px] md:gap-10 md:px-10 md:pr-24">
          <p className="shrink-0 text-lg font-semibold md:text-xl">How can we help?</p>
          <ul className="no-scrollbar flex gap-5 overflow-x-auto text-sm font-semibold uppercase tracking-wider text-white/80">
            {links.map((l) => <li key={l.href} className="shrink-0"><Link href={l.href} className="hover:text-panther-amber">{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
