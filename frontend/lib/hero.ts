import type { HeroData } from '@/types/hero';
import { heroFallback } from '@/data/heroFallback';
import { API_URL } from './api';
import { cached } from './cache';

/** Server-side: MongoDB -> Express -> here. Falls back to local data if the API is down or has no active slides. */
export async function getHero(): Promise<HeroData> {
  try {
    const res = await fetch(`${API_URL}/hero-slides`, cached('hero'));
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as HeroData;
    // The home hero shows transparent vehicle cut-outs over the fixed background; full-photo banners are not used here.
    const slides = (data.slides ?? []).filter((x) => x.fit === 'contain');
    return slides.length ? { settings: data.settings, slides } : heroFallback;
  } catch {
    return heroFallback;
  }
}
