export default function Loading() {
  return (
    <main className="min-h-screen bg-paper">
      {/* Top nav skeleton — dark navy */}
      <div className="bg-navy px-6 py-8 md:px-16 border-b border-paper/10 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="h-4 w-24 bg-paper/20" />
        </div>
      </div>

      {/* Module header skeleton — dark navy */}
      <header className="bg-navy px-6 pt-10 pb-12 md:px-16 border-b border-paper/10 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="h-3 w-24 bg-paper/20 mb-4" />
          <div className="h-10 w-3/4 bg-paper/20" />
        </div>
      </header>

      {/* Article content skeleton — cream */}
      <article className="px-6 py-12 md:px-16 animate-pulse">
        <div className="max-w-wide mx-auto space-y-16">
          {/* Paywall teaser skeleton */}
          <div className="border border-ink-faint/30 p-6">
            <div className="h-4 w-32 bg-ink-faint/20 mb-2" />
            <div className="h-4 w-3/4 bg-ink-faint/20 mb-2" />
            <div className="h-4 w-1/2 bg-ink-faint/20" />
            <div className="h-10 w-40 bg-accent/10 rounded-xl mt-4" />
          </div>

          {/* Content sections skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-8">
              <div className="h-6 w-1/3 bg-ink-faint/20" />
              <div className="space-y-4">
                <div className="h-4 bg-ink-faint/20 w-full" />
                <div className="h-4 bg-ink-faint/20 w-5/6" />
                <div className="h-4 bg-ink-faint/20 w-4/5" />
                <div className="h-4 bg-ink-faint/20 w-3/4" />
                <div className="h-4 bg-ink-faint/20 w-2/3" />
              </div>
              <div className="h-32 bg-ink-faint/10 rounded-lg" />
            </div>
          ))}

          {/* Next module CTA skeleton */}
          <div className="border-t border-ink-faint/20 pt-12">
            <div className="flex items-center justify-between gap-4 mb-10">
              <div className="h-4 w-48 bg-ink-faint/20" />
              <div className="h-10 w-32 bg-ink-faint/20 rounded-xl" />
            </div>
            <div className="h-3 w-20 bg-ink-faint/20 mb-4" />
            <div className="group flex items-center justify-between gap-6 bg-navy px-8 py-6">
              <div className="h-10 w-3/4 bg-paper/20" />
              <div className="h-8 w-8 bg-accent/20 flex-shrink-0 rounded" />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}