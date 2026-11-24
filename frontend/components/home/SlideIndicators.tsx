import { cn } from '@/lib/utils';
import type { HeroSlideData } from '@/types/hero';

interface Props {
  slides: HeroSlideData[];
  index: number;
  running: boolean;
  duration: number;
  onSelect: (i: number) => void;
}

/** Four minimal bars, one per vehicle. The active bar fills over the slide time, so it shows both which vehicle is up and when the next arrives. */
export function SlideIndicators({ slides, index, running, duration, onSelect }: Props) {
  return (
    <ul className="flex items-center gap-2" aria-label="Choose vehicle">
      {slides.map((s, i) => (
        <li key={s._id}>
          <button onClick={() => onSelect(i)} aria-label={`Show ${s.title}`} aria-current={i === index} className="group flex h-6 w-8 items-center sm:w-11">
            <span className={cn('relative block h-[3.5px] w-full overflow-hidden rounded-full transition-colors', i === index ? 'bg-white/30' : 'bg-white/20 group-hover:bg-white/50')}>
              {i === index && (
                <span key={index} className="absolute inset-0 origin-left rounded-full bg-panther-red shadow-[0_0_8px_rgba(228,32,43,0.85)]"
                  style={running ? { animation: `heroProgress ${duration}ms linear forwards` } : { transform: 'scaleX(1)' }} />
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
