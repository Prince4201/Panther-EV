'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { cn } from '@/lib/utils';

const pages = [
  { label: 'Compare vehicles', href: '/compare', kind: 'Page', words: 'compare' },
  { label: 'Find a dealer', href: '/dealers', kind: 'Page', words: 'dealer showroom near me city pincode' },
  { label: 'Become a dealer', href: '/dealership', kind: 'Page', words: 'dealership franchise partner apply' },
  { label: 'Book a service', href: '/services/book', kind: 'Service', words: 'service repair maintenance' },
  { label: 'Service & maintenance', href: '/services#maintenance', kind: 'Service', words: 'support' },
  { label: 'Battery support', href: '/services#battery', kind: 'Service', words: 'li-ion lithium charging' },
  { label: 'Warranty', href: '/services#warranty', kind: 'Service', words: 'guarantee' },
  { label: 'Spare parts', href: '/services#parts', kind: 'Service', words: 'parts accessories' },
  { label: 'Technology', href: '/#technology', kind: 'Page', words: 'battery motor controller charging power' },
  { label: 'Why Panther', href: '/#why-panther', kind: 'Page', words: 'reliable low maintenance' },
  { label: 'Company', href: '/company', kind: 'Page', words: 'story journey company 2014' },
  { label: 'Our Teams', href: '/our-teams', kind: 'Page', words: 'team people director management staff' },
  { label: 'News', href: '/news', kind: 'Page', words: 'updates press' },
  { label: 'Contact Panther', href: '/contact', kind: 'Page', words: 'phone email address enquiry' },
];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { products, categories, label } = useCatalog();

  const items = useMemo(() => {
    const all = [
      ...products.map((p) => ({ label: p.name, href: `/vehicles/${p.slug}`, kind: 'Vehicle', words: `${p.tag} ${p.category} ${label(p.category)}` })),
      ...categories.map((c) => ({ label: c.title, href: `/vehicles/${c.slug}`, kind: 'Category', words: `${c.key} ${c.intro}` })),
      ...pages,
    ];
    const s = q.trim().toLowerCase();
    return s ? all.filter((i) => `${i.label} ${i.kind} ${'words' in i ? i.words : ''}`.toLowerCase().includes(s)) : all.slice(0, 8);
  }, [q, products, categories, label]);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { setActive(0); }, [q]);

  const go = (href: string) => { onClose(); router.push(href); };

  return (
    <div role="dialog" aria-modal="true" aria-label="Search Panther" className="fixed inset-0 z-[60] bg-ink/95 px-5 pt-24 md:pt-32"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
        if (e.key === 'Enter' && items[active]) go(items[active].href);
      }}>
      <button onClick={onClose} aria-label="Close search" className="absolute right-5 top-5 p-2 text-white"><X className="h-7 w-7" /></button>
      <div className="mx-auto max-w-3xl">
        <label htmlFor="site-search" className="sr-only">Search vehicles, services and pages</label>
        <div className="flex items-center gap-4 border-b border-white/30 pb-4">
          <Search className="h-6 w-6 text-white/60" aria-hidden />
          <input id="site-search" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vehicles, services, pages"
            className="w-full bg-transparent font-display text-3xl text-white placeholder:text-white/40 focus:outline-none md:text-5xl" />
        </div>
        <ul className="mt-6" role="listbox">
          {items.length === 0 && <li className="py-4 text-white/60">No results for &ldquo;{q}&rdquo;. Try a vehicle name like &ldquo;XL&rdquo;.</li>}
          {items.map((i, idx) => (
            <li key={i.href + i.label} role="option" aria-selected={idx === active}>
              <button onClick={() => go(i.href)} onMouseEnter={() => setActive(idx)}
                className={cn('flex w-full items-center justify-between border-b border-white/10 px-2 py-4 text-left text-lg text-white', idx === active && 'bg-white/10')}>
                <span>{i.label}</span><span className="text-sm text-white/50">{i.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
