'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Plus } from 'lucide-react';
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
      <Link href={`/vehicles/${p.slug}`} aria-label={`Explore ${p.name}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-fog/80 border border-transparent transition-all duration-300 group-hover:border-line/70 group-hover:shadow-lg group-hover:-translate-y-1">
        {p.tag && <span className="absolute left-4 top-4 z-10 rounded bg-ink px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">{p.tag}</span>}
        <Image src={p.image} unoptimized={isExternalImage(p.image)} alt={p.name} fill sizes="(min-width:1280px) 30vw, (min-width:640px) 46vw, 92vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.05]" />
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-steel">{label(p.category)}</p>
          <h3 className="mt-1 font-display text-4xl leading-none transition-colors group-hover:text-panther-red">{p.name}</h3>
        </div>
        {onCompare && (
          <button onClick={() => onCompare(p.slug)} aria-pressed={!!compared} aria-label={`Compare ${p.name}`}
            className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95', compared ? 'border-panther-red bg-panther-red text-white shadow-sm shadow-panther-red/40' : 'border-line text-steel hover:border-ink hover:text-ink hover:bg-fog')}>
            {compared ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}Compare
          </button>
        )}
      </div>
      <p className="mt-3 flex-1 text-sm text-steel">{p.summary}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line/80 pt-4">
        <Link
          href={`/vehicles/${p.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-panther-red hover:shadow-md hover:shadow-panther-red/25 hover:-translate-y-0.5 active:scale-95"
        >
          View details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={() => (cart.has(p.slug) ? cart.setOpen(true) : cart.add({ slug: p.slug, name: p.name, image: p.image }))}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 active:scale-95',
            cart.has(p.slug)
              ? 'border-emerald-600/40 bg-emerald-50 text-emerald-700 shadow-sm'
              : 'border-panther-red/30 bg-panther-red/[0.06] text-panther-red hover:bg-panther-red hover:text-white hover:shadow-md hover:shadow-panther-red/25'
          )}
        >
          {cart.has(p.slug) ? 'In enquiry cart' : 'Enquire now'}
        </button>
      </div>
    </article>
  );
}
