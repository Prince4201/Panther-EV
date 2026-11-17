'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { Empty, ErrorNote, Loading, PageTitle, Pager, StatusBadge, TableWrap, Td, Th, input } from '@/components/admin/ui';
import { SOURCES, STATUSES, fmtDate, sourceLabel, statusLabel, whatsappLabel, whatsappTone } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

interface Row { _id: string; createdAt: string; name: string; phone: string; email?: string; city: string; subject: string; message?: string; vehicleInterest?: string; source: string; whatsappStatus?: string; vehicles: Array<{ name: string }>; status: string; assignedTo?: { _id: string; name: string } | null }
interface Member { id: string; name: string; active: boolean; role: string }

function List() {
  const { isSuper, can } = useAdmin();
  const seesAll = can('enquiries.all');
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [assignee, setAssignee] = useState('');
  const [source, setSource] = useState(params.get('source') ?? '');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ inquiries: Row[]; total: number; limit: number } | null>(null);
  const [team, setTeam] = useState<Member[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => { setQ(params.get('q') ?? ''); setStatus(params.get('status') ?? ''); setSource(params.get('source') ?? ''); setPage(1); }, [params]);
  useEffect(() => { if (isSuper) api<{ admins: Member[] }>('/admin/team').then((r) => setTeam(r.admins.filter((a) => a.active))).catch(() => null); }, [isSuper]);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (q.trim()) qs.set('q', q.trim());
    if (status) qs.set('status', status);
    if (assignee) qs.set('assignee', assignee);
    if (source) qs.set('source', source);
    setErr('');
    api<{ inquiries: Row[]; total: number; limit: number }>(`/admin/inquiries?${qs}`).then(setData).catch((e: ApiError) => setErr(e.message));
  }, [q, status, assignee, source, page]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title={seesAll ? 'Enquiries' : 'Assigned enquiries'} sub={seesAll ? 'From Quick Enquiry, the contact form, the enquiry cart, service bookings and dealership applications.' : can('services.manage') || can('dealership.manage') ? 'Enquiries assigned to you, plus the service bookings / dealership enquiries you were given access to.' : 'Enquiries the Super Admin has assigned to you.'} />
      {/* Quick filters for the lead pipeline. The Status menu below has every status. */}
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Quick filter">
        {[['', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['converted', 'Converted']].map(([v, l]) => (
          <button key={l} type="button" aria-pressed={status === v} onClick={() => { setStatus(v); setPage(1); }}
            className={cn('border px-4 py-2 text-sm font-semibold transition-colors', status === v ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink')}>{l}</button>
        ))}
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="sm:col-span-2"><span className="sr-only">Search enquiries</span><input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, phone, email, city, vehicle, message…" className={input} /></label>
        <label><span className="sr-only">Status</span><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={input}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label>
        <label><span className="sr-only">Source</span><select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className={input}><option value="">All sources</option>{SOURCES.map((s) => <option key={s} value={s}>{sourceLabel(s)}</option>)}</select></label>
        {seesAll && <label><span className="sr-only">Assigned to</span><select value={assignee} onChange={(e) => { setAssignee(e.target.value); setPage(1); }} className={input}><option value="">Anyone</option><option value="unassigned">Unassigned</option>{team.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}
      </div>
      {err ? <ErrorNote>{err}</ErrorNote> : !data ? <Loading /> : data.inquiries.length === 0 ? <Empty>No enquiries match.</Empty> : (
        <>
          <TableWrap>
            <thead><tr><Th>Date</Th><Th>From</Th><Th>Vehicle / about</Th><Th>Source</Th><Th>WhatsApp</Th><Th>Status</Th><Th>Responsible</Th></tr></thead>
            <tbody>{data.inquiries.map((r) => (
              <tr key={r._id} className="hover:bg-fog/60">
                <Td className="whitespace-nowrap text-steel">{fmtDate(r.createdAt)}</Td>
                <Td><Link href={`/admin/enquiries/${r._id}`} className="font-semibold hover:text-panther-red">{r.name}</Link><p className="text-xs text-steel">{r.phone}{r.city ? ` · ${r.city}` : ''}</p>{r.email && <p className="break-all text-xs text-steel">{r.email}</p>}</Td>
                <Td className="max-w-[260px]"><span className="line-clamp-2 font-medium">{r.vehicleInterest || r.vehicles.map((v) => v.name).join(', ') || r.subject || 'General enquiry'}</span>{r.message && <span className="mt-0.5 line-clamp-2 text-xs text-steel">{r.message}</span>}</Td>
                <Td className="whitespace-nowrap">{sourceLabel(r.source)}</Td>
                <Td>{r.source === 'quick-enquiry' ? <span className={cn('inline-block whitespace-nowrap px-2.5 py-1 text-xs font-semibold', whatsappTone(r.whatsappStatus))}>{whatsappLabel(r.whatsappStatus)}</span> : <span className="text-steel">–</span>}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td className="whitespace-nowrap">{r.assignedTo?.name ?? <span className="text-steel">Unassigned</span>}</Td>
              </tr>
            ))}</tbody>
          </TableWrap>
          <Pager page={page} total={data.total} limit={data.limit} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export default function EnquiriesPage() { return <Suspense fallback={<Loading />}><List /></Suspense>; }
