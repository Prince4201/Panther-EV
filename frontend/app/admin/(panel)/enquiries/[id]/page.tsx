'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { Card, ConfirmDialog, ErrorNote, Loading, OkNote, PageTitle, StatusBadge, btn, btnLine, input } from '@/components/admin/ui';
import { STATUSES, fmtDate, sourceLabel, statusLabel, whatsappLabel, whatsappTone } from '@/lib/enquiry';

interface Inq { _id: string; createdAt: string; name: string; email: string; phone: string; city: string; subject: string; message: string; vehicles: Array<{ name: string }>; vehicleInterest?: string; whatsappStatus?: string; source: string; country: string; status: string; assignedTo?: { _id: string; name: string; email: string } | null; assignedAt?: string; user?: string | null }
interface Hist { _id: string; type: string; message: string; fromStatus?: string; toStatus?: string; visibility: string; createdAt: string; actor?: { name: string; role: string }; assignedTo?: { name: string } }
interface Cust { _id: string; name: string; email: string; phone: string; address?: { city?: string; state?: string }; active: boolean }
interface Member { id: string; name: string; active: boolean }

const typeLabel: Record<string, string> = { created: 'Received', assigned: 'Assigned', status_changed: 'Status changed', progress: 'Progress update', note: 'Internal note', report: 'Report to Super Admin' };

export default function EnquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSuper } = useAdmin();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [d, setD] = useState<{ inquiry: Inq; history: Hist[]; customer: Cust | null } | null>(null);
  const [team, setTeam] = useState<Member[]>([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [assignee, setAssignee] = useState('');
  const [note, setNote] = useState({ type: 'progress', message: '', visibility: 'internal' });

  const load = useCallback(() => api<typeof d>(`/admin/inquiries/${id}`).then((r) => { setD(r); setStatus(r!.inquiry.status); setAssignee(r!.inquiry.assignedTo?._id ?? ''); }).catch((e: ApiError) => setErr(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (isSuper) api<{ admins: Member[] }>('/admin/team').then((r) => setTeam(r.admins.filter((a) => a.active))).catch(() => null); }, [isSuper]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true); setErr(''); setMsg('');
    try { await fn(); setMsg(ok); await load(); } catch (e) { setErr(e instanceof ApiError ? e.message : 'Something went wrong.'); } finally { setBusy(false); }
  };

  const mark = (to: 'contacted' | 'converted') => run(() => api(`/admin/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: to, note: '' }) }), to === 'contacted' ? 'Marked as contacted.' : 'Marked as converted.');
  const remove = async () => {
    setBusy(true); setErr('');
    try { await api(`/admin/inquiries/${id}`, { method: 'DELETE' }); router.replace('/admin/enquiries'); }
    catch (e) { setErr(e instanceof ApiError ? e.message : 'Could not delete the enquiry.'); setConfirmDelete(false); setBusy(false); }
  };

  if (err && !d) return <ErrorNote>{err}</ErrorNote>;
  if (!d) return <Loading />;
  const { inquiry: q, history, customer } = d;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/enquiries" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-panther-red"><ArrowLeft className="h-4 w-4" aria-hidden />All enquiries</Link>
      <PageTitle title={q.name} sub={`Received ${fmtDate(q.createdAt, true)}`} action={<StatusBadge status={q.status} />} />
      {err && <div className="mb-4"><ErrorNote>{err}</ErrorNote></div>}
      {msg && <div className="mb-4"><OkNote>{msg}</OkNote></div>}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card title="Enquiry">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-steel">Phone</dt><dd><a href={`tel:${q.phone}`} className="font-semibold text-panther-red">{q.phone}</a></dd></div>
              <div><dt className="text-steel">Email</dt><dd className="break-all">{q.email ? <a href={`mailto:${q.email}`} className="text-panther-red">{q.email}</a> : '–'}</dd></div>
              <div><dt className="text-steel">City / country</dt><dd>{q.city || '–'} · {q.country}</dd></div>
              <div><dt className="text-steel">Source</dt><dd>{sourceLabel(q.source)}</dd></div>
              {q.vehicleInterest && <div><dt className="text-steel">Vehicle / interest</dt><dd className="font-semibold">{q.vehicleInterest}</dd></div>}
              {q.source === 'quick-enquiry' && <div><dt className="text-steel">WhatsApp</dt><dd><span className={`inline-block px-2.5 py-1 text-xs font-semibold ${whatsappTone(q.whatsappStatus)}`}>{whatsappLabel(q.whatsappStatus)}</span>{q.whatsappStatus === 'pending_user' && <span className="mt-1 block text-xs text-steel">The visitor was given a WhatsApp link. Whether they pressed Send is not known, so follow up from here.</span>}{q.whatsappStatus === 'failed' && <span className="mt-1 block text-xs text-steel">WhatsApp did not accept the message. The enquiry is saved here.</span>}</dd></div>}
              {q.vehicles.length > 0 && <div className="sm:col-span-2"><dt className="text-steel">Vehicles</dt><dd>{q.vehicles.map((v) => v.name).join(', ')}</dd></div>}
              {q.subject && <div className="sm:col-span-2"><dt className="text-steel">Subject</dt><dd>{q.subject}</dd></div>}
              {q.message && <div className="sm:col-span-2"><dt className="text-steel">Message</dt><dd className="whitespace-pre-wrap">{q.message}</dd></div>}
            </dl>
          </Card>

          <Card title="Progress history">
            <ol className="space-y-4">
              {history.map((h) => (
                <li key={h._id} className="border-l-2 border-line pl-4">
                  <p className="text-sm"><strong>{typeLabel[h.type] ?? h.type}</strong>{h.type === 'status_changed' && <> · {statusLabel(h.fromStatus ?? '')} → {statusLabel(h.toStatus ?? '')}</>}{h.visibility === 'customer' && h.type !== 'created' && <span className="ml-2 bg-fog px-1.5 py-0.5 text-[11px] text-steel">visible to customer</span>}</p>
                  {h.message && <p className="mt-1 whitespace-pre-wrap text-sm text-steel">{h.message}</p>}
                  <p className="mt-1 text-xs text-steel">{h.actor?.name ?? 'System'} · {fmtDate(h.createdAt, true)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Responsible">
            <p className="text-sm">{q.assignedTo ? <><strong>{q.assignedTo.name}</strong><span className="block text-steel">Assigned {fmtDate(q.assignedAt, true)}</span></> : <span className="text-steel">Not assigned yet.</span>}</p>
            {isSuper && (
              <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (assignee) run(() => api(`/admin/inquiries/${id}/assign`, { method: 'POST', body: JSON.stringify({ adminId: assignee }) }), 'Assigned.'); }}>
                <label className="min-w-0 flex-1"><span className="sr-only">Assign to</span><select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input}><option value="">Choose an admin…</option>{team.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
                <button className={btn} disabled={busy || !assignee || assignee === q.assignedTo?._id}>Assign</button>
              </form>
            )}
          </Card>

          <Card title="Update status">
            <div className="mb-4 flex flex-wrap gap-2">
              <button type="button" className={btnLine} disabled={busy || q.status === 'contacted'} onClick={() => mark('contacted')}>Mark as contacted</button>
              <button type="button" className={btnLine} disabled={busy || q.status === 'converted'} onClick={() => mark('converted')}>Mark as converted</button>
            </div>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => api(`/admin/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note: statusNote }) }), 'Status updated.').then(() => setStatusNote('')); }}>
              <label className="block"><span className="sr-only">Status</span><select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></label>
              <label className="block"><span className="sr-only">Note (shown to the customer)</span><textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} rows={2} maxLength={2000} placeholder="Optional note. The customer can see this." className={input} /></label>
              <button className={btn} disabled={busy || status === q.status}>Save status</button>
            </form>
          </Card>

          <Card title="Add update">
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!note.message.trim()) return; run(() => api(`/admin/inquiries/${id}/notes`, { method: 'POST', body: JSON.stringify(note) }), 'Added.').then(() => setNote((n) => ({ ...n, message: '' }))); }}>
              <label className="block"><span className="sr-only">Type</span><select value={note.type} onChange={(e) => setNote((n) => ({ ...n, type: e.target.value }))} className={input}><option value="progress">Progress update</option><option value="note">Internal note</option><option value="report">Report to Super Admin</option></select></label>
              <label className="block"><span className="sr-only">Message</span><textarea value={note.message} onChange={(e) => setNote((n) => ({ ...n, message: e.target.value }))} rows={4} maxLength={2000} className={input} placeholder="What happened?" /></label>
              {note.type === 'progress' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={note.visibility === 'customer'} onChange={(e) => setNote((n) => ({ ...n, visibility: e.target.checked ? 'customer' : 'internal' }))} className="h-4 w-4 accent-[#E4202B]" />Show to the customer</label>}
              <button className={btn} disabled={busy || !note.message.trim()}>Add</button>
            </form>
          </Card>

          {isSuper && (
            <Card title="Delete enquiry">
              <p className="mb-3 text-sm text-steel">Removes this enquiry and its history permanently. Only a Super Admin can do this.</p>
              <button type="button" className="inline-flex items-center gap-2 border border-panther-red px-4 py-2.5 text-sm font-semibold text-panther-red transition-colors hover:bg-panther-red hover:text-white disabled:opacity-60" disabled={busy} onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" aria-hidden />Delete enquiry</button>
            </Card>
          )}

          {customer && (
            <Card title="Customer account">
              <p className="text-sm"><Link href={`/admin/customers/${customer._id}`} className="font-semibold text-panther-red">{customer.name}</Link><span className="block break-all text-steel">{customer.email}</span></p>
            </Card>
          )}
        </div>
      </div>
      {confirmDelete && (
        <ConfirmDialog title="Delete enquiry" confirmLabel="Delete" danger busy={busy} onConfirm={remove} onCancel={() => setConfirmDelete(false)}>
          <p>Delete the enquiry from <strong>{q.name}</strong>?</p>
          <p>This cannot be undone.</p>
        </ConfirmDialog>
      )}
    </div>
  );
}