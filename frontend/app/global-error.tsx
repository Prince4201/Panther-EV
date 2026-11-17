'use client';
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN"><body style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem' }}>Something went wrong</h1>
      <p>The site hit an unexpected error.</p>
      <button onClick={reset} style={{ background: '#E4202B', color: '#fff', padding: '12px 24px', border: 0, fontWeight: 600 }}>Try again</button>
    </body></html>
  );
}
