'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

/**
 * Build sequence, chassis to finished vehicle. The video keeps its own 16:9 frame (never cropped); the caption sits underneath it.
 * Muted loop, plays while on screen. Visitors who prefer reduced motion see the still poster and can press play.
 */
export function AssemblyVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return;
      if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
    }, { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  return (
    <figure className={`group relative w-full bg-ink ${className}`}>
      <video
        ref={ref} muted loop playsInline preload="metadata" poster="/media/panther-assembly-poster.jpg"
        aria-label="A Panther electric rickshaw being assembled, from bare chassis to finished vehicle"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        className="block aspect-video h-auto w-full bg-black object-contain"
      >
        <source src="/media/panther-assembly.mp4" type="video/mp4" />
      </video>
      <figcaption className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4 md:px-8 md:py-5">
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-panther-amber">Assembly</span>
          <span className="mt-1 block font-display text-xl leading-tight text-white md:text-3xl">From bare chassis to finished Panther</span>
        </span>
        <button onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/60 text-white transition-colors hover:bg-white hover:text-ink">
          {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
        </button>
      </figcaption>
    </figure>
  );
}
