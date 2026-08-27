export default function Loading() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Page header skeleton — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="h-4 w-32 bg-paper/20 mb-4" />
          <div className="h-3 w-20 bg-paper/20 mb-4" />
          <div className="h-10 w-3/4 bg-paper/20" />
        </div>
      </div>

      {/* Subject list skeleton — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="flex flex-col gap-12 max-w-wide mx-auto">
          {[1, 2].map((sem) => (
            <section key={sem}>
              {/* Semester label skeleton */}
              <div className="bg-navy px-4 py-3 mb-6 inline-block">
                <div className="h-3 w-24 bg-paper/20" />
              </div>

              <div className="flex flex-col divide-y divide-ink-faint/30">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-6 py-8 -mx-4 px-4">
                    <div className="h-4 w-8 bg-ink-faint/20 mt-1" />
                    <div className="h-9 w-9 bg-ink-faint/20 mt-0.5 rounded" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="h-6 w-3/4 bg-ink-faint/20 mb-1" />
                          <div className="h-3 w-20 bg-ink-faint/20" />
                          <div className="h-3 w-24 bg-ink-faint/20 mt-2" />
                        </div>
                        <div className="h-4 w-4 bg-ink-faint/20 mt-1" />
                      </div>
                      <div className="h-3 w-16 bg-ink-faint/20 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}