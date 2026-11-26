'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { HeroCopy, HeroVehicle, textVariants, vehicleFadeVariants, vehicleVariants } from './HeroSlide';
import { SlideIndicators } from './SlideIndicators';
import type { HeroSettings, HeroSlideData } from '@/types/hero';
import { useAuth } from '@/components/auth/AuthProvider';
import { getStateTheme, DEFAULT_THEME } from '@/data/stateThemes';

/** Used only if neither the banner nor Admin > Settings gives a time. */
const DEFAULT_MS = 3000;

/**
 * Home hero. One fixed golden sunset-road background that never moves; only the vehicle (slides left out, enters from the right)
 * and the text (rises from below) change. Timing, transition, hover-pause, indicators and arrows all come from Admin > Settings.
 */
export function HeroSlider({ slides, settings }: { slides: HeroSlideData[]; settings: HeroSettings }) {
  const reduce = useReducedMotion();
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [userPaused, setUserPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [hovered, setHovered] = useState(false);

  /* ── State-based hero background ── */
  const { account } = useAuth();
  const stateTheme = getStateTheme(account?.state);
  const bgImage = stateTheme.bgImage;
  const isPersonalized = stateTheme.id !== DEFAULT_THEME.id;

  const autoplay = settings.autoplay && !reduce && total > 1;
  const running = autoplay && !userPaused && !tabHidden && !(settings.pauseOnHover && hovered);
  const slide = slides[Math.min(index, total - 1)];
  const slideMs = slide.duration ?? settings.duration ?? DEFAULT_MS;
  const variants = settings.transition === 'fade' ? vehicleFadeVariants : vehicleVariants;

  const go = useCallback((n: number, d?: number) => {
    setDir(d ?? (n >= index ? 1 : -1));
    setIndex(((n % total) + total) % total);
  }, [index, total]);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(index + 1, 1), slideMs);
    return () => clearTimeout(t);
  }, [running, index, go, slideMs]);

  useEffect(() => { if (index >= total) setIndex(0); }, [index, total]);

  useEffect(() => {
    const on = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 60 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
    if (info.offset.x < 0) go(index + 1, 1); else go(index - 1, -1);
  };

  return (
    <motion.section aria-roledescription="carousel" aria-label="Featured Panther vehicles" tabIndex={0}
      onPanEnd={total > 1 ? onPanEnd : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(index + 1, 1); if (e.key === 'ArrowLeft') go(index - 1, -1); }}
      className="relative h-[min(calc(100svh-72px),820px)] min-h-[640px] touch-pan-y select-none overflow-hidden bg-ink focus-visible:outline-offset-[-6px] lg:h-[calc(100svh-80px)] lg:min-h-[600px] lg:max-h-[860px]">

      {/* Fixed background — personalized per user's state, or default golden-sunset-road for anonymous visitors */}
      <Image src={bgImage} alt={isPersonalized ? `Panther EV on ${stateTheme.name} highway` : 'Panther electric rickshaw on highway at sunset'} fill priority sizes="100vw"
        className="object-cover object-[30%_center] lg:object-center saturate-[1.06] contrast-[1.03]" />

      {/* Multi-layer cinematic depth */}
      {/* Base ambient darkening */}
      <div aria-hidden className="absolute inset-0 bg-black/[0.12]" />
      {/* Text-side readability gradient */}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,14,0.65)_0%,rgba(10,11,14,0.30)_35%,rgba(10,11,14,0)_55%)] lg:bg-[linear-gradient(90deg,rgba(10,11,14,0.72)_0%,rgba(10,11,14,0.42)_30%,rgba(10,11,14,0.1)_48%,rgba(10,11,14,0)_60%)]" />
      {/* Warm cinematic ground anchor on asphalt */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />
      {/* Golden sun rim light */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_25%,rgba(255,180,80,0.10),transparent_50%)] mix-blend-screen pointer-events-none" />
      {/* Subtle vignette for cinematic framing */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.30)_100%)] pointer-events-none" />

      <div className="relative mx-auto h-full max-w-page">
        {/* Vehicle: right side on desktop, lower/right on tablet and phone. */}
        <div className="absolute inset-x-0 bottom-[104px] top-[41%] lg:bottom-[8%] lg:left-auto lg:right-[2%] lg:top-[5%] lg:w-[58%]">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div key={slide._id} custom={dir} variants={reduce ? undefined : variants} initial={reduce ? false : 'enter'} animate="center" exit={reduce ? undefined : 'exit'}
              role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${total}`} className="absolute inset-0">
              <HeroVehicle slide={slide} priority={index === 0} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text: left side on desktop, top on tablet and phone. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 px-5 pt-10 sm:px-8 sm:pt-14 lg:bottom-0 lg:flex lg:w-[42%] lg:items-center lg:pb-16 lg:pl-[5vw] lg:pr-0 lg:pt-0">
          <div className="grid w-full max-w-[34rem] text-white lg:max-w-none">
            <AnimatePresence initial={false}>
              <motion.div key={slide._id} variants={reduce ? undefined : textVariants} initial={reduce ? false : 'enter'} animate="center" exit={reduce ? undefined : 'exit'}
                aria-live={running ? 'off' : 'polite'} className="pointer-events-auto col-start-1 row-start-1 flex flex-col items-start">
                <HeroCopy slide={slide} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel dock */}
        {total > 1 && (settings.showIndicators || settings.showArrows) && (
          <div className="absolute inset-x-0 bottom-[54px] z-20 flex items-center px-5 sm:px-8 lg:bottom-7 lg:pl-[5vw]">
            <div className="inline-flex items-center gap-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-2 shadow-[0_10px_32px_rgba(0,0,0,0.55)]">
              {/* Slide Counter */}
              <span className="font-mono text-[11px] font-semibold text-white/70 select-none">
                0{index + 1} <span className="text-white/40">/</span> 0{total}
              </span>

              {settings.showIndicators && <SlideIndicators slides={slides} index={index} running={running} duration={slideMs} onSelect={(i) => go(i)} />}
              {settings.showIndicators && autoplay && (
                <button onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95">
                  {userPaused ? <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> : <Pause className="h-3.5 w-3.5 fill-current" aria-hidden />}
                </button>
              )}
              {settings.showArrows && (
                <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                  <button onClick={() => go(index - 1, -1)} aria-label="Previous vehicle"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95">
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                  <button onClick={() => go(index + 1, 1)} aria-label="Next vehicle"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95">
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </div>

            {/* Personalized state badge — shown when user is logged in with a matched state */}
            {isPersonalized && (
              <div className="ml-auto hidden items-center gap-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 px-4 py-2 shadow-lg lg:inline-flex">
                <span className="text-base">{stateTheme.icon}</span>
                <span className="text-xs font-semibold text-white/90 tracking-wide">{stateTheme.name}</span>
                <span className="text-[10px] text-white/50 font-medium">•</span>
                <span className="text-[10px] text-white/60 font-medium italic">{stateTheme.tagline}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
