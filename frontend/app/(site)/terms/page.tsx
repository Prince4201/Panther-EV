import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'Terms & conditions', alternates: { canonical: '/terms' } };

// Placeholder: the legal text must be supplied and approved by Panther. Nothing is invented here.
export default function Page() {
  return (
    <>
      <PageHeader title="Terms & conditions" />
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-10">
        <p className="text-lg text-steel">The full text explaining the terms for using this website is being finalised. Until it is published, write to <a href={`mailto:${site.email}`} className="font-semibold text-panther-red underline">{site.email}</a> with any questions.</p>
      </section>
    </>
  );
}
