import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { site } from '@/data/site';

export const metadata: Metadata = { title: 'Become a dealer', description: 'Partner with Panther EV, the brand behind 80,000+ electric rickshaws on Indian roads. Apply for a dealership.', alternates: { canonical: '/dealership' } };

const reasons = [
  { title: 'Proven product', body: `${site.stats.years}+ years of trusted performance in the toughest Indian environments.` },
  { title: 'A growing network', body: `${site.stats.vehicles.toLocaleString('en-IN')}+ Panther vehicles are already on Indian roads.` },
  { title: 'Low-maintenance range', body: 'Vehicles designed to minimise service needs and costs for your customers.' },
];
// Taken from the existing dealership application (public/dealership-application, step 2 "Upload Documents").
const requiredDocuments = [
  'PAN Card',
  'Aadhaar Card (front side)',
  'Aadhaar Card (back side)',
  'GST Certificate',
  'GPS photo of the showroom',
];
// Link target is the existing standalone application form, served as a static page.
const APPLY_URL = '/dealership-application/index.html';
const steps = ['Send your details with the form.', 'The Panther team contacts you to discuss your location and business.', 'Agree the next steps together.'];

export default function DealershipPage() {
  return (
    <>
      <PageHeader dark title="Become a Panther dealer" intro="Bring electric mobility to your city. Tell us about your business and the team will get in touch." />
      <section className="mx-auto grid max-w-page gap-12 px-5 py-14 md:grid-cols-2 md:gap-10 md:px-10 md:py-20 lg:gap-16">
        <div>
          <h2 className="font-display text-5xl leading-[0.9] md:text-6xl">Why partner with Panther</h2>
          <ul className="mt-8 border-t border-ink">
            {reasons.map((r) => <li key={r.title} className="border-b border-line py-5"><h3 className="font-display text-3xl">{r.title}</h3><p className="mt-1 text-steel">{r.body}</p></li>)}
          </ul>
          <h2 className="mt-12 font-display text-4xl">What happens next</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((t, i) => <li key={t} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center bg-panther-red font-display text-xl text-white">{i + 1}</span><span className="pt-1">{t}</span></li>)}
          </ol>
          {/* Plain link: the application is a static page in /public, not a Next route. */}
          <a href={APPLY_URL} className="mt-10 inline-flex items-center gap-2 border-b-2 border-panther-red pb-1.5 font-display text-3xl uppercase tracking-wide text-panther-red transition-colors hover:text-ink hover:border-ink">
            Apply for dealership <span aria-hidden>→</span>
          </a>
        </div>

        <aside id="required-documents" aria-labelledby="docs-h" className="scroll-mt-28 self-start bg-fog p-6 sm:p-8">
          <h2 id="docs-h" className="font-display text-4xl md:text-5xl">Required documents</h2>
          <p className="mt-2 text-steel">Keep these ready. You will upload them as the second step of the application (max 5 MB each).</p>
          <ul className="mt-6 border-t border-ink">
            {requiredDocuments.map((d) => (
              <li key={d} className="flex items-center gap-3 border-b border-line py-4 text-lg"><span aria-hidden className="h-2.5 w-2.5 shrink-0 bg-panther-red" />{d}</li>
            ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
