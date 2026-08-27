export default function Loading() {
  return (
    <div className="min-h-screen bg-paper lg:flex animate-pulse">
      {/* Nav rail skeleton */}
      <nav className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r border-taupe/30 bg-paper">
        <div className="h-16 w-full bg-ink-faint/10 border-b border-taupe/30" />
        <div className="flex-1 p-3">
          <div className="h-11 w-full bg-ink-faint/10 rounded-xl mb-2" />
          <div className="h-11 w-full bg-ink-faint/10 rounded-xl mb-2" />
          <div className="h-11 w-full bg-ink-faint/10 rounded-xl mb-2" />
          <div className="h-11 w-full bg-ink-faint/10 rounded-xl mb-2" />
          <div className="h-11 w-full bg-ink-faint/10 rounded-xl mb-2" />
        </div>
        <div className="p-6 border-t border-taupe/30">
          <div className="h-18 w-18 bg-ink-faint/10 rounded-full mx-auto mb-3" />
          <div className="h-3 w-24 bg-ink-faint/10 mx-auto" />
          <div className="h-3 w-32 bg-ink-faint/10 mx-auto mt-2" />
        </div>
      </nav>

      {/* Main content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          <div className="h-8 w-8 bg-ink-faint/10 rounded" />
          <div className="h-6 w-20 bg-ink-faint/10" />
        </div>
        <main className="mx-auto max-w-wide px-4 sm:px-8 py-6 space-y-10">
          <header className="space-y-2">
            <div className="h-3 w-16 bg-ink-faint/30" />
            <div className="h-10 w-2/3 bg-ink-faint/20" />
            <div className="h-4 w-full bg-ink-faint/20" />
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-ink-faint/10 rounded-xl border border-taupe/30" />
            ))}
          </div>
          <section className="space-y-3">
            <div>
              <div className="h-3 w-16 bg-ink-faint/30" />
              <div className="h-6 w-2/3 bg-ink-faint/20" />
            </div>
            <div className="h-32 bg-ink-faint/10 rounded-xl border border-taupe/30" />
          </section>
        </main>
      </div>
    </div>
  );
}