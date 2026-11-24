'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { countries, defaultCountry } from '@/data/countries';
import { Flag } from '@/components/ui/Flag';
import { useDismiss } from '@/lib/useDismiss';
import { cn } from '@/lib/utils';

const KEY = 'panther-country';

export function CountrySelector({ className, align = 'right', up = false, flagOnly = false }: { className?: string; align?: 'left' | 'right'; up?: boolean; flagOnly?: boolean }) {
  const [code, setCode] = useState(defaultCountry.code);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  useEffect(() => {
    try { const saved = localStorage.getItem(KEY); if (saved && countries.some((c) => c.code === saved)) setCode(saved); } catch { /* storage blocked */ }
  }, []);

  const current = countries.find((c) => c.code === code) ?? defaultCountry;
  const pick = (c: string) => {
    setCode(c); setOpen(false);
    try { localStorage.setItem(KEY, c); } catch { /* storage blocked */ }
    window.dispatchEvent(new CustomEvent('panther:country', { detail: c }));
  };

  return (
    <div ref={box} className={cn('relative', className)}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={`Country: ${current.name}. Change country`}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink/80 transition-all hover:bg-fog hover:text-ink active:scale-95">
        <Flag code={current.code} className="h-4 w-6 rounded-[2px] shadow-sm" />
        {!flagOnly && <span className="hidden xl:inline">{current.name}</span>}
        <ChevronDown className={cn('h-3.5 w-3.5 text-steel transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ul role="listbox" aria-label="Choose country" className={cn(
          'absolute z-[70] w-56 rounded-2xl border border-line/80 bg-white/98 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] backdrop-blur-xl ring-1 ring-black/5 text-ink animate-in fade-in zoom-in-95 duration-150',
          up ? 'bottom-full mb-2' : 'top-full mt-2',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {countries.map((c) => (
            <li key={c.code} role="option" aria-selected={c.code === code}>
              <button onClick={() => pick(c.code)} className={cn('flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-left text-sm font-medium transition-colors hover:bg-fog', c.code === code && 'bg-fog font-semibold text-panther-red')}>
                <Flag code={c.code} className="h-4 w-6 rounded-[2px] shadow-sm" />
                <span className="flex-1">{c.name}</span>
                {c.code === code && <Check className="h-4 w-4 text-panther-red" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
