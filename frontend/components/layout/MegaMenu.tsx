'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import { cn } from '@/lib/utils';

/** Pick a category on the left; only that category's models show on the right. */
export function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const { products, categories } = useCatalog();
  const [picked, setActive] = useState<string | null>(null);
  // Categories come from Admin > Vehicles; the first one is open by default.
  const cat = categories.find((c) => c.key === picked) ?? categories[0];
  const active = cat?.key;
  const items = products.filter((p) => p.category === active);

  return (
    <motion.div id="mega-vehicles" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
      className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_18px_30px_-12px_rgba(0,0,0,0.18)] lg:block">
      <div className="mx-auto grid max-w-page grid-cols-[260px_1fr] gap-12 px-10 py-10">
        <div>
          <p className="font-display text-5xl leading-none">Vehicles</p>
          <div role="tablist" aria-label="Vehicle category" className="mt-6 border-t border-line">
            {categories.map((c) => (
              <button key={c.key} role="tab" aria-selected={active === c.key} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} onClick={() => setActive(c.key)}
                className={cn('flex w-full items-center justify-between border-b border-line py-3.5 text-left text-[17px] font-semibold transition-colors', active === c.key ? 'text-panther-red' : 'hover:text-panther-red')}>
                {c.title}<span aria-hidden className={cn('h-0.5 w-6 bg-panther-red transition-opacity', active === c.key ? 'opacity-100' : 'opacity-0')} />
              </button>
            ))}
          </div>
          <Link href={cat ? `/vehicles/${cat.slug}` : '/vehicles'} onClick={onNavigate} className="mt-6 inline-block border-b-2 border-panther-red pb-1 text-sm font-semibold uppercase tracking-wider">View all {cat ? cat.title.toLowerCase() : 'vehicles'}</Link>
          <Link href="/compare" onClick={onNavigate} className="mt-3 block text-sm font-semibold uppercase tracking-wider text-steel hover:text-panther-red">Compare models</Link>
        </div>
        <ul role="tabpanel" aria-label={cat?.title ?? 'Vehicles'} className="grid grid-cols-3 gap-6 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/vehicles/${p.slug}`} onClick={onNavigate} className="group block">
                <div className="relative aspect-[16/10] bg-fog"><Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="220px" className="object-contain p-2 transition-transform duration-300 group-hover:scale-105" /></div>
                <p className="mt-2 font-semibold group-hover:text-panther-red">{p.name}</p>
                <p className="text-xs text-steel">{p.tag}</p>
                <span className="mt-1 inline-block text-xs font-semibold uppercase tracking-wider text-panther-red">View details</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
