import type { ReactNode } from 'react';

export const inputCls = 'w-full border border-line bg-white px-4 py-3 focus:border-ink focus:outline-none disabled:bg-fog disabled:text-steel';
export const btnPrimary = 'bg-panther-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-ink disabled:opacity-60';
export const btnGhost = 'border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-ink hover:text-white disabled:opacity-60';

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-steel">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-panther-red">{error}</p>}
    </div>
  );
}

export function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <p role={ok ? 'status' : 'alert'} className={`px-4 py-3 text-sm ${ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-panther-red'}`}>{children}</p>;
}
