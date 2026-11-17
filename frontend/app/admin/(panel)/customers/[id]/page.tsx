'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ActiveBadge, Card, Empty, ErrorNote, Forbidden, Loading, PageTitle, StatusBadge, TableWrap, Td, Th, btn, btnLine } from '@/components/admin/ui';
import { fmtDate } from '@/lib/enquiry';

interface Cust { _id: string; name: string; email: string; phone: string; avatar?: string; active: boolean; createdAt: string; lastActiveAt?: string; address?: { line1?: string; city?: string; state?: string; pincode?: string; country?: string } }
interface Enq { _id: string; createdAt: string; subject: string; vehicles: Array<{ name: string }>; status: string; assignedTo?: { name: string } | null }

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSuper, can } = useAdmin();
  const [d, setD] = useState<{ customer: Cust; enquiries: Enq[] } | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api<{ customer: Cust; enquiries: Enq[] }>(`/admin/customers/${id}`).then(setD).catch((e: ApiError) => setErr(e.message)), [id]);
  useEffect(() => { if (can('customers.view')) load(); }, [load, can]);

  if (!can('customers.view')) return <Forbidden />;
  if (err) return <ErrorNote>{err}</ErrorNote>;
  if (!d) return <Loading />;
  const c = d.customer; const a = c.address ?? {};
  const toggle = async () => {
    if (!confirm(c.active ? `Deactivate ${c.name}? They will be signed out and cannot sign in.` : `Activate ${c.name}?`)) return;
    setBusy(true);
    try { await api(`/admin/customers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) }); await load(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'Failed.'); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-panther-red"><ArrowLeft className="h-4 w-4" aria-hidden />All customers</Link>
      <PageTitle title={c.name} sub={c.email} action={isSuper ? <button onClick={toggle} disabled={busy} className={c.active ? btnLine : btn}>{c.active ? 'Deactivate account' : 'Activate account'}</button> : <ActiveBadge active={c.active} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card title="Profile">
          <div className="mb-4 grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-line bg-fog">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.avatar ? <img src={c.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-7 w-7 text-steel" aria-hidden />}
          </div>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-steel">Status</dt><dd><ActiveBadge active={c.active} /></dd></div>
            <div><dt className="text-steel">Phone</dt><dd>{c.phone || '–'}</dd></div>
            <div><dt className="text-steel">Address</dt><dd>{[a.line1, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ') || '–'}</dd></div>
            <div><dt className="text-steel">Registered</dt><dd>{fmtDate(c.createdAt, true)}</dd></div>
            <div><dt className="text-steel">Last active</dt><dd>{fmtDate(c.lastActiveAt, true)}</dd></div>
          </dl>
        </Card>
        <div>
          <h2 className="mb-3 font-display text-2xl">Enquiries ({d.enquiries.length})</h2>
          {d.enquiries.length === 0 ? <Empty>No enquiries from this customer.</Empty> : (
            <TableWrap>
              <thead><tr><Th>Received</Th><Th>About</Th><Th>Status</Th><Th>Responsible</Th></tr></thead>
              <tbody>{d.enquiries.map((e) => <tr key={e._id}><Td className="whitespace-nowrap">{fmtDate(e.createdAt)}</Td><Td><Link href={`/admin/enquiries/${e._id}`} className="font-semibold hover:text-panther-red">{e.subject || e.vehicles.map((v) => v.name).join(', ') || 'General enquiry'}</Link></Td><Td><StatusBadge status={e.status} /></Td><Td>{e.assignedTo?.name ?? '–'}</Td></tr>)}</tbody>
            </TableWrap>
          )}
        </div>
      </div>
    </div>
  );
}
