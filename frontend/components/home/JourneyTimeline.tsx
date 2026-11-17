'use client';
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { journey } from '@/data/site';

export function JourneyTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-20 bg-white py-20 md:py-32">
      <div className="mx-auto max-w-page px-5 md:px-10">
        <h2 id="journey-title" className="font-display text-6xl leading-[0.9] md:text-8xl">Our journey</h2>
        <div ref={ref} className="relative mt-16 md:mt-24">
          <div aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-line md:left-[calc(20%-1px)]" />
          <motion.div aria-hidden style={{ scaleY, transformOrigin: 'top' }} className="absolute bottom-0 left-[6px] top-0 w-[3px] bg-panther-red md:left-[calc(20%-2px)]" />
          <ol className="space-y-16 md:space-y-28">
            {journey.map((j) => (
              <li key={j.year} className="relative grid pl-10 md:grid-cols-[20%_1fr] md:gap-0 md:pl-0">
                <span aria-hidden className="absolute left-0 top-3 h-[15px] w-[15px] rounded-full border-[3px] border-panther-red bg-white md:left-[calc(20%-8px)]" />
                <p className="font-display text-6xl leading-none md:pr-10 md:text-right md:text-8xl">{j.year}</p>
                <div className="mt-3 md:mt-0 md:pl-14">
                  <p className="text-xs font-semibold uppercase tracking-widest text-panther-red">{j.tag}</p>
                  <h3 className="mt-1 font-display text-4xl md:text-5xl">{j.title}</h3>
                  <p className="mt-2 max-w-md text-steel">{j.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
