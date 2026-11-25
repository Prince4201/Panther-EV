import Link from 'next/link';
import { ArrowRight, Headphones, MapPin, Phone } from 'lucide-react';

const links = [
  { label: 'Find a dealer', href: '/dealers', icon: MapPin },
  { label: 'Enquire now', href: '/contact', icon: Phone },
  { label: 'Book a service', href: '/services/book', icon: Headphones },
];

/** Slim black strip under the hero with angled right edge. */
export function HelpStrip() {
  return (
    <div className="bg-white">
      <div className="mx-auto flex h-16 max-w-page items-stretch">
        <div className="flex w-full items-center gap-6 bg-ink px-5 text-white [clip-path:polygon(0_0,100%_0,calc(100%-28px)_100%,0_100%)] md:w-auto md:min-w-[560px] md:gap-10 md:px-10 md:pr-24">
          <p className="shrink-0 text-lg font-semibold md:text-xl">How can we help?</p>
          <ul className="no-scrollbar flex gap-5 overflow-x-auto text-sm font-semibold uppercase tracking-wider text-white/80">
            {links.map((l) => (
              <li key={l.href} className="shrink-0">
                <Link href={l.href} className="group inline-flex items-center gap-1.5 transition-colors hover:text-panther-amber">
                  <l.icon className="h-3.5 w-3.5 hidden sm:block opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden />
                  {l.label}
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
