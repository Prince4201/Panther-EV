'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ActiveBadge, Avatar, Card, ErrorNote, Forbidden, Loading, PageTitle, RoleBadge, Stat, StatusBadge, TableWrap, Td, Th } from '@/components/admin/ui';
import { fmtDate } from '@/lib/enquiry';
import { PERMISSION_LABELS } from '@/components/admin/PermissionPicker';

interface Detail {
  admin: { id: string; name: string; email: string; phone: string; avatar?: string; role: string; permissions: string[]; active: boolean; lastLoginAt?: string; createdAt: string };
  assigned: Array<{ _id: string; name: string; subject: string; status: string; updatedAt: string }>;
  activity: Array<{ _id: string; summary: string; createdAt: string }>;
}

export default function TeamMemberPage() {
  const { id } = useParams<{ id: string }>();
  const { isSuper } = useAdmin();
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { if (isSuper) api<Detail>(`/admin/team/${id}`).then(setD).catch((e: ApiError) => setErr(e.message)); }, [id, isSuper]);

  if (!isSuper) return <Forbidden />;
  if (err) return <ErrorNote>{err}</ErrorNote>;
  if (!d) return <Loading />;
  const a = d.admin;
  const open = d.assigned.filter((x) => !['completed', 'converted', 'cancelled'].includes(x.status)).length;
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/team" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-steel hover:text-panther-red"><ArrowLeft className="h-4 w-4" aria-hidden />Team</Link>
      <PageTitle title={a.name} sub={`${a.email}${a.phone ? ` · ${a.phone}` : ''}`} action={<span className="flex items-center gap-2"><Avatar name={a.name} src={a.avatar} /><RoleBadge role={a.role} /><ActiveBadge active={a.active} /></span>} />
      <div className="grid grid-cols-3 gap-4"><Stat label="Assigned" value={d.assigned.length} /><Stat label="Open" value={open} tone="text-panther-red" /><Stat label="Completed" value={d.assigned.filter((x) => ['completed', 'converted'].includes(x.status)).length} /></div>
      <p className="mt-4 text-sm text-steel">Permissions: {a.role === 'super_admin' ? 'Full access' : a.permissions.length ? a.permissions.map((p) => PERMISSION_LABELS[p] ?? p).join(', ') : 'Assigned enquiries only'} · Last sign-in {fmtDate(a.lastLoginAt, true)} · Created {fmtDate(a.createdAt)}</p>
      <h2 className="mb-3 mt-8 font-display text-2xl">Assigned enquiries</h2>
      {d.assigned.length === 0 ? <p className="bg-white p-6 text-steel">Nothing assigned yet.</p> : (
        <TableWrap><thead><tr><Th>From</Th><Th>About</Th><Th>Status</Th><Th>Updated</Th></tr></thead>
          <tbody>{d.assigned.map((e) => <tr key={e._id}><Td><Link href={`/admin/enquiries/${e._id}`} className="font-semibold hover:text-panther-red">{e.name}</Link></Td><Td>{e.subject || '–'}</Td><Td><StatusBadge status={e.status} /></Td><Td className="whitespace-nowrap">{fmtDate(e.updatedAt)}</Td></tr>)}</tbody></TableWrap>
      )}
      <Card title="Recent activity" className="mt-8">
        {d.activity.length === 0 ? <p className="text-sm text-steel">No recorded activity.</p> : <ul className="divide-y divide-line">{d.activity.map((x) => <li key={x._id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm"><span>{x.summary}</span><span className="text-xs text-steel">{fmtDate(x.createdAt, true)}</span></li>)}</ul>}
      </Card>
    </div>
  );
}
