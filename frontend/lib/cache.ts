/**
 * How public data fetched from the API is cached by the website.
 * 1. On demand: every admin save makes the backend call /api/revalidate with the matching tag, which drops the
 *    cached copy immediately.
 * 2. Safety net: if that call cannot get through, the copy is refreshed after FALLBACK_SECONDS anyway.
 */
export const FALLBACK_SECONDS = 5;
export const cached = (tag: 'hero' | 'finance' | 'catalog' | 'team') => ({ next: { revalidate: FALLBACK_SECONDS, tags: [tag] }, signal: AbortSignal.timeout(2500) });
