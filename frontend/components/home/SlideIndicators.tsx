import { cn } from '@/lib/utils';
import type { HeroSlideData } from '@/types/hero';

interface Props {
  slides: HeroSlideData[];
  index: number;
  running: boolean;
  duration: number;
  onSelect: (i: number) => void;
}

/** Luxury indicators dock: each pill represents a vehicle with smooth fill animation and active glow */
export function SlideIndicators({ slides, index, running, duration, onSelect }: Props) {
  return (
    <ul className="flex items-center gap-2.5" aria-label="Choose vehicle">
      {slides.map((s, i) => {
        const isActive = i === index;
        return (
          <li key={s._id}>
            <button
              onClick={() => onSelect(i)}
              aria-label={`Show ${s.title}`}
              aria-current={isActive}
              className="group flex h-7 items-center transition-transform active:scale-95"
            >
              <span
                className={cn(
                  'relative block h-[4px] rounded-full overflow-hidden transition-all duration-300',
                  isActive ? 'w-10 sm:w-12 bg-white/30' : 'w-5 sm:w-7 bg-white/20 group-hover:bg-white/40'
                )}
              >
                {isActive && (
                  <span
                    key={index}
                    className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#E4202B] to-[#FF4B56] shadow-[0_0_10px_rgba(228,32,43,0.95)]"
                    style={running ? { animation: `heroProgress ${duration}ms linear forwards` } : { transform: 'scaleX(1)' }}
                  />
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
