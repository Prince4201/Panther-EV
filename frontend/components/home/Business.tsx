import { Counter } from '@/components/ui/Counter';
import { site } from '@/data/site';

const points = [
  ['Lower operating cost', 'Designed to minimise service needs and costs.'],
  ['Reliable performance', 'Over a decade of durability in demanding Indian conditions.'],
  ['Low maintenance', 'More time on the road, less time in the workshop.'],
  ['Business efficiency', 'Optimised for maximum range and profitability.'],
  ['Practical electric mobility', 'Passenger and cargo models for different kinds of work.'],
];

export function Business() {
  return (
    <section aria-labelledby="biz-title" className="bg-fog py-20 md:py-32">
      <div className="mx-auto grid max-w-page gap-16 px-5 md:px-10 lg:grid-cols-[5fr_6fr]">
        <div>
          <h2 id="biz-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Built for business</h2>
          <p className="mt-6 max-w-md text-lg text-steel">Panther builds electric commercial vehicles for people who earn their living on the road.</p>
          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-ink pt-8">
            <div><dt className="text-sm text-steel">Vehicles on Indian roads</dt><dd className="font-display text-5xl md:text-6xl"><Counter to={site.stats.vehicles} suffix="+" /></dd></div>
            <div><dt className="text-sm text-steel">Years of proven performance</dt><dd className="font-display text-5xl md:text-6xl"><Counter to={site.stats.years} suffix="+" /></dd></div>
          </dl>
        </div>
        <ul className="self-end">
          {points.map(([t, b]) => (
            <li key={t} className="grid gap-1 border-t border-line py-6 md:grid-cols-[1fr_1fr] md:gap-8 first:border-t-ink">
              <h3 className="font-display text-3xl md:text-4xl">{t}</h3>
              <p className="text-steel">{b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
