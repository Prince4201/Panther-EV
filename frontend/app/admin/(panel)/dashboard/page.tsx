'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { Card, ErrorNote, Loading, PageTitle, Stat, StatusBadge, TableWrap, Td, Th } from '@/components/admin/ui';
import { STATUSES, fmtDate, statusBar, statusLabel } from '@/lib/enquiry';

interface Enq { _id: string; name: string; subject?: string; status: string; createdAt: string; assignedTo?: { name: string } | null; vehicles?: Array<{ name: string }> }
interface Dash {
  scope: 'super_admin' | 'overview' | 'admin';
  counts: Record<string, number>;
  byStatus?: Record<string, number>;
  recentEnquiries: Enq[];
  recentUsers?: Array<{ _id: string; name: string; email: string; createdAt: string; active: boolean }>;
  recentActivity?: Array<{ _id: string; summary: string; createdAt: string; actor?: { name: string } }>;
  workload?: Array<{ _id: string; open: number }>;
}

export default function Dashboard() {
  const { admin, isSuper, can } = useAdmin();
  const [d, setD] = useState<Dash | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api<Dash>('/admin/dashboard').then(setD).catch((e: ApiError) => setErr(e.message)); }, []);

  if (err) return <ErrorNote>{err}</ErrorNote>;
  if (!d) return <Loading />;
  const c = d.counts;
  const total = Math.max(1, c.enquiries ?? 0);
  const seesAll = can('enquiries.all');
  // Stat tiles only link to sections this account may open.
  const link = (href: string, allowed: boolean) => (allowed ? href : undefined);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Dashboard" sub={`Welcome back, ${admin.name.split(' ')[0]}.`} />
      {d.scope === 'admin' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Assigned to me" value={c.assigned} href="/admin/enquiries" />
          <Stat label="Open" value={c.open} href="/admin/enquiries" tone="text-panther-red" />
          <Stat label="Completed" value={c.completed} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Total customers" value={c.users} href={link('/admin/customers', can('customers.view'))} />
            <Stat label="Total products" value={c.products} href={link('/admin/products', can('products.manage'))} />
            <Stat label="Total enquiries" value={c.enquiries} href={link('/admin/enquiries', seesAll)} />
            <Stat label="Pending enquiries" value={c.pending} href={link('/admin/enquiries?status=new', seesAll)} tone="text-panther-red" />
            <Stat label="Completed enquiries" value={c.completed} href={link('/admin/enquiries?status=completed', seesAll)} />
            <Stat label="Total team members" value={c.team} href={link('/admin/team', isSuper)} />
            <Stat label="Active team members" value={c.activeTeam} href={link('/admin/team', isSuper)} />
            <Stat label="Finance partners" value={c.financePartners} href={link('/admin/finance', can('finance.manage'))} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Stat label="Active customers" value={c.activeUsers} href={link('/admin/customers?status=active', can('customers.view'))} />
            <Stat label="Enquiries in progress" value={c.inProgress} href={link('/admin/enquiries?status=in_progress', seesAll)} />
          </div>
          <Card title="Enquiry progress" className="mt-6">
            <div className="flex h-3 w-full overflow-hidden bg-fog" role="img" aria-label="Enquiries by status">
              {STATUSES.map((s) => { const n = d.byStatus?.[s] ?? 0; return n ? <span key={s} style={{ width: `${(n / total) * 100}%` }} className={statusBar(s)} title={`${statusLabel(s)}: ${n}`} /> : null; })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-steel">{STATUSES.map((s) => <li key={s}>{statusLabel(s)}: <strong className="text-ink">{d.byStatus?.[s] ?? 0}</strong></li>)}</ul>
          </Card>
        </>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title={d.scope === 'admin' ? 'My recent enquiries' : 'Recent enquiries'} action={<Link href="/admin/enquiries" className="text-sm font-semibold text-panther-red">View all</Link>} className="overflow-hidden">
          {d.recentEnquiries.length === 0 ? <p className="text-sm text-steel">Nothing yet.</p> : (
            <TableWrap>
              <thead><tr><Th>From</Th><Th>Status</Th><Th>{d.scope === 'admin' ? 'Received' : 'Assigned to'}</Th></tr></thead>
              <tbody>{d.recentEnquiries.map((e) => (
                <tr key={e._id}><Td><Link href={`/admin/enquiries/${e._id}`} className="font-semibold hover:text-panther-red">{e.name}</Link><p className="text-xs text-steel">{e.subject || e.vehicles?.map((v) => v.name).join(', ') || 'Enquiry'}</p></Td><Td><StatusBadge status={e.status} /></Td><Td>{d.scope === 'admin' ? fmtDate(e.createdAt) : e.assignedTo?.name ?? 'Unassigned'}</Td></tr>
              ))}</tbody>
            </TableWrap>
          )}
        </Card>

        {d.recentUsers && (
          <Card title="Recent customers" action={<Link href="/admin/customers" className="text-sm font-semibold text-panther-red">View all</Link>}>
            {!d.recentUsers.length ? <p className="text-sm text-steel">No customers yet.</p> : (
              <ul className="divide-y divide-line">{d.recentUsers.map((u) => <li key={u._id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><Link href={`/admin/customers/${u._id}`} className="min-w-0"><span className="block truncate font-semibold hover:text-panther-red">{u.name}</span><span className="block truncate text-xs text-steel">{u.email}</span></Link><span className="shrink-0 text-xs text-steel">{fmtDate(u.createdAt)}</span></li>)}</ul>
            )}
          </Card>
        )}
      </div>

      {d.recentActivity && (
        <Card title="Recent admin activity" action={<Link href="/admin/activity" className="text-sm font-semibold text-panther-red">Full history</Link>} className="mt-6">
          {!d.recentActivity.length ? <p className="text-sm text-steel">No activity recorded yet.</p> : (
            <ul className="divide-y divide-line">{d.recentActivity.map((a) => <li key={a._id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"><span>{a.summary}</span><span className="text-xs text-steel">{fmtDate(a.createdAt, true)}</span></li>)}</ul>
          )}
        </Card>
      )}
    </div>
  );
}
