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
  const product = getProduct(item.model) ?? builtIn(item.model) ?? products[0];

  return (
    <section id="why-panther" ref={ref} aria-labelledby="why-title" className="relative bg-ink text-white" style={{ height: `${whyPanther.length * 90 + 40}svh` }}>
      {/* Subtle background texture */}
      <div aria-hidden className="sticky top-0 h-[100svh] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(228,32,43,0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(245,163,0,0.03),transparent_50%)]" />
      </div>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-[72px]" style={{ marginTop: '-100svh' }}>
        <div className="mx-auto grid w-full max-w-page items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="why-title" className="text-sm font-semibold uppercase tracking-[0.3em] text-panther-amber">Why Panther</h2>
            <AnimatePresence mode="wait">
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="mt-6" aria-live="polite">
                <p className="font-display text-[7rem] leading-none text-white/[0.08] md:text-[11rem]">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="-mt-6 font-display text-5xl leading-[0.95] md:-mt-10 md:text-7xl">{item.title}</h3>
                <p className="mt-5 max-w-md text-lg text-white/75">{item.body}</p>
              </motion.div>
            </AnimatePresence>
            <ol className="mt-10 flex gap-2" aria-label="Progress">
              {whyPanther.map((w, n) => (
                <li key={w.title} className={cn('h-1.5 rounded-full transition-all duration-500', n === i ? 'w-14 bg-panther-red shadow-[0_0_12px_rgba(228,32,43,0.7)]' : 'w-8 bg-white/15')}>
                  <span className="sr-only">{w.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative aspect-[4/3] w-full">
            <AnimatePresence mode="wait">
              <motion.div key={product.slug} initial={{ opacity: 0, x: 60, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -60, scale: 0.95 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                <Image src={product.image} unoptimized={isExternalImage(product.image)} alt={product.name} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
