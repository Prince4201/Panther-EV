'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Plus } from 'lucide-react';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import type { Product } from '@/types/product';
import { useCart } from '@/components/cart/CartProvider';
import { cn } from '@/lib/utils';

export function VehicleCard({ p, compared, onCompare }: { p: Product; compared?: boolean; onCompare?: (slug: string) => void }) {
  const cart = useCart();
  const { label } = useCatalog();
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/vehicles/${p.slug}`} aria-label={`Explore ${p.name}`} className="relative block aspect-[4/3] overflow-hidden bg-fog">
        {p.tag && <span className="absolute left-4 top-4 z-10 bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">{p.tag}</span>}
        <Image src={p.image} unoptimized={isExternalImage(p.image)} alt={p.name} fill sizes="(min-width:1280px) 30vw, (min-width:640px) 46vw, 92vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.05]" />
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-steel">{label(p.category)}</p>
          <h3 className="mt-1 font-display text-4xl leading-none">{p.name}</h3>
        </div>
        {onCompare && (
          <button onClick={() => onCompare(p.slug)} aria-pressed={!!compared} aria-label={`Compare ${p.name}`}
            className={cn('flex shrink-0 items-center gap-1.5 border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors', compared ? 'border-panther-red bg-panther-red text-white' : 'border-line text-steel hover:border-ink hover:text-ink')}>
            {compared ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}Compare
          </button>
        )}
      </div>
      <p className="mt-3 flex-1 text-sm text-steel">{p.summary}</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-sm font-semibold uppercase tracking-wider">
        <Link href={`/vehicles/${p.slug}`} className="border-b-2 border-ink pb-1 hover:border-panther-red hover:text-panther-red">View details</Link>
        <button onClick={() => (cart.has(p.slug) ? cart.setOpen(true) : cart.add({ slug: p.slug, name: p.name, image: p.image }))} className="border-b-2 border-transparent pb-1 text-panther-red hover:border-panther-red">
          {cart.has(p.slug) ? 'In enquiry cart' : 'Enquire now'}
        </button>
      </div>
    </article>
  );
}
