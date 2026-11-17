import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { getTeamMembers } from '@/lib/team';

export const metadata: Metadata = { title: 'Our Teams', description: 'Meet the people behind Panther Electric Vehicles.', alternates: { canonical: '/our-teams' } };

export default async function OurTeamsPage() {
  const members = await getTeamMembers();
  return (
    <>
      <PageHeader title="Our Teams" intro="Meet the people behind Panther Electric Vehicles." />
      <section className="mx-auto max-w-page px-5 py-14 md:px-10 md:py-20">
        {members.length === 0 ? (
          <div className="border border-dashed border-line p-8 md:p-12">
            <p className="font-display text-4xl">Team profiles coming soon</p>
            <p className="mt-2 max-w-lg text-steel">We are putting this page together. Please check back shortly.</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m) => <li key={m._id}><TeamMemberCard member={m} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
