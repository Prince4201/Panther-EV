import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

// Called by the backend (never by browsers) right after an admin saves. It drops the cached copy of that data,
// so the next page view is rendered from fresh data instead of waiting for a cache timer.
const TAGS = ['hero', 'finance', 'catalog', 'team'];
export const dynamic = 'force-dynamic';

const same = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !same(req.headers.get('x-revalidate-secret') ?? '', secret)) return NextResponse.json({ message: 'Not allowed.' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = (Array.isArray(body?.tags) ? body.tags : []).filter((t): t is string => typeof t === 'string' && TAGS.includes(t));
  tags.forEach((t) => revalidateTag(t));
  return NextResponse.json({ revalidated: tags });
}
