'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { api } from '@/lib/api';
import { statusLabel } from '@/lib/enquiry';

interface Update { type: string; message: string; toStatus?: string; createdAt: string }
interface Row { _id: string; createdAt: string; status: string; vehicles: Array<{ slug: string; name: string }>; message: string; updates?: Update[] }

/** "My enquiries": status plus any progress the Panther team chose to share with the customer. */
export function AccountView() {
  const { role } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    if (role === 'user') api<{ inquiries: Row[] }>('/auth/my-inquiries').then((r) => setRows(r.inquiries)).catch(() => setRows([]));
    else setRows([]);
  }, [role]);

  if (rows === null) return <p className="text-steel">Loading…</p>;
  if (rows.length === 0) return <p className="text-steel">No enquiries yet. <Link href="/vehicles" className="font-semibold text-panther-red underline">Browse vehicles</Link> and add the ones you like to your enquiry cart.</p>;
  return (
    <ul className="divide-y divide-line">
      {rows.map((r) => (
        <li key={r._id} className="py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{r.vehicles.length ? r.vehicles.map((v) => v.name).join(', ') : 'General enquiry'}</p>
            <span className="bg-fog px-2.5 py-1 text-xs font-semibold">{statusLabel(r.status)}</span>
          </div>
          <p className="mt-1 text-sm text-steel">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          {r.message && <p className="mt-2 text-sm">{r.message}</p>}
          {!!r.updates?.length && (
            <ol className="mt-3 space-y-2 border-l-2 border-line pl-4">
              {r.updates.map((u, i) => (
                <li key={i} className="text-sm"><span className="text-xs text-steel">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>{' '}
                  {u.type === 'status_changed' ? <>Status: <strong>{statusLabel(u.toStatus ?? '')}</strong>{u.message ? ` — ${u.message}` : ''}</> : u.message}</li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ul>
  );
}
