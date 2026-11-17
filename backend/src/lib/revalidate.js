import { env } from '../config/env.js';

/**
 * Tells the website (Next.js) to drop its cached copy of public data the moment an admin saves, so the change is
 * live on the next page view instead of after a cache timer. Tags: 'hero' | 'finance' | 'catalog' | 'team'.
 * Never throws and never blocks a save for long: if the website cannot be reached, the save still succeeds and the
 * site catches up on its own within a few seconds (short time-based revalidation in the frontend).
 * Returns true when the website confirmed the refresh.
 */
export async function revalidateSite(...tags) {
  if (!env.revalidateSecret) return false;
  try {
    const res = await fetch(`${env.frontendUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': env.revalidateSecret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch { return false; }
}
