export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="mx-auto max-w-page animate-pulse px-5 py-16 md:px-10">
      <div className="h-14 w-2/3 bg-fog md:h-20 md:w-1/3" />
      <div className="mt-6 h-5 w-full max-w-md bg-fog" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] bg-fog" />)}</div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
