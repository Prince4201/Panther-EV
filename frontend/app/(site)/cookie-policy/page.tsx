import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'Cookie policy', alternates: { canonical: '/cookie-policy' } };

// Placeholder: the legal text must be supplied and approved by Panther. Nothing is invented here.
export default function Page() {
  return (
    <>
      <PageHeader title="Cookie policy" />
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        <p className="text-lg text-steel">The full text explaining how this website uses cookies is being finalised. Until it is published, write to <a href={`mailto:${site.email}`} className="font-semibold text-panther-red underline">{site.email}</a> with any questions.</p>
      </section>
    </>
  );
}
