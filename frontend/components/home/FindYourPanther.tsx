import Image from 'next/image';
import Link from 'next/link';
import { getProduct as builtIn } from '@/data/products';
import { getCatalog } from '@/lib/catalog';
import { isExternalImage } from '@/lib/media';
import { Button } from '@/components/ui/Button';

const panels = [
  { title: 'Carry passengers', text: 'Four passenger models, from the popular XL to the flagship Super Deluxe.', model: 'panther-deluxe', href: '/vehicles?category=passenger' },
  { title: 'Move goods', text: 'Two cargo models built for logistics and maximum payload.', model: 'panther-cargo', href: '/vehicles?category=cargo' },
];

export async function FindYourPanther() {
  const { products } = await getCatalog();
  return (
    <section aria-labelledby="find-title" className="bg-white pb-20 md:pb-32">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-panther-red">Choose Your Ride</p>
            <h2 id="find-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Find your Panther</h2>
          </div>
          <Button href="/compare" variant="outlineDark" arrow>Compare models</Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {panels.map((p) => {
            const m = products.find((x) => x.slug === p.model) ?? builtIn(p.model) ?? products[0];
            return (
              <Link key={p.title} href={p.href} className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal via-ink to-ink/95 p-8 text-white md:min-h-[560px] border border-white/5 shadow-xl transition-all duration-500 hover:border-white/15 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(228,32,43,0.06),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" aria-hidden />
                <div className="relative z-10 max-w-xs">
                  <h3 className="font-display text-5xl leading-none md:text-6xl">{p.title}</h3>
                  <p className="mt-3 text-white/70">{p.text}</p>
                </div>
                <Image src={m.image} unoptimized={isExternalImage(m.image)} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-contain object-bottom p-10 pt-40 transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                <span className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-panther-amber group-hover:text-white transition-colors duration-300">
                  See models &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
