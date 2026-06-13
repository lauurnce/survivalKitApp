export default function Loading() {
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20 animate-pulse">
      <div className="h-3 w-24 bg-ink-faint/40 mb-12" />
      <div className="h-3 w-16 bg-ink-faint/30 mb-4" />
      <div className="h-14 w-2/3 bg-ink-faint/30 mb-8" />
      <div className="space-y-3 max-w-prose">
        <div className="h-3 bg-ink-faint/20 w-full" />
        <div className="h-3 bg-ink-faint/20 w-5/6" />
        <div className="h-3 bg-ink-faint/20 w-4/6" />
      </div>
    </main>
  );
}
