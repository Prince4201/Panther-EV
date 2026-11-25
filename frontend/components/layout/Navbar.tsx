'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-line/60 bg-white/95 backdrop-blur-md text-ink shadow-[0_4px_30px_-4px_rgba(0,0,0,0.10)]'
            : 'border-b border-line/80 bg-white text-ink shadow-none'
        )}>
        {/* Subtle red accent line at the very top of the navbar */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-panther-red to-transparent opacity-80" />

        {/* Centred container with comfortable side padding: the logo and the user name never touch the browser edge. */}
        <div className="mx-auto flex h-[72px] w-full max-w-[1760px] items-center px-4 sm:px-6 lg:h-[80px] lg:px-8 xl:px-10 2xl:px-14">
          <Link href="/" aria-label="Panther EV home" className="flex shrink-0 items-center transition-all duration-200 hover:opacity-90 active:scale-95">
            <Image src="/brand/panther-logo.png" alt="Panther" width={391} height={186} priority className="h-9 w-auto lg:h-11" />
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden min-w-0 flex-1 items-center gap-0 lg:flex xl:ml-6 xl:gap-0.5 2xl:ml-10 2xl:gap-2 min-[1800px]:ml-12 min-[1800px]:gap-3">
            {nav.map((n) => {
              const on = active(n.href);
              const base = 'relative whitespace-nowrap px-1.5 py-2 text-[13px] font-medium tracking-tight transition-all duration-200 xl:px-2.5 xl:text-[14.5px] 2xl:px-3 2xl:text-[15.5px] min-[1800px]:px-4 min-[1800px]:text-[16.5px]';
              /* Animated underline indicator */
              const bar = (
                <motion.span
                  aria-hidden
                  layoutId="nav-indicator"
                  className="absolute -bottom-[22px] lg:-bottom-[26px] left-1/2 -translate-x-1/2 h-[2.5px] rounded-full bg-panther-red shadow-[0_1px_6px_rgba(228,32,43,0.5)]"
                  style={{ width: on ? 20 : 0, opacity: on ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              );
              /* Hover glow behind nav item */
              const hoverBg = (
                <span aria-hidden className="absolute inset-x-0 inset-y-0 -mx-1 rounded-lg bg-panther-red/0 transition-all duration-300 group-hover:bg-panther-red/[0.06]" />
              );
              return n.mega ? (
                <button key={n.label} aria-expanded={mega} aria-controls="mega-vehicles" onMouseEnter={() => setMega(true)} onFocus={() => setMega(true)} onClick={() => setMega((m) => !m)}
                  className={cn(base, 'group flex items-center gap-1', (mega || on) ? 'text-panther-red font-semibold' : 'text-ink/90 hover:text-panther-red')}>
                  {hoverBg}
                  <span className="relative">{n.label}</span>
                  <ChevronDown className={cn('relative h-3.5 w-3.5 transition-transform duration-200', mega && 'rotate-180')} aria-hidden />
                  {on && bar}
                </button>
              ) : (
                <Link key={n.label} href={n.href} onMouseEnter={() => setMega(false)} aria-current={on ? 'page' : undefined}
                  className={cn(base, 'group', on ? 'text-panther-red font-semibold' : 'text-ink/90 hover:text-panther-red')}>
                  {hoverBg}
                  <span className="relative">{n.label}</span>
                  {on && bar}
                </Link>
              );
            })}
          </nav>

          {/* Desktop: search, cart, country (flag + arrow), user icon + name. */}
          <div className="ml-auto hidden items-center gap-1 xl:gap-2 lg:flex">
            <button onClick={() => setSearch(true)} aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/80 transition-all duration-200 hover:bg-panther-red/[0.08] hover:text-panther-red active:scale-95">
              <Search className="h-[18px] w-[18px]" aria-hidden />
            </button>
            <CartButton count={cart.items.length} onClick={() => cart.setOpen(true)} />
            <CountrySelector flagOnly />
            {/* Below xl there is no room for the name next to ten links: icon only. */}
            <span className="hidden xl:block"><AccountMenu /></span>
            <span className="xl:hidden"><AccountMenu iconOnly /></span>
          </div>

          {/* Mobile / tablet: logo stays, icons stay, main links go in the hamburger. */}
          <div className="ml-auto flex items-center gap-0.5 lg:hidden">
            <button onClick={() => setSearch(true)} aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/80 transition-all hover:bg-panther-red/[0.08] hover:text-panther-red active:scale-95">
              <Search className="h-5 w-5" />
            </button>
            <CartButton count={cart.items.length} onClick={() => cart.setOpen(true)} iconOnly />
            <AccountMenu iconOnly />
            <button onClick={() => setMobile(true)} aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink/80 transition-all hover:bg-panther-red/[0.08] hover:text-panther-red active:scale-95">
              <Menu className="h-6 w-6" />
            </button>
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
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink/80 transition-all duration-200 hover:bg-panther-red/[0.08] hover:text-panther-red active:scale-95">
      <ShoppingCart className={iconOnly ? 'h-5 w-5' : 'h-[18px] w-[18px]'} aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-panther-red px-1 text-[10px] font-bold leading-none text-white shadow-sm shadow-panther-red/50 animate-in zoom-in duration-200">
          {count}
        </span>
      )}
    </button>
  );
}
