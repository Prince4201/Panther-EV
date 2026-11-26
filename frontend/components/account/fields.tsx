import type { ReactNode } from 'react';

export const inputCls =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink shadow-sm transition-all duration-200 focus:border-panther-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-panther-red/10 disabled:bg-fog disabled:text-steel';
export const btnPrimary =
  'relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-panther-red via-[#E8222E] to-[#B8101C] px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_6px_20px_-2px_rgba(228,32,43,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-2px_rgba(228,32,43,0.6)] active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white active:scale-[0.98] disabled:opacity-60';

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
