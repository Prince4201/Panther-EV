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
    <motion.div id="mega-vehicles" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
      className="absolute inset-x-0 top-full hidden border-t border-line/80 bg-white/98 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:block">
      <div className="mx-auto grid max-w-page grid-cols-[260px_1fr] gap-12 px-10 py-10">
        <div>
          <p className="font-display text-5xl leading-none">Vehicles</p>
          <div role="tablist" aria-label="Vehicle category" className="mt-6 border-t border-line/70">
            {categories.map((c) => (
              <button key={c.key} role="tab" aria-selected={active === c.key} onMouseEnter={() => setActive(c.key)} onFocus={() => setActive(c.key)} onClick={() => setActive(c.key)}
                className={cn('flex w-full items-center justify-between border-b border-line/70 py-3.5 text-left text-[16.5px] font-semibold transition-colors', active === c.key ? 'text-panther-red' : 'text-ink/80 hover:text-panther-red')}>
                {c.title}<span aria-hidden className={cn('h-0.5 w-6 rounded-full bg-panther-red transition-all duration-300', active === c.key ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
              </button>
            ))}
          </div>
          <Link href={cat ? `/vehicles/${cat.slug}` : '/vehicles'} onClick={onNavigate} className="mt-6 inline-flex items-center gap-1.5 border-b-2 border-panther-red pb-1 text-xs font-semibold uppercase tracking-wider text-ink transition-colors hover:text-panther-red">
            View all {cat ? cat.title.toLowerCase() : 'vehicles'}
          </Link>
          <Link href="/compare" onClick={onNavigate} className="mt-3 block text-xs font-semibold uppercase tracking-wider text-steel transition-colors hover:text-panther-red">
            Compare models
          </Link>
        </div>
        <ul role="tabpanel" aria-label={cat?.title ?? 'Vehicles'} className="grid grid-cols-3 gap-6 xl:grid-cols-4">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/vehicles/${p.slug}`} onClick={onNavigate} className="group block rounded-xl p-2 transition-all duration-200 hover:bg-fog/60 hover:shadow-sm">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-fog/80 transition-colors group-hover:bg-fog">
                  <Image src={p.image} unoptimized={isExternalImage(p.image)} alt="" fill sizes="220px" className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <p className="mt-2.5 font-semibold text-ink group-hover:text-panther-red transition-colors">{p.name}</p>
                <p className="text-xs text-steel">{p.tag}</p>
                <span className="mt-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-panther-red group-hover:underline">
                  View details &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
