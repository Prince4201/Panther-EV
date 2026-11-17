import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { CompareView } from '@/components/vehicles/CompareView';

export const metadata: Metadata = { title: 'Compare vehicles', description: 'Compare Panther e-rickshaw models side by side.', alternates: { canonical: '/compare' } };

export default function ComparePage() {
  return (
    <>
      <PageHeader title="Compare vehicles" intro="Put up to three Panther models side by side." />
      <Suspense fallback={<p className="p-10 text-steel">Loading…</p>}><CompareView /></Suspense>
    </>
  );
}
