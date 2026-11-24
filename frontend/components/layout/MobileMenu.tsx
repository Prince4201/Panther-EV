'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDown, User, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { nav } from '@/data/site';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import { cn } from '@/lib/utils';

/** Mobile drawer. White, like the bar it slides out of. */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [vehicles, setVehicles] = useState(false);
  const { account, isStaff, logout } = useAuth();
  const router = useRouter();
  const { products, categories } = useCatalog();
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.28 }}
      role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[55] overflow-y-auto bg-white/98 backdrop-blur-xl text-ink">
      <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
        <Link href="/" onClick={onClose} aria-label="Panther EV home">
          <Image src="/brand/panther-logo.png" alt="Panther" width={391} height={186} className="h-9 w-auto" />
        </Link>
        <button onClick={onClose} aria-label="Close menu" className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-fog active:scale-95">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav aria-label="Mobile" className="px-5 pb-32 pt-4">
        {account && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line/80 bg-fog/80 p-3.5 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panther-red text-white font-bold uppercase shadow-sm">
              {account.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{account.name}</p>
              <p className="truncate text-xs text-steel">{account.email}</p>
            </div>
          </div>
        )}
        {nav.map((n) => n.mega ? (
          <div key={n.label} className="border-b border-line/70">
            <button onClick={() => setVehicles((v) => !v)} aria-expanded={vehicles}
              className="flex w-full items-center justify-between py-4 text-xl font-semibold transition-colors hover:text-panther-red">
              {n.label}<ChevronDown className={cn('h-5 w-5 transition-transform duration-200', vehicles && 'rotate-180 text-panther-red')} aria-hidden />
            </button>
            {vehicles && (
              <div className="pb-5">
                {categories.map((c) => (
                  <div key={c.key} className="mb-4">
                    <Link href={`/vehicles/${c.slug}`} onClick={onClose} className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-panther-red">
                      {c.title} – view all &rarr;
                    </Link>
                    <ul className="grid grid-cols-2 gap-3">
                      {products.filter((p) => p.category === c.key).map((p) => (
                        <li key={p.slug}>
                          <Link href={`/vehicles/${p.slug}`} onClick={onClose} className="block rounded-xl bg-fog p-2.5 transition-transform active:scale-95">
                            <div className="relative aspect-[16/10]"><Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="45vw" className="object-contain" /></div>
                            <p className="mt-1.5 truncate text-xs font-semibold text-ink">{p.name}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link key={n.label} href={n.href} onClick={onClose} aria-current={(n.href === '/' ? pathname === '/' : pathname === n.href) ? 'page' : undefined}
            className={cn('block border-b border-line/70 py-4 text-xl font-semibold transition-colors hover:text-panther-red', (n.href === '/' ? pathname === '/' : pathname === n.href) && 'border-l-4 border-l-panther-red pl-3 text-panther-red font-bold')}>{n.label}</Link>
        ))}
        <div className="mt-8 grid gap-3">
          <Link href="/contact" onClick={onClose} className="rounded-xl bg-panther-red py-4 text-center text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-panther-red/25 active:scale-[0.98] transition-all">
            Enquire now
          </Link>
          {account ? (
            <>
              <Link href={isStaff ? '/admin/dashboard' : '/account'} onClick={onClose} className="rounded-xl border border-ink py-3.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white">
                {isStaff ? 'Admin dashboard' : 'My account'}
              </Link>
              <button onClick={async () => { await logout(); onClose(); router.push('/'); }} className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-panther-red hover:underline">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="rounded-xl border border-ink py-3.5 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white">
                Sign in
              </Link>
              <Link href="/register" onClick={onClose} className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-steel hover:text-ink">
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.div>
  );
}
