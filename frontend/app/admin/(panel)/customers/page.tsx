'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useAdmin } from '@/components/admin/AdminContext';
import { ActiveBadge, Empty, ErrorNote, Forbidden, Loading, PageTitle, Pager, TableWrap, Td, Th, input } from '@/components/admin/ui';
import { fmtDate } from '@/lib/enquiry';

interface Row { _id?: string; id?: string; name: string; email: string; phone: string; address?: { city?: string; state?: string }; active: boolean; createdAt: string; lastActiveAt?: string; enquiryCount: number }

function List() {
  const { can } = useAdmin();
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ customers: Row[]; total: number; limit: number } | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (q.trim()) qs.set('q', q.trim());
    if (status) qs.set('status', status);
    api<{ customers: Row[]; total: number; limit: number }>(`/admin/customers?${qs}`).then(setData).catch((e: ApiError) => setErr(e.message));
  }, [q, status, page]);
  useEffect(() => { if (!can('customers.view')) return; const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load, can]);

  if (!can('customers.view')) return <Forbidden />;
  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle title="Customers" sub="Registered customer accounts." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-2"><span className="sr-only">Search customers</span><input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, phone, city, state…" className={input} /></label>
        <label><span className="sr-only">Account status</span><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={input}><option value="">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
      </div>
      {err ? <ErrorNote>{err}</ErrorNote> : !data ? <Loading /> : data.customers.length === 0 ? <Empty>No customers match.</Empty> : (
        <>
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Location</Th><Th>Registered</Th><Th>Last active</Th><Th>Enquiries</Th><Th>Status</Th></tr></thead>
            <tbody>{data.customers.map((c) => {
              const cid = c._id || c.id;
              return (
                <tr key={cid} className="hover:bg-fog/60">
                  <Td><Link href={`/admin/customers/${cid}`} className="font-semibold hover:text-panther-red">{c.name}</Link><p className="break-all text-xs text-steel">{c.email}</p></Td>
                  <Td className="whitespace-nowrap">{c.phone || '–'}</Td>
                  <Td>{[c.address?.city, c.address?.state].filter(Boolean).join(', ') || '–'}</Td>
                  <Td className="whitespace-nowrap">{fmtDate(c.createdAt)}</Td>
                  <Td className="whitespace-nowrap">{fmtDate(c.lastActiveAt)}</Td>
                  <Td>{c.enquiryCount}</Td>
                  <Td><ActiveBadge active={c.active} /></Td>
                </tr>
              );
            })}</tbody>
          </TableWrap>
          <Pager page={page} total={data.total} limit={data.limit} onPage={setPage} />
        </>
      )}
    </div>
  );
}
export default function CustomersPage() { return <Suspense fallback={<Loading />}><List /></Suspense>; }
