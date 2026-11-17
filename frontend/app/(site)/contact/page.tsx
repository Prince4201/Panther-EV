import type { Metadata } from 'next';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'Contact', description: 'Talk to Panther EV about vehicles, dealership and service.' };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  return (
    <section className="mx-auto grid max-w-page gap-12 px-5 py-12 md:px-10 md:py-20 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">Talk to Panther</h1>
        <p className="mt-4 max-w-md text-steel">Tell us what you need and the team will call you back.</p>
        <dl className="mt-10 space-y-6 text-[17px]">
          <div><dt className="text-sm font-semibold text-steel">Phone</dt><dd><a href={site.phoneHref} className="hover:text-panther-red">{site.phone}</a></dd></div>
          <div><dt className="text-sm font-semibold text-steel">Email</dt><dd><a href={`mailto:${site.email}`} className="break-all hover:text-panther-red">{site.email}</a></dd></div>
          <div><dt className="text-sm font-semibold text-steel">Address</dt><dd>{site.address.map((l) => <span key={l} className="block">{l}</span>)}</dd></div>
        </dl>
      </div>
      <div className="bg-fog p-5 sm:p-8"><EnquiryForm defaultSubject={(subject ?? '').slice(0, 120)} /></div>
    </section>
  );
}
