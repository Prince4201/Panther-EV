'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, Search, ShoppingCart } from 'lucide-react';
import { AccountMenu } from './AccountMenu';
import { CountrySelector } from './CountrySelector';
import { useCart } from '@/components/cart/CartProvider';
import { SearchOverlay } from './SearchOverlay';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { nav } from '@/data/site';
import { cn } from '@/lib/utils';

/** Always solid white. It sits above the page, never over the hero. */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMega(false); setMobile(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobile || search ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMega(false); setMobile(false); } };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [mobile, search]);

  const active = (href: string) => (href === '/' ? pathname === '/' : href.startsWith('/#') ? false : pathname === href || pathname.startsWith(href + '/'));

  return (
    <>
      <header onMouseLeave={() => setMega(false)}
        className={cn('fixed inset-x-0 top-0 z-50 border-b border-line bg-white text-ink transition-shadow duration-300', scrolled ? 'shadow-[0_6px_20px_-8px_rgba(0,0,0,0.18)]' : 'shadow-none')}>
        {/* Centred container with comfortable side padding: the logo and the user name never touch the browser edge. */}
        <div className="mx-auto flex h-[72px] w-full max-w-[1760px] items-center px-4 sm:px-6 lg:h-[80px] lg:px-10 2xl:px-14">
          <Link href="/" aria-label="Panther EV home" className="flex shrink-0 items-center">
            <Image src="/brand/panther-logo.png" alt="Panther" width={391} height={186} priority className="h-9 w-auto lg:h-11" />
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden min-w-0 flex-1 items-center gap-0 lg:flex xl:ml-6 xl:gap-1 2xl:ml-10 2xl:gap-2 min-[1800px]:ml-12 min-[1800px]:gap-3">
            {nav.map((n) => {
              const on = active(n.href);
              // Ten links now (Our Teams was added): slightly tighter below 1800px so every label stays on one line.
              const base = 'relative whitespace-nowrap px-1 py-2 text-[13px] font-medium tracking-tight transition-colors duration-200 hover:text-panther-red xl:px-2 xl:text-[14.5px] 2xl:px-3 2xl:text-[16px] min-[1800px]:px-4 min-[1800px]:text-[16.5px]';
              const bar = <span aria-hidden className={cn('absolute inset-x-1 -bottom-[26px] h-[3px] origin-left bg-panther-red transition-transform duration-300 xl:inset-x-2 2xl:inset-x-3 min-[1800px]:inset-x-4', on ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />;
              return n.mega ? (
                <button key={n.label} aria-expanded={mega} aria-controls="mega-vehicles" onMouseEnter={() => setMega(true)} onFocus={() => setMega(true)} onClick={() => setMega((m) => !m)}
                  className={cn(base, 'group flex items-center gap-1', (mega || on) && 'text-panther-red')}>
                  {n.label}<ChevronDown className={cn('h-4 w-4 transition-transform', mega && 'rotate-180')} aria-hidden />{bar}
                </button>
              ) : (
                <Link key={n.label} href={n.href} onMouseEnter={() => setMega(false)} aria-current={on ? 'page' : undefined} className={cn(base, 'group', on && 'text-panther-red')}>{n.label}{bar}</Link>
              );
            })}
          </nav>

          {/* Desktop: search, cart, country (flag + arrow), user icon + name. */}
          <div className="ml-auto hidden items-center gap-0.5 lg:flex">
            <button onClick={() => setSearch(true)} aria-label="Search" className="p-2.5 transition-colors hover:text-panther-red"><Search className="h-5 w-5" aria-hidden /></button>
            <CartButton count={cart.items.length} onClick={() => cart.setOpen(true)} />
            <CountrySelector flagOnly />
            {/* Below xl there is no room for the name next to ten links: icon only. */}
            <span className="hidden xl:block"><AccountMenu /></span>
            <span className="xl:hidden"><AccountMenu iconOnly /></span>
          </div>

          {/* Mobile / tablet: logo stays, icons stay, main links go in the hamburger. */}
          <div className="ml-auto flex items-center lg:hidden">
            <button onClick={() => setSearch(true)} aria-label="Search" className="p-2.5"><Search className="h-6 w-6" /></button>
            <CartButton count={cart.items.length} onClick={() => cart.setOpen(true)} iconOnly />
            <AccountMenu iconOnly />
            <button onClick={() => setMobile(true)} aria-label="Open menu" className="p-2.5"><Menu className="h-7 w-7" /></button>
          </div>
        </div>
        <AnimatePresence>{mega && <MegaMenu onNavigate={() => setMega(false)} />}</AnimatePresence>
      </header>

      <AnimatePresence>{mobile && <MobileMenu onClose={() => setMobile(false)} />}</AnimatePresence>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

function CartButton({ count, onClick, iconOnly }: { count: number; onClick: () => void; iconOnly?: boolean }) {
  return (
    <button onClick={onClick} aria-label={`Enquiry cart, ${count} ${count === 1 ? 'vehicle' : 'vehicles'}`}
      className={cn('relative transition-colors hover:text-panther-red', iconOnly ? 'p-2.5' : 'p-2.5')}>
      <ShoppingCart className={iconOnly ? 'h-6 w-6' : 'h-5 w-5'} aria-hidden />
      {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-panther-red px-1 text-[11px] font-bold leading-none text-white">{count}</span>}
    </button>
  );
}
