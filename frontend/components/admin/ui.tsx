'use client';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { statusLabel, statusTone } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

export const input = 'w-full border border-line bg-white px-3 py-2.5 text-sm focus:border-ink focus:outline-none disabled:bg-fog';
export const btn = 'inline-flex items-center justify-center gap-2 bg-panther-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-60';
export const btnDanger = 'inline-flex items-center justify-center gap-2 bg-panther-red px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60';
export const btnLine = 'inline-flex items-center justify-center gap-2 border border-ink px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-ink hover:text-white disabled:opacity-60';

export const PageTitle = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="font-display text-4xl leading-none md:text-5xl">{title}</h1>{sub && <p className="mt-2 text-sm text-steel">{sub}</p>}</div>
    {action}
  </div>
);

export const Card = ({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cn('bg-white p-5 md:p-6', className)}>
    {(title || action) && <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-2xl">{title}</h2>{action}</div>}
    {children}
  </section>
);

export const Stat = ({ label, value, href, tone }: { label: string; value: number | string; href?: string; tone?: string }) => {
  const body = (<><p className="text-sm text-steel">{label}</p><p className={cn('mt-1 font-display text-5xl leading-none', tone)}>{value}</p></>);
  return href ? <Link href={href} className="block bg-white p-5 transition-shadow hover:shadow-md">{body}</Link> : <div className="bg-white p-5">{body}</div>;
};

export const StatusBadge = ({ status }: { status: string }) => <span className={cn('inline-block whitespace-nowrap px-2.5 py-1 text-xs font-semibold', statusTone(status))}>{statusLabel(status)}</span>;
export const ActiveBadge = ({ active }: { active: boolean }) => <span className={cn('inline-block px-2.5 py-1 text-xs font-semibold', active ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600')}>{active ? 'Active' : 'Inactive'}</span>;
export const RoleBadge = ({ role }: { role: string }) => <span className={cn('inline-block whitespace-nowrap px-2.5 py-1 text-xs font-semibold', role === 'super_admin' ? 'bg-ink text-white' : 'bg-amber-50 text-amber-900')}>{role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>;

/** Photo if there is one, otherwise the person's initials. */
export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  return (
    <span className={cn('grid shrink-0 place-items-center overflow-hidden rounded-full bg-ink font-semibold text-white', className ?? 'h-10 w-10 text-sm')} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

/** Centered dialog. Closes on Escape or a click outside; the page behind does not scroll while it is open. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/60 sm:place-items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cn('flex max-h-[92vh] w-full flex-col bg-white shadow-2xl', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <h2 className="font-display text-3xl leading-none">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 p-2 text-steel hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-5 md:px-6 md:py-6">{children}</div>
      </div>
    </div>
  );
}

/** Asks before anything destructive. */
export function ConfirmDialog({ title, children, confirmLabel, danger, busy, onConfirm, onCancel }: { title: string; children: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="space-y-2 text-sm text-charcoal">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className={btnLine} onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="button" className={danger ? btnDanger : btn} onClick={onConfirm} disabled={busy}>{busy ? 'Please wait…' : confirmLabel}</button>
      </div>
    </Modal>
  );
}

/** Tables scroll inside their own box so the page never scrolls sideways. */
export const TableWrap = ({ children }: { children: ReactNode }) => <div className="overflow-x-auto bg-white"><table className="w-full min-w-[640px] text-left text-sm">{children}</table></div>;
export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => <th scope="col" className={cn('whitespace-nowrap border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wider text-steel', className)}>{children}</th>;
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn('border-b border-line px-4 py-3 align-top', className)}>{children}</td>;

export const Empty = ({ children }: { children: ReactNode }) => <p className="bg-white p-8 text-center text-steel">{children}</p>;
export const Loading = () => <div className="h-48 animate-pulse bg-white" aria-busy="true" aria-label="Loading" />;
export const ErrorNote = ({ children }: { children: ReactNode }) => <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-panther-red">{children}</p>;
export const OkNote = ({ children }: { children: ReactNode }) => <p role="status" className="bg-green-50 px-4 py-3 text-sm text-green-800">{children}</p>;

export function Pager({ page, total, limit, onPage }: { page: number; total: number; limit: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return <p className="mt-3 text-xs text-steel">{total} result{total === 1 ? '' : 's'}</p>;
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <span className="text-steel">{total} results · page {page} of {pages}</span>
      <div className="flex gap-2">
        <button className={btnLine} disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button className={btnLine} disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

/** Staff need to know why a page is empty: no permission is shown plainly, not as a blank screen. */
export const Forbidden = () => <Empty>You do not have access to this section. Ask the Super Admin if you need it.</Empty>;
