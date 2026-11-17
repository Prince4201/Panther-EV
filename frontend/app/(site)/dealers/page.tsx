import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { DealerSearch } from '@/components/pages/DealerSearch';

export const metadata: Metadata = { title: 'Find a dealer', description: 'Find your nearest Panther EV dealer or service location by state, city or pincode.', alternates: { canonical: '/dealers' } };

export default async function DealersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <>
      <PageHeader title="Find a dealer" intro="Search by state, city or pincode to find your nearest Panther location." />
      <DealerSearch initial={(q ?? '').slice(0, 60)} />
    </>
  );
}
