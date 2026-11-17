'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminProvider, makeCtx, type Staff } from '@/components/admin/AdminContext';
import { PantherMark } from '@/components/brand/PantherMark';
import { api } from '@/lib/api';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [admin, setAdmin] = useState<Staff | null>(null);

  // Re-read the account from the server on every page change: a deactivated or removed account is sent to sign-in,
  // and permission changes made by the Super Admin show up in the menu straight away. (The API enforces them regardless.)
  useEffect(() => {
    let live = true;
    api<{ admin: Staff }>('/admin/me').then((r) => { if (live) setAdmin(r.admin); }).catch(() => { if (live) router.replace('/admin/login'); });
    return () => { live = false; };
  }, [router, path]);

  const refresh = useCallback(async () => { const r = await api<{ admin: Staff }>('/admin/me'); setAdmin(r.admin); }, []);
  const ctx = useMemo(() => (admin ? makeCtx(admin, refresh) : null), [admin, refresh]);

  const logout = async () => { await api('/auth/logout', { method: 'POST' }).catch(() => null); router.replace('/admin/login'); };

  if (!admin || !ctx) return <div className="grid min-h-screen place-items-center bg-fog"><PantherMark className="h-14 w-14 animate-pulse" title="Loading" /></div>;
  return (
    <AdminProvider value={ctx}>
      <div className="min-h-screen bg-fog md:flex">
        <Suspense fallback={null}><AdminSidebar onLogout={logout} /></Suspense>
        <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-10">
          {admin.mustChangePassword && (
            <p role="status" className="mb-6 bg-amber-50 px-4 py-3 text-sm text-amber-900">You are using a temporary password. <Link href="/admin/settings" className="font-semibold underline">Change it now</Link>.</p>
          )}
          {children}
        </div>
      </div>
    </AdminProvider>
  );
}
