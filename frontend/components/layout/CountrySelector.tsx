'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock } from 'lucide-react';
import { countries, defaultCountry } from '@/data/countries';
import { Flag } from '@/components/ui/Flag';
import { useDismiss } from '@/lib/useDismiss';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

const KEY = 'panther-country';

export function CountrySelector({
  className,
  align = 'right',
  up = false,
  flagOnly = false,
  onDark = false,
}: {
  className?: string;
  align?: 'left' | 'right';
  up?: boolean;
  flagOnly?: boolean;
  onDark?: boolean;
}) {
  const { account } = useAuth();
  const [code, setCode] = useState(defaultCountry.code);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));

  const isLocked = Boolean(account);

  // Sync with account country if logged in, or load from localStorage
  useEffect(() => {
    if (account) {
      const userCountry = account.country || account.address?.country || 'India';
      const matched = countries.find(
        (c) =>
          c.name.toLowerCase() === userCountry.toLowerCase() ||
          c.code.toLowerCase() === userCountry.toLowerCase()
      );
      if (matched) {
        setCode(matched.code);
        try { localStorage.setItem(KEY, matched.code); } catch { /* storage blocked */ }
        return;
      }
    }

    try {
      const saved = localStorage.getItem(KEY);
      if (saved && countries.some((c) => c.code === saved)) setCode(saved);
    } catch { /* storage blocked */ }
  }, [account]);

  const current = countries.find((c) => c.code === code) ?? defaultCountry;

  const pick = (c: string) => {
    if (isLocked) return;
    setCode(c);
    setOpen(false);
    try { localStorage.setItem(KEY, c); } catch { /* storage blocked */ }
    window.dispatchEvent(new CustomEvent('panther:country', { detail: c }));
  };

  return (
    <div ref={box} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !isLocked && setOpen((o) => !o)}
        disabled={isLocked}
        aria-haspopup={isLocked ? undefined : 'listbox'}
        aria-expanded={open}
        aria-disabled={isLocked}
        title={isLocked ? `Country is locked to your registered account (${current.name})` : `Country: ${current.name}. Click to change.`}
        aria-label={isLocked ? `Country: ${current.name} (locked)` : `Country: ${current.name}. Change country`}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
          onDark
            ? 'text-white hover:bg-white/10 active:scale-95'
            : 'text-ink/90 hover:bg-fog hover:text-ink active:scale-95',
          isLocked && 'cursor-default active:scale-100 hover:bg-transparent'
        )}
      >
        <Flag code={current.code} className="h-4 w-6 rounded-[2px] shadow-sm shrink-0" />
        {!flagOnly && (
          <span className={cn('font-medium text-sm', onDark ? 'text-white' : 'text-ink')}>
            {current.name}
          </span>
        )}
        {isLocked ? (
          <Lock
            className={cn('h-3 w-3 shrink-0 opacity-60', onDark ? 'text-white/60' : 'text-steel')}
            aria-hidden
          />
        ) : (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
              onDark ? 'text-white/70' : 'text-steel',
              open && 'rotate-180'
            )}
            aria-hidden
          />
        )}
      </button>

      {open && !isLocked && (
        <ul
          role="listbox"
          aria-label="Choose country"
          className={cn(
            'absolute z-[80] w-56 rounded-2xl border border-line bg-white p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] ring-1 ring-black/5 text-ink animate-in fade-in zoom-in-95 duration-150',
            up ? 'bottom-full mb-2' : 'top-full mt-2',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {countries.map((c) => (
            <li key={c.code} role="option" aria-selected={c.code === code}>
              <button
                type="button"
                onClick={() => pick(c.code)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-left text-sm font-medium transition-colors hover:bg-fog',
                  c.code === code && 'bg-fog font-semibold text-panther-red'
                )}
              >
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
