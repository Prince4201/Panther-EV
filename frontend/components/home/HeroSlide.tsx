'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Zap, BatteryCharging, ShieldCheck } from 'lucide-react';
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
 * Sized to aspect ratio with multi-layer contact and ambient shadows on the dark asphalt road.
 */
export function HeroVehicle({ slide, priority }: { slide: HeroSlideData; priority?: boolean }) {
  const [ratio, setRatio] = useState(1.046);
  const contacts = stanceFor(slide.image);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute bottom-0 right-0" style={{ width: `min(100cqw, calc(100cqh * ${ratio}))`, aspectRatio: String(ratio) }}>
        {/* Deep ambient chassis shadow cast onto the asphalt */}
        <div aria-hidden className="absolute left-[8%] right-[-6%] top-[86%] h-[14%] rounded-[50%] bg-black/60 blur-2xl" />
        <div aria-hidden className="absolute left-[12%] right-[2%] top-[87%] h-[8%] rounded-[50%] bg-black/80 blur-md" />

        {/* High-density tire contact patches on the road surface */}
        {contacts.map(([x, y], i) => (
          <div key={i} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
            style={{
              left: `${x}%`,
              top: `${y - 0.4}%`,
              width: i === 0 ? '16%' : '14%',
              height: '4.2%',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0) 80%)',
              filter: 'blur(2px)',
            }}
          />
        ))}

        {/* Vehicle Image */}
        <Image
          src={slide.image}
          unoptimized={isExternalImage(slide.image)}
          alt={slide.imageAlt || slide.title}
          fill
          priority={priority}
          sizes="(min-width:1024px) 58vw, 100vw"
          onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth && i.naturalHeight) setRatio(i.naturalWidth / i.naturalHeight); }}
          className="object-contain object-right-bottom drop-shadow-[0_16px_24px_rgba(0,0,0,0.35)]"
        />

        {/* Warm golden-hour rim reflection on sun side */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_60%,rgba(255,160,70,0.12),transparent_55%)] mix-blend-soft-light" />
      </div>
    </div>
  );
}

/** The headline block for one slide. Lives in the same grid cell as the previous one while it fades out. */
export function HeroCopy({ slide }: { slide: HeroSlideData }) {
  return (
    <>
      {/* Main Headline */}
      <motion.h2
        variants={lineVariants}
        className="text-balance font-display text-[clamp(2.5rem,11vw,3.75rem)] font-bold uppercase leading-[0.92] sm:text-[clamp(3rem,9vw,5rem)] lg:text-[clamp(3rem,5.4vw,6.5rem)] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
      >
        {slide.title}
      </motion.h2>

      {/* Subtitle */}
      {slide.subtitle && (
        <motion.p
          variants={lineVariants}
          className="mt-3 text-lg font-medium text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] md:text-xl lg:text-[clamp(1.1rem,1.6vw,1.5rem)]"
        >
          {slide.subtitle}
        </motion.p>
      )}

      {/* Luxury Feature Chips */}
      <motion.div variants={lineVariants} className="mt-5 flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md shadow-sm">
          <Zap className="h-3.5 w-3.5 text-panther-amber" />
          <span>100% Electric</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md shadow-sm">
          <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
          <span>140+ KM Range</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
          <span>3-Yr Warranty</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      {slide.button1Text && slide.button1Url && (
        <motion.div variants={lineVariants} className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            href={slide.button1Url}
            arrow
            className="px-8 py-4 text-sm font-bold tracking-wider rounded-full shadow-[0_8px_28px_rgba(228,32,43,0.55)] hover:shadow-[0_14px_40px_rgba(228,32,43,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {slide.button1Text}
          </Button>
          <Link
            href="/dealership"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-black/40 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-md hover:bg-white/20 hover:border-white/60 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/30"
          >
            Find Dealer
          </Link>
        </motion.div>
      )}
    </>
  );
}
