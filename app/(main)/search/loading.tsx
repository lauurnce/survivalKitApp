export default function Loading() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Page header skeleton — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="h-4 w-20 bg-paper/20 mb-4" />
          <div className="h-3 w-24 bg-paper/20 mb-4" />
          <div className="h-10 w-1/3 bg-paper/20" />
        </div>
      </div>

      {/* Search body skeleton — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="max-w-wide mx-auto">
          {/* Search input skeleton */}
          <div className="relative mb-8">
            <div className="h-12 w-full bg-ink-faint/20 rounded border border-ink-faint" />
          </div>
          {/* Popular topics skeleton */}
          <div className="flex flex-col gap-4">
            <div className="h-3 w-32 bg-ink-faint/30" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-24 bg-ink-faint/20 border border-ink-faint/40 rounded px-3 py-1.5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}