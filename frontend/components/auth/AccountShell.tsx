'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

const tabs = [{ label: 'My enquiries', href: '/account' }, { label: 'Profile', href: '/account/profile' }, { label: 'Settings', href: '/account/settings' }];

/** Customer area: signed-out visitors go to sign in; the tabs are My enquiries, Profile, Settings. */
export function AccountShell({ children }: { children: React.ReactNode }) {
  const { account, isStaff, loading, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (!loading && !account) router.replace(`/login?next=${encodeURIComponent(path)}`); }, [loading, account, router, path]);

  if (loading || !account) return <div className="grid min-h-[60svh] place-items-center text-steel">Loading…</div>;
  return (
    <section className="mx-auto max-w-4xl px-5 py-12 md:px-10 md:py-20">
      <h1 className="font-display text-5xl md:text-6xl">Hello, {account.name.split(' ')[0]}</h1>
      <p className="mt-1 break-all text-steel">{account.email}</p>
      {isStaff && <Link href="/admin/dashboard" className="mt-6 inline-block bg-panther-red px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink">Open admin dashboard</Link>}
      <nav aria-label="Account" className="no-scrollbar mt-10 flex gap-6 overflow-x-auto border-b border-line">
        {tabs.map((t) => {
          const on = path === t.href;
          return <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined} className={cn('-mb-px shrink-0 border-b-[3px] pb-3 text-[15px] font-semibold transition-colors', on ? 'border-panther-red text-panther-red' : 'border-transparent hover:text-panther-red')}>{t.label}</Link>;
        })}
      </nav>
      <div className="mt-8">{children}</div>
      <button onClick={async () => { await logout(); router.push('/'); router.refresh(); }} className="mt-12 border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white">Sign out</button>
    </section>
  );
}
