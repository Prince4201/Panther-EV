import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { serviceSections } from '@/data/services';

export const metadata: Metadata = { title: 'Services', description: 'Service, battery support, warranty and spare parts for Panther electric rickshaws.', alternates: { canonical: '/services' } };

export default function ServicesPage() {
  return (
    <>
      <PageHeader title="Services" intro="Keep your Panther on the road. Service, battery support, warranty and spare parts." />
      <section className="mx-auto max-w-page px-5 py-14 md:px-10 md:py-20">
        <div className="flex flex-wrap gap-3">
          <Button href="/services/book" arrow>Book a service</Button>
          <Button href="/dealers" variant="outlineDark">Find a service location</Button>
        </div>
        <div className="mt-14 grid gap-x-16 border-t border-ink lg:grid-cols-[220px_1fr]">
          <nav aria-label="Services" className="hidden pt-6 lg:block">
            <ul className="sticky top-32 space-y-2 text-sm font-semibold">
              {serviceSections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-steel hover:text-panther-red">{s.title}</a></li>)}
            </ul>
          </nav>
          <div>
            {serviceSections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-32 border-b border-line py-10">
                <h2 id={`${s.id}-h`} className="font-display text-4xl md:text-5xl">{s.title}</h2>
                <p className="mt-3 max-w-2xl text-lg text-steel">{s.body}</p>
                <a href={`/contact?subject=${encodeURIComponent(s.title)}`} className="mt-5 inline-block border-b-2 border-panther-red pb-1 text-sm font-semibold uppercase tracking-wider">Ask Panther</a>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
