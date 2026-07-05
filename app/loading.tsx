export default function Loading() {
  return (
    <main className="relative min-h-screen bg-paper flex flex-col px-6 py-12 md:px-16 md:py-20">
      <div className="w-full max-w-wide mx-auto flex-1 flex flex-col gap-16">
      {/* Header skeleton */}
      <div className="h-3 w-32 bg-ink-faint/40 animate-pulse" />

      {/* Content skeleton */}
      <div className="max-w-wide animate-pulse">
        <div className="h-3 w-20 bg-ink-faint/30 mb-6" />
        <div className="space-y-3 mb-8">
          <div className="h-12 w-3/4 bg-ink-faint/25" />
          <div className="h-12 w-1/2 bg-ink-faint/25" />
        </div>
        <div className="space-y-3 max-w-prose mb-10">
          <div className="h-3 bg-ink-faint/20 w-full" />
          <div className="h-3 bg-ink-faint/20 w-5/6" />
          <div className="h-3 bg-ink-faint/20 w-4/6" />
        </div>
        <div className="h-12 w-40 bg-ink-faint/30" />
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto flex items-center justify-between animate-pulse">
        <div className="h-2 w-24 bg-ink-faint/20" />
        <div className="h-2 w-16 bg-ink-faint/20" />
      </div>
      </div>

      {/* Spinner overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
        <div className="w-12 h-12 rounded-full border-2 border-ink-faint/20 border-t-accent animate-spin" />
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          Loading
        </span>
      </div>
    </main>
  );
}
