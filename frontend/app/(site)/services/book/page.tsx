import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export const metadata: Metadata = { title: 'Book a service', description: 'Book a service for your Panther electric rickshaw.', alternates: { canonical: '/services/book' } };

export default function BookServicePage() {
  return (
    <>
      <PageHeader title="Book a service" intro="Tell us about your vehicle and the Panther team will call to confirm a time." />
      <section className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-16">
        <div className="bg-fog p-5 sm:p-8">
          <EnquiryForm idPrefix="service" defaultSubject="Service booking" withSubject={false} submitLabel="Book service" messageHint="Model, what needs attention, and the best time to call." />
        </div>
      </section>
    </>
  );
}
