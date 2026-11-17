export function PageHeader({ title, intro, dark }: { title: string; intro?: string; dark?: boolean }) {
  return (
    <header className={dark ? 'bg-ink text-white' : 'bg-fog'}>
      <div className="mx-auto max-w-page px-5 py-12 md:px-10 md:py-20">
        <h1 className="font-display text-5xl leading-[0.92] md:text-7xl lg:text-8xl">{title}</h1>
        {intro && <p className={`mt-4 max-w-2xl text-lg ${dark ? 'text-white/75' : 'text-steel'}`}>{intro}</p>}
      </div>
    </header>
  );
}
