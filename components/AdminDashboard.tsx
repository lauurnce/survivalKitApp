"use client";

interface TopItem {
  subject_id?: string | null;
  module_id?: string | null;
  // Supabase returns joined rows as array in PostgREST
  subjects?: { title: string } | { title: string }[] | null;
  modules?: { title: string } | { title: string }[] | null;
}

interface RecentEvent {
  event_type: string;
  created_at: string;
}

interface Props {
  topSubjects: TopItem[];
  topModules: TopItem[];
  recentEvents: RecentEvent[];
  unlockFunnel: { clicks: number; submitted: number; approved: number };
  adminPw: string;
}

function getTitle(rel: { title: string } | { title: string }[] | null | undefined): string {
  if (!rel) return "unknown";
  if (Array.isArray(rel)) return rel[0]?.title ?? "unknown";
  return rel.title;
}

function countBy<T>(arr: T[], key: (item: T) => string): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of arr) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function groupByDay(events: RecentEvent[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of events) {
    const day = e.created_at.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function BarChart({ data, label }: { data: { label: string; count: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <p className="label mb-4">{label}</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="font-sans text-xs text-ink-muted w-48 truncate shrink-0">{item.label}</span>
            <div className="flex-1 bg-ink-faint/20 h-4">
              <div
                className="h-4 bg-accent"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-ink-muted w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <p className="label mb-4">Events per day (last 7 days)</p>
      <div className="flex items-end gap-1 h-20">
        {data.map((item) => (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-accent"
              style={{ height: `${(item.count / max) * 64}px` }}
            />
            <span className="font-mono text-[9px] text-ink-faint rotate-45 origin-left">{item.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboard({ topSubjects, topModules, recentEvents, unlockFunnel, adminPw }: Props) {
  const subjectCounts = countBy(topSubjects, (s) => getTitle(s.subjects) === "unknown" ? (s.subject_id ?? "unknown") : getTitle(s.subjects));
  const moduleCounts = countBy(topModules, (m) => getTitle(m.modules) === "unknown" ? (m.module_id ?? "unknown") : getTitle(m.modules));
  const dayData = groupByDay(recentEvents);

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="label mb-2">Admin Dashboard</p>
          <h1 className="font-serif text-display-md text-ink">Analytics</h1>
        </div>
        <a
          href={`/admin?pw=${adminPw}`}
          className="label-sm hover:text-ink transition-colors"
        >
          Refresh
        </a>
      </div>

      {/* Unlock funnel */}
      <section className="mb-16">
        <p className="label mb-6">Unlock Funnel</p>
        <div className="grid grid-cols-3 gap-4 max-w-lg">
          {[
            { label: "Clicks", value: unlockFunnel.clicks },
            { label: "Submitted", value: unlockFunnel.submitted },
            { label: "Approved", value: unlockFunnel.approved },
          ].map((item) => (
            <div key={item.label} className="border border-ink-faint/30 p-6 text-center">
              <p className="font-serif text-4xl text-ink mb-1">{item.value}</p>
              <p className="label-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Time series */}
      <section className="mb-16 max-w-wide">
        <TimeChart data={dayData} />
      </section>

      {/* Top subjects & modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-wide">
        <section>
          <BarChart data={subjectCounts} label="Top Subjects" />
        </section>
        <section>
          <BarChart data={moduleCounts} label="Top Modules" />
        </section>
      </div>
    </main>
  );
}
