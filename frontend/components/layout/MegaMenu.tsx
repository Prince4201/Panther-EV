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
    <motion.div id="mega-vehicles" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-full z-[60] hidden border-t border-line bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.22)] lg:block">
      <div className="mx-auto grid max-w-page grid-cols-[280px_1fr] gap-12 px-10 py-10">
        <div className="border-r border-line/60 pr-8">
          <p className="font-display text-5xl leading-none text-ink">Vehicles</p>
          <p className="mt-2 text-sm text-steel">Explore the Panther electric fleet</p>
          <div role="tablist" aria-label="Vehicle category" className="mt-6 border-t border-line">
            {categories.map((c) => (
              <button key={c.key} role="tab" aria-selected={active === c.key} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} onClick={() => setActive(c.key)}
                className={cn('flex w-full items-center justify-between border-b border-line/80 py-4 text-left text-[16px] font-semibold transition-colors', active === c.key ? 'text-panther-red' : 'text-ink hover:text-panther-red')}>
                {c.title}
                <span aria-hidden className={cn('h-1 w-6 rounded-full bg-panther-red transition-all duration-300', active === c.key ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
              </button>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <Link href={cat ? `/vehicles/${cat.slug}` : '/vehicles'} onClick={onNavigate} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-panther-red hover:underline">
              View all {cat ? cat.title.toLowerCase() : 'vehicles'} &rarr;
            </Link>
            <Link href="/compare" onClick={onNavigate} className="block text-xs font-semibold uppercase tracking-wider text-steel hover:text-ink transition-colors">
              Compare models
            </Link>
          </div>
        </div>
        <ul role="tabpanel" aria-label={cat?.title ?? 'Vehicles'} className="grid grid-cols-3 gap-6 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/vehicles/${p.slug}`} onClick={onNavigate} className="group block rounded-2xl border border-line/60 bg-fog/40 p-3.5 transition-all duration-300 hover:border-panther-red/40 hover:bg-white hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-fog/80 transition-colors group-hover:bg-fog">
                  <Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="220px" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink group-hover:text-panther-red transition-colors text-[15px]">{p.name}</p>
                  </div>
                  {p.tag && <span className="mt-1 inline-block rounded bg-ink/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-steel">{p.tag}</span>}
                  <span className="mt-2.5 block text-xs font-bold uppercase tracking-wider text-panther-red">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
