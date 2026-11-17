import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { PShapeVisual } from '@/components/brand/PShapeVisual';
import { Button } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';
import { companyContent as a } from '@/data/company';
import { journey, site } from '@/data/site';

export const metadata: Metadata = { title: 'Company', description: 'Panther EV has built heavy-duty electric rickshaws for Indian roads since 2014. Read our story.', alternates: { canonical: '/company' } };

export default function CompanyPage() {
  return (
    <>
      <PageHeader dark title="Company" intro={a.title} />

      {/* Vision | large P image | Mission. Desktop: three columns. Tablet: P on top, Vision + Mission side by side. Phone: stacked in reading order. */}
      <section aria-label="Vision and mission" className="mx-auto grid max-w-page items-center gap-x-10 gap-y-12 px-5 py-14 md:grid-cols-2 md:px-10 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)_minmax(0,1fr)] lg:gap-x-8 xl:gap-x-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-panther-red">Vision</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.95] md:text-5xl">{a.vision.title}</h2>
          <p className="mt-4 text-lg text-steel">{a.vision.body}</p>
        </div>

        {a.pShape.enabled && (
          <PShapeVisual image={a.pShape.image} alt={a.pShape.imageAlt} className="mx-auto w-full max-w-[460px] md:order-first md:col-span-2 md:max-w-[420px] lg:order-none lg:col-span-1 lg:max-w-none" />
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-panther-red">Mission</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.95] md:text-5xl">{a.mission.title}</h2>
          <ul className="mt-4 space-y-4">
            {a.mission.points.map((m) => <li key={m.title}><h3 className="font-display text-2xl">{m.title}</h3><p className="text-steel">{m.body}</p></li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="story-h" className="mx-auto max-w-page px-5 pb-14 md:px-10 md:pb-20">
        <div className="max-w-3xl border-t border-ink pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-panther-red">Panther EV</p>
          <h2 id="story-h" className="mt-3 font-display text-5xl leading-[0.9] md:text-7xl">Our story</h2>
          <p className="mt-5 text-lg text-steel">{a.intro}</p>
          <p className="mt-4 text-lg text-steel">{a.story}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button href="/vehicles" arrow>Explore vehicles</Button><Button href="/contact" variant="outlineDark">Contact us</Button></div>
        </div>
      </section>

      <section className="bg-fog py-14 md:py-20" aria-label="Panther in numbers">
        <dl className="mx-auto grid max-w-page grid-cols-2 gap-8 px-5 md:px-10 lg:grid-cols-3">
          <div><dd className="font-display text-6xl md:text-8xl"><Counter to={site.stats.vehicles} suffix="+" /></dd><dt className="text-steel">Vehicles on Indian roads</dt></div>
          <div><dd className="font-display text-6xl md:text-8xl"><Counter to={site.stats.years} suffix="+" /></dd><dt className="text-steel">Years of trusted performance</dt></div>
          <div className="col-span-2 lg:col-span-1"><dd className="font-display text-6xl md:text-8xl">{site.stats.since}</dd><dt className="text-steel">Year Panther was established</dt></div>
        </dl>
      </section>

      <section className="mx-auto max-w-page px-5 py-16 md:px-10 md:py-24" aria-labelledby="values-h">
        <h2 id="values-h" className="font-display text-5xl leading-[0.9] md:text-7xl">What we stand for</h2>
        <ul className="mt-10 grid border-t border-ink md:grid-cols-3">
          {a.values.map((v) => <li key={v.title} className="border-b border-line py-6 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><h3 className="font-display text-3xl">{v.title}</h3><p className="mt-2 text-steel">{v.body}</p></li>)}
        </ul>
      </section>

      <section id="journey" className="scroll-mt-24 bg-ink py-16 text-white md:py-24" aria-labelledby="journey-h">
        <div className="mx-auto max-w-page px-5 md:px-10">
          <h2 id="journey-h" className="font-display text-5xl leading-[0.9] md:text-7xl">Our journey</h2>
          <ol className="mt-10 grid border-t border-white/20 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((j) => (
              <li key={j.year} className="border-b border-white/15 py-6 md:pr-8 xl:border-b-0">
                <p className="font-display text-6xl text-panther-amber">{j.year}</p>
                <h3 className="mt-2 font-display text-3xl">{j.title}</h3>
                <p className="mt-1 text-white/70">{j.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
