'use client';
import { Button } from '@/components/ui/Button';

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="flex min-h-[60svh] flex-col items-start justify-center px-5 py-16 md:px-10">
      <h1 className="font-display text-5xl md:text-7xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-steel">This page could not load. Try again, or go back to the homepage.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={reset} className="bg-panther-red px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-ink">Try again</button>
        <Button href="/" variant="outlineDark">Go to homepage</Button>
      </div>
    </section>
  );
}
