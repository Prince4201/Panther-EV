'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AssemblyVideo } from './AssemblyVideo';
import { SPEC_FALLBACK } from '@/data/products';
import { cn } from '@/lib/utils';

const rows = [
  { name: 'Battery', text: 'High-density Li-Ion technology, introduced in 2022 for longer life cycles.' },
  { name: 'Motor', text: SPEC_FALLBACK },
  { name: 'Controller', text: SPEC_FALLBACK },
  { name: 'Charging', text: SPEC_FALLBACK },
  { name: 'Efficiency', text: 'Optimised for maximum range and profitability.' },
  { name: 'Reliability', text: '10+ years of trusted performance in the toughest Indian environments. Heavy-duty chassis and advanced suspension for any terrain or heavy load.' },
];

export function Technology() {
  const [open, setOpen] = useState(0);
  return (
    <section id="technology" aria-labelledby="tech-title" className="scroll-mt-20 bg-charcoal text-white">
      <div className="mx-auto grid max-w-page lg:grid-cols-2">
        <div className="relative flex items-center bg-ink lg:min-h-[680px]">
          <AssemblyVideo />
          {/* Animated red corner accent */}
          <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 hidden h-1.5 w-28 bg-gradient-to-r from-panther-red to-panther-red/0 lg:block" />
        </div>
        <div className="px-5 py-16 md:px-16 md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-panther-amber md:text-sm">Technology</p>
          <h2 id="tech-title" className="font-display text-6xl leading-[0.9] md:text-8xl">The power within</h2>
          <ul className="mt-10 border-t border-white/15">
            {rows.map((r, n) => (
              <li key={r.name} className="border-b border-white/15 group">
                <button onClick={() => setOpen(open === n ? -1 : n)} aria-expanded={open === n} className="flex w-full items-center justify-between py-5 text-left transition-all">
                  <span className={cn('font-display text-3xl transition-all duration-300 md:text-4xl', open === n ? 'text-panther-amber translate-x-2' : 'text-white group-hover:text-panther-amber/70')}>{r.name}</span>
                  <Plus className={cn('h-6 w-6 transition-all duration-300', open === n && 'rotate-45 text-panther-amber')} aria-hidden />
                </button>
                <div className={cn('grid transition-all duration-300', open === n ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]')}>
                  <p className="overflow-hidden text-white/70">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
