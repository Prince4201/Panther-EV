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
        className="flex items-center gap-2 px-2.5 py-2 text-[15px] font-medium hover:text-panther-red">
        <Flag code={current.code} className="h-[18px] w-[27px]" />
        {!flagOnly && <span className="hidden xl:inline">{current.name}</span>}
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ul role="listbox" aria-label="Choose country" className={cn('absolute z-[70] w-56 text-ink', up ? 'bottom-full mb-2' : 'top-full mt-2', ' border border-line bg-white py-1 shadow-xl', align === 'right' ? 'right-0' : 'left-0')}>
          {countries.map((c) => (
            <li key={c.code} role="option" aria-selected={c.code === code}>
              <button onClick={() => pick(c.code)} className={cn('flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-fog', c.code === code && 'font-semibold')}>
                <Flag code={c.code} className="h-[18px] w-[27px]" />
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
