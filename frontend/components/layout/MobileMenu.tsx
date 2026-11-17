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
      role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[55] overflow-y-auto bg-white text-ink">
      <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
        <Link href="/" onClick={onClose} aria-label="Panther EV home"><Image src="/brand/panther-logo.png" alt="Panther" width={391} height={186} className="h-9 w-auto" /></Link>
        <button onClick={onClose} aria-label="Close menu" className="-mr-2 p-2.5"><X className="h-7 w-7" /></button>
      </div>
      <nav aria-label="Mobile" className="px-5 pb-32 pt-2">
        {nav.map((n) => n.mega ? (
          <div key={n.label} className="border-b border-line">
            <button onClick={() => setVehicles((v) => !v)} aria-expanded={vehicles} className="flex w-full items-center justify-between py-5 text-2xl font-semibold">
              {n.label}<ChevronDown className={cn('h-6 w-6 transition-transform', vehicles && 'rotate-180')} aria-hidden />
            </button>
            {vehicles && (
              <div className="pb-5">
                {categories.map((c) => (
                  <div key={c.key} className="mb-4">
                    <Link href={`/vehicles/${c.slug}`} onClick={onClose} className="mb-2 block text-sm font-semibold text-panther-red">{c.title} – view all</Link>
                    <ul className="grid grid-cols-2 gap-3">
                      {products.filter((p) => p.category === c.key).map((p) => (
                        <li key={p.slug}>
                          <Link href={`/vehicles/${p.slug}`} onClick={onClose} className="block bg-fog p-2">
                            <div className="relative aspect-[16/10]"><Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="45vw" className="object-contain" /></div>
                            <p className="mt-1 text-sm font-semibold">{p.name}</p>
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
            className={cn('block border-b border-line py-5 text-2xl font-semibold', (n.href === '/' ? pathname === '/' : pathname === n.href) && 'border-l-4 border-l-panther-red pl-3')}>{n.label}</Link>
        ))}
        <div className="mt-8 grid gap-3">
          <Link href="/contact" onClick={onClose} className="bg-panther-red py-4 text-center text-sm font-semibold uppercase tracking-wider text-white">Enquire now</Link>
          {account ? (
            <>
              <p className="flex items-center gap-2 border-t border-line pt-4 text-base font-semibold"><User className="h-5 w-5" aria-hidden />{account.name}</p>
              <Link href={isStaff ? '/admin/dashboard' : '/account'} onClick={onClose} className="border border-ink py-4 text-center text-sm font-semibold uppercase tracking-wider">{isStaff ? 'Admin dashboard' : 'My account'}</Link>
              <button onClick={async () => { await logout(); onClose(); router.push('/'); }} className="py-3 text-center text-sm font-semibold uppercase tracking-wider text-steel">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="border border-ink py-4 text-center text-sm font-semibold uppercase tracking-wider">Sign in</Link>
              <Link href="/register" onClick={onClose} className="py-3 text-center text-sm font-semibold uppercase tracking-wider text-steel">Create account</Link>
            </>
          )}
        </div>
      </nav>
    </motion.div>
  );
}
