'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { whyPanther } from '@/data/site';
import { getProduct as builtIn } from '@/data/products';
import { useCatalog } from '@/components/catalog/CatalogProvider';
import { isExternalImage } from '@/lib/media';
import { cn } from '@/lib/utils';

/** Scroll-driven: the section is tall, the stage is sticky, and scroll progress picks the active reason. */
export function WhyPanther() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(whyPanther.length - 1, Math.floor(v * whyPanther.length))));
  const item = whyPanther[i];
  const { getProduct, products } = useCatalog();
  // The featured model may have been renamed or removed in Admin > Vehicles: fall back rather than break the section.
  const product = getProduct(item.model) ?? builtIn(item.model) ?? products[0];

  return (
    <section id="why-panther" ref={ref} aria-labelledby="why-title" className="relative bg-ink text-white" style={{ height: `${whyPanther.length * 90 + 40}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-[72px]">
        <div className="mx-auto grid w-full max-w-page items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="why-title" className="text-sm font-semibold uppercase tracking-[0.3em] text-panther-amber">Why Panther</h2>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="mt-6" aria-live="polite">
                <p className="font-display text-[7rem] leading-none text-white/15 md:text-[11rem]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="-mt-6 font-display text-5xl leading-[0.95] md:-mt-10 md:text-7xl">{item.title}</h3>
                <p className="mt-5 max-w-md text-lg text-white/75">{item.body}</p>
              </motion.div>
            </AnimatePresence>
            <ol className="mt-10 flex gap-2" aria-label="Progress">
              {whyPanther.map((w, n) => <li key={w.title} className={cn('h-1.5 w-12 rounded-full transition-all duration-300', n === i ? 'bg-panther-red shadow-[0_0_8px_rgba(228,32,43,0.8)]' : 'bg-white/20')}><span className="sr-only">{w.title}</span></li>)}
            </ol>
          </div>
          <div className="relative aspect-[4/3] w-full">
            <AnimatePresence mode="wait">
              <motion.div key={product.slug} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                <Image src={product.image} unoptimized={isExternalImage(product.image)} alt={product.name} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
