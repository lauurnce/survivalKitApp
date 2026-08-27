export default function Loading() {
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      {/* Page header skeleton — dark navy */}
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="h-4 w-24 bg-paper/20 mb-4" />
          <div className="h-3 w-20 bg-paper/20 mb-4" />
          <div className="h-10 w-3/4 bg-paper/20" />
        </div>
      </div>

      {/* Module list skeleton — cream */}
      <div className="flex-1 px-6 py-12 md:px-16 md:py-16 animate-pulse">
        <div className="max-w-wide mx-auto">
          <div className="mt-6 flex justify-end">
            <div className="h-10 w-40 bg-ink-faint/20 rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col divide-y divide-ink-faint/30 max-w-wide mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <article key={i} className="group relative flex items-start gap-3 sm:gap-6 py-8 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150">
              <div className="absolute inset-0 bg-ink-faint/10" />
              <div className="relative z-0 pointer-events-none font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
                <div className="h-4 w-8 bg-ink-faint/20" />
              </div>
              <div className="relative z-0 pointer-events-none min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <div className="h-8 w-3/4 bg-ink-faint/20" />
                </div>
                <div className="h-3 w-20 bg-ink-faint/20" />
              </div>
              <div className="relative z-10 shrink-0">
                <div className="h-10 w-10 bg-ink-faint/20 rounded-xl" />
              </div>
              <div className="relative z-0 pointer-events-none hidden sm:block font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1">
                <div className="h-4 w-4 bg-ink-faint/20" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}