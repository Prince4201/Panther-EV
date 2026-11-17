'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { Empty, ErrorNote, Forbidden, Loading, PageTitle, Pager, TableWrap, Td, Th, input } from '@/components/admin/ui';
import { fmtDate } from '@/lib/enquiry';

interface Item { _id: string; action: string; summary: string; createdAt: string; entityType: string; actor?: { name: string; role: string } }

export default function ActivityPage() {
  const { can } = useAdmin();
  const allowed = can('activity.view');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [d, setD] = useState<{ items: Item[]; total: number; limit: number } | null>(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => { const qs = new URLSearchParams({ page: String(page) }); if (type) qs.set('entityType', type); api<{ items: Item[]; total: number; limit: number }>(`/admin/activity?${qs}`).then(setD).catch((e: ApiError) => setErr(e.message)); }, [type, page]);
  useEffect(() => { if (allowed) load(); }, [load, allowed]);

  if (!allowed) return <Forbidden />;
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Reports / Activity" sub="Who did what, and when. Assignments, status changes, progress, vehicles, admins and customers." />
      <label className="mb-4 block max-w-xs"><span className="sr-only">Filter by type</span>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={input}><option value="">Everything</option><option value="enquiry">Enquiries</option><option value="product">Vehicles</option><option value="category">Vehicle categories</option><option value="admin">Team</option><option value="user">Customers</option><option value="finance">Finance partners</option><option value="ourteam">Our Teams</option><option value="settings">Settings</option></select></label>
      {err ? <ErrorNote>{err}</ErrorNote> : !d ? <Loading /> : d.items.length === 0 ? <Empty>No activity recorded yet.</Empty> : (
        <>
          <TableWrap><thead><tr><Th>When</Th><Th>Who</Th><Th>Role</Th><Th>What happened</Th></tr></thead>
            <tbody>{d.items.map((i) => <tr key={i._id}><Td className="whitespace-nowrap text-steel">{fmtDate(i.createdAt, true)}</Td><Td className="whitespace-nowrap">{i.actor?.name ?? 'System'}</Td><Td className="whitespace-nowrap text-steel">{i.actor?.role === 'super_admin' ? 'Super Admin' : i.actor?.role === 'admin' ? 'Admin' : '–'}</Td><Td>{i.summary}</Td></tr>)}</tbody></TableWrap>
          <Pager page={page} total={d.total} limit={d.limit} onPage={setPage} />
        </>
      )}
    </div>
  );
}
