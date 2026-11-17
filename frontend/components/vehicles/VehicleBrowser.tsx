'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import type { ProductCategory } from '@/types/product';
import { VehicleCard } from './VehicleCard';
import { cn } from '@/lib/utils';

/** Category tabs (real links, so each category has its own URL; the list comes from Admin > Vehicles) + product grid + compare bar. */
export function VehicleBrowser({ category }: { category: ProductCategory | 'all' }) {
  const { products, categories } = useCatalog();
  const [picked, setPicked] = useState<string[]>([]);
  const list = products.filter((p) => category === 'all' || p.category === category);
  const toggle = (slug: string) => setPicked((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length < 3 ? [...s, slug] : s));
  const tab = (active: boolean) => cn('-mb-px border-b-2 pb-3 text-sm font-semibold uppercase tracking-wider transition-colors', active ? 'border-panther-red text-ink' : 'border-transparent text-steel hover:text-ink');

  return (
    <section className="mx-auto max-w-page px-5 py-12 md:px-10 md:py-20">
      <nav aria-label="Vehicle category" className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line">
        <Link href="/vehicles" aria-current={category === 'all' ? 'page' : undefined} className={tab(category === 'all')}>All vehicles</Link>
        {categories.map((c) => <Link key={c.slug} href={`/vehicles/${c.slug}`} aria-current={category === c.key ? 'page' : undefined} className={cn(tab(category === c.key), 'whitespace-nowrap')}>{c.title}</Link>)}
      </nav>
      <p className="mt-6 text-sm text-steel" aria-live="polite">{list.length} {list.length === 1 ? 'model' : 'models'}</p>
      <ul className="mt-6 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => <li key={p.slug}><VehicleCard p={p} compared={picked.includes(p.slug)} onCompare={toggle} /></li>)}
      </ul>
      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-30 mx-auto flex max-w-xl items-center justify-between gap-4 bg-ink px-5 py-4 text-white shadow-2xl lg:bottom-6">
          <p className="text-sm">{picked.length} selected <span className="text-white/50">(max 3)</span></p>
          <div className="flex items-center gap-4">
            <button onClick={() => setPicked([])} className="text-sm text-white/60 hover:text-white">Clear</button>
            <Link href={`/compare?v=${picked.join(',')}`} className="bg-panther-red px-4 py-2 text-sm font-semibold uppercase tracking-wider">Compare</Link>
          </div>
        </div>
      )}
    </section>
  );
}
