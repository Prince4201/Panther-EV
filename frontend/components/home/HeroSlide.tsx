'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { HeroSlideData } from '@/types/hero';
import { isExternalImage } from '@/lib/media';

const EASE = [0.22, 0.7, 0.2, 1] as const;
export const VEHICLE_MS = 0.9;

/** Vehicle: outgoing slides LEFT and fades, incoming arrives from the RIGHT. `custom` is the direction (1 = forward). */
export const vehicleVariants: Variants = {
  enter: (d: number) => ({ opacity: 0, x: d * 100 }),
  center: { opacity: 1, x: 0, transition: { duration: VEHICLE_MS, ease: EASE } },
  exit: (d: number) => ({ opacity: 0, x: d * -100, transition: { duration: VEHICLE_MS * 0.8, ease: EASE } }),
};

/** "Fade" transition (Admin > Settings): the vehicle cross-fades in place instead of sliding. */
export const vehicleFadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: VEHICLE_MS, ease: EASE } },
  exit: { opacity: 0, transition: { duration: VEHICLE_MS * 0.8, ease: EASE } },
};

/** Text: each line rises from below, one after another, starting just after the vehicle begins to move. */
export const textVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};
const lineVariants: Variants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

/**
 * Where each tyre touches the ground, as % of the cut-out image: [x, y] for the front, middle and rear wheel.
 * Measured from the PNGs' lowest opaque pixel under each wheel, so the shadow tucks exactly under the rubber.
 * Banners uploaded from Admin fall back to the XL Plus stance.
 */
const STANCE: Record<string, Array<[number, number]>> = {
  'panther-xl-plus': [[16.2, 99.8], [56, 84.7], [90.4, 87.6]],
  'panther-xl': [[13.8, 99.8], [58.2, 86.9], [88.3, 88.9]],
  'panther-super-deluxe': [[11.4, 99.9], [55.6, 91.2], [88.4, 93.8]],
  'panther-e-rickshaw': [[14.7, 99.9], [55, 88.6], [88.4, 90.9]],
};
const stanceFor = (src: string) => STANCE[src.split('/').pop()?.replace(/\.\w+$/, '') ?? ''] ?? STANCE['panther-xl-plus'];

/**
 * The vehicle cut-out. Transparent PNG, original proportions, no card or plate behind it.
 * The box is sized to the image's own aspect ratio, so the shadows under each tyre line up exactly with the wheels:
 * a dark, tight contact patch at every tyre, plus a very soft ground shadow cast to the right (the sun is on the left).
 */
export function HeroVehicle({ slide, priority }: { slide: HeroSlideData; priority?: boolean }) {
  const [ratio, setRatio] = useState(1.046);
  const contacts = stanceFor(slide.image);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute bottom-0 right-0" style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: String(ratio) }}>
        {/* soft ground shadow, drawn first so it sits under the tyres and the contact patches */}
        <div aria-hidden className="absolute left-[10%] right-[-4%] top-[88%] h-[11%] rounded-[50%] bg-black/30 blur-xl" />
        {contacts.map(([x, y], i) => (
          <div key={i} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[3px]"
            style={{ left: `${x}%`, top: `${y - 0.6}%`, width: i === 0 ? '14%' : '12%', height: '3.6%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0) 72%)' }} />
        ))}
        <Image src={slide.image} unoptimized={isExternalImage(slide.image)} alt={slide.imageAlt || slide.title} fill priority={priority} sizes="(min-width:1024px) 58vw, 100vw"
          onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth && i.naturalHeight) setRatio(i.naturalWidth / i.naturalHeight); }}
          className="object-contain object-right-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.22)]" />
        {/* warm sunset rim on the wheels' sun side keeps the lighting consistent with the sky */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_60%,rgba(255,160,70,0.10),transparent_55%)] mix-blend-soft-light" />
      </div>
    </div>
  );
}

/** The headline block for one slide. Lives in the same grid cell as the previous one while it fades out. */
export function HeroCopy({ slide }: { slide: HeroSlideData }) {
  return (
    <>
      <motion.p variants={lineVariants} className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-panther-amber md:text-sm">Panther EV</motion.p>
      <motion.h2 variants={lineVariants} className="text-balance font-display text-[clamp(2.5rem,11vw,3.75rem)] font-semibold uppercase leading-[0.92] sm:text-[clamp(3rem,9vw,5rem)] lg:text-[clamp(3rem,5.4vw,6.5rem)]">{slide.title}</motion.h2>
      {slide.subtitle && <motion.p variants={lineVariants} className="mt-4 text-lg font-medium text-white/95 md:text-xl lg:text-[clamp(1.1rem,1.6vw,1.6rem)]">{slide.subtitle}</motion.p>}
      {slide.button1Text && slide.button1Url && (
        <motion.div variants={lineVariants} className="mt-7 lg:mt-9">
          <Button href={slide.button1Url} arrow className="px-7 py-4 text-sm">{slide.button1Text}</Button>
        </motion.div>
      )}
    </>
  );
}
