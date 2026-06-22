"use client";

import { useState } from "react";

interface FunnelStep {
  type: string;
  label: string;
  hint: string;
  unique: number;
}

interface DauDay {
  date: string;
  unique: number;
}

interface TopItem {
  label: string;
  count: number;
}

interface TopSection {
  heading: string;
  module_title: string;
  count: number;
}

interface PendingUnlock {
  id: string;
  device_id: string;
  gcash_ref: string;
  amount: number;
  created_at: string;
  module_title: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  source: "coming_soon" | "paywall";
  device_type: "mobile" | "desktop";
  willing_to_pay: "yes" | "no" | "maybe" | null;
  needs_capstone: boolean | null;
  year_label: string | null;
  subject_title: string | null;
  module_title: string | null;
  created_at: string;
}

interface Props {
  funnel: FunnelStep[];
  dau: DauDay[];
  topSubjects: TopItem[];
  topModules: TopItem[];
  topSections: TopSection[];
  pendingUnlocks: PendingUnlock[];
  totalUniqueUsers: number;
  todayUsers: number;
  last7Sessions: number;
  approvedUnlocks: number;
  activeNow: number;
  newUsers: number;
  recurringUsers: number;
  totalRevenue: number;
  waitlistEntries: WaitlistEntry[];
}

function Stat({
  value,
  label,
  accent,
  dot,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
  dot?: boolean;
}) {
  return (
    <div className={`border p-6 ${accent ? "border-accent/40 bg-accent/5" : "border-ink-faint/30"}`}>
      <div className="flex items-baseline gap-2 mb-1">
        {dot && (
          <span
            className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0 self-center"
            title="Live — active within the last 15 minutes"
          />
        )}
        <p className={`font-serif text-4xl ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      </div>
      <p className="label-sm text-ink-muted">{label}</p>
    </div>
  );
}

function BarChart({ data, label }: { data: TopItem[]; label: string }) {
  if (!data.length) return (
    <div>
      <p className="label mb-4">{label}</p>
      <p className="font-sans text-xs text-ink-faint">No data yet.</p>
    </div>
  );
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div>
      <p className="label mb-4">{label}</p>
      <div className="space-y-2">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="font-sans text-xs text-ink-muted w-28 sm:w-40 truncate shrink-0" title={item.label}>{item.label}</span>
            <div className="flex-1 bg-ink-faint/20 h-4">
              <div className="h-4 bg-accent" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
            <span className="font-mono text-xs text-ink-muted w-8 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DauChart({ data }: { data: DauDay[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (!data.length) return (
    <div>
      <p className="label mb-4">Daily Active Users — 30 days</p>
      <p className="font-sans text-xs text-ink-faint">No data yet.</p>
    </div>
  );
  const max = Math.max(...data.map(d => d.unique), 1);
  // Square-root scale: compresses big spikes so low-traffic days stay visible
  // while taller days still read as taller. sqrt handles 0 cleanly (unlike log).
  const sqrtMax = Math.sqrt(max);
  const barHeight = (n: number) =>
    n > 0 ? Math.max((Math.sqrt(n) / sqrtMax) * 96, 6) : 2;
  const showLabels = data.length <= 15;
  return (
    <div>
      <p className="label mb-4">Daily Active Users — 30 days</p>
      <div className="flex items-end gap-0.5 h-28">
        {data.map((item, i) => (
          <div
            key={item.date}
            className="relative flex-1 h-full flex flex-col justify-end items-center gap-1 cursor-default"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === i && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full z-10 whitespace-nowrap bg-ink text-paper px-2 py-1 shadow-md pointer-events-none">
                <p className="font-mono text-[10px] leading-tight">{item.date}</p>
                <p className="font-mono text-[10px] leading-tight">
                  {item.unique} {item.unique === 1 ? "user" : "users"}
                </p>
              </div>
            )}
            <div
              className={`w-full transition-colors ${hover === i ? "bg-accent" : "bg-ink"}`}
              style={{ height: `${barHeight(item.unique)}px` }}
            />
            {showLabels && (
              <span className="font-mono text-[8px] text-ink-faint" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                {item.date.slice(5)}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="font-mono text-[9px] text-ink-faint">{data[0].date}</span>
        <span className="font-mono text-[9px] text-ink-faint">{data[data.length - 1].date}</span>
      </div>
    </div>
  );
}

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const top = steps[0]?.unique ?? 1;
  const isEmpty = top === 0;
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <p className="label">Onboarding Funnel</p>
        <span className="font-sans text-[10px] text-ink-faint">unique devices, all-time</span>
      </div>
      {isEmpty ? (
        <p className="font-sans text-xs text-ink-faint">No events recorded yet.</p>
      ) : (
        <div className="space-y-0.5">
          {steps.map((step, i) => {
            const prev = steps[i - 1]?.unique ?? step.unique;
            const pctOfTotal = top > 0 ? Math.round((step.unique / top) * 100) : 0;
            const dropPct = i > 0 && prev > 0 ? Math.round(((prev - step.unique) / prev) * 100) : 0;
            const dropped = i > 0 ? prev - step.unique : 0;
            return (
              <div key={step.type}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-1 pl-28 sm:pl-44">
                    {dropped > 0 ? (
                      <span className="font-mono text-[10px] text-accent">
                        ↓ {dropPct}% dropped ({dropped} users)
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-ink-faint">↓ no drop</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3" title={step.hint}>
                  <span className="font-sans text-xs text-ink w-28 sm:w-44 shrink-0">{step.label}</span>
                  <div className="flex-1 bg-ink-faint/15 h-7 relative">
                    <div
                      className="h-7 bg-ink transition-all"
                      style={{
                        width: `${(step.unique / Math.max(top, 1)) * 100}%`,
                        opacity: Math.max(0.3, 1 - i * 0.1),
                      }}
                    />
                  </div>
                  <div className="w-20 sm:w-28 text-right shrink-0">
                    <span className="font-mono text-xs text-ink">{step.unique.toLocaleString()}</span>
                    <span className="font-mono text-[10px] text-ink-faint ml-2">({pctOfTotal}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WaitlistPieChart({ entries }: { entries: WaitlistEntry[] }) {
  // Group by year_label for paywall entries, fallback to source label
  const counts = new Map<string, number>();
  for (const e of entries) {
    const key = e.year_label ?? (e.source === "coming_soon" ? "Coming Soon" : "Unknown");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = entries.length;
  if (total === 0) return null;

  const slices = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));

  // Simple CSS-based donut using conic-gradient
  const COLORS = ["#1a1a2e", "#4a90a4", "#c9a84c", "#8b5e3c", "#6b8c6b", "#9b6b9b"];
  let cumPct = 0;
  const gradientStops = slices.map((s, i) => {
    const start = cumPct;
    cumPct += s.pct;
    return `${COLORS[i % COLORS.length]} ${start}% ${cumPct}%`;
  });

  return (
    <div className="mb-8">
      <p className="label-sm text-ink-muted mb-4">Signups by Year Level</p>
      <div className="flex flex-col sm:flex-row gap-8 items-start">
        <div
          className="shrink-0 w-36 h-36 rounded-full"
          style={{ background: `conic-gradient(${gradientStops.join(", ")})` }}
          title="Waitlist source breakdown"
        />
        <div className="flex flex-col gap-2">
          {slices.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <span
                className="w-3 h-3 shrink-0 inline-block"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="font-sans text-sm text-ink">{s.label}</span>
              <span className="font-mono text-xs text-ink-muted">{s.count} ({s.pct}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WaitlistSection({ entries }: { entries: WaitlistEntry[] }) {
  const total = entries.length;
  const comingSoon = entries.filter(e => e.source === "coming_soon").length;
  const paywall = entries.filter(e => e.source === "paywall").length;
  const mobile = entries.filter(e => e.device_type === "mobile").length;
  const desktop = entries.filter(e => e.device_type === "desktop").length;
  const wtp = { yes: 0, no: 0, maybe: 0 };
  entries.filter(e => e.source === "paywall" && e.willing_to_pay).forEach(e => {
    if (e.willing_to_pay) wtp[e.willing_to_pay]++;
  });
  const capstoneYes = entries.filter(e => e.source === "coming_soon" && e.needs_capstone === true).length;
  const capstoneNo  = entries.filter(e => e.source === "coming_soon" && e.needs_capstone === false).length;

  // Build sorted list of unique "YYYY-MM" months present in the data
  const months = Array.from(
    new Set(entries.map(e => e.created_at.slice(0, 7)))
  ).sort().reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] ?? "");

  function buildCSV(rows: WaitlistEntry[]) {
    const cell = (value: string) => {
      const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const header = "Name,Email,Source,Device,Year,Subject,Module,Willing to Pay,Needs Capstone,Date";
    const lines = rows.map(e =>
      [
        cell(e.name),
        cell(e.email),
        cell(e.source ?? ""),
        cell(e.device_type ?? ""),
        cell(e.year_label ?? ""),
        cell(e.subject_title ?? ""),
        cell(e.module_title ?? ""),
        cell(e.willing_to_pay ?? ""),
        cell(e.needs_capstone === null ? "" : String(e.needs_capstone)),
        cell(new Date(e.created_at).toLocaleDateString("en-PH")),
      ].join(",")
    );
    return [header, ...lines].join("\n");
  }

  function triggerDownload(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMonth() {
    if (!selectedMonth) return;
    const filtered = entries.filter(e => e.created_at.startsWith(selectedMonth));
    triggerDownload(buildCSV(filtered), `waitlist-${selectedMonth}.csv`);
  }

  if (total === 0) {
    return (
      <section className="mb-16">
        <p className="label mb-2">Waitlist</p>
        <p className="font-sans text-xs text-ink-faint">No signups yet.</p>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex flex-wrap items-baseline gap-4 mb-6">
        <p className="label">Waitlist</p>
        <span className="font-mono text-xs text-ink-faint">{total} total</span>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="font-mono text-xs text-ink bg-paper border border-ink-faint/30 px-2 py-1 outline-none focus:border-ink transition-colors duration-150"
          >
            {months.map(m => {
              const [y, mo] = m.split("-");
              const label = new Date(Number(y), Number(mo) - 1).toLocaleString("en-PH", { month: "long", year: "numeric" });
              const count = entries.filter(e => e.created_at.startsWith(m)).length;
              return <option key={m} value={m}>{label} ({count})</option>;
            })}
          </select>
          <button
            onClick={downloadMonth}
            disabled={!selectedMonth}
            className="font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150 disabled:opacity-40"
          >
            Download CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide">
        <Stat value={comingSoon} label="Coming Soon Signups" />
        <Stat value={paywall} label="Paywall Signups" />
        <Stat value={mobile} label="Mobile" />
        <Stat value={desktop} label="Desktop" />
      </div>

      {/* Pie chart — signups by year level */}
      <WaitlistPieChart entries={entries} />

      {paywall > 0 && (
        <div className="mb-6">
          <p className="label-sm text-ink-muted mb-3">Willing to Pay (paywall group)</p>
          <div className="flex gap-4">
            {(["yes", "no", "maybe"] as const).map(k => (
              <div key={k} className="border border-ink-faint/30 px-5 py-4 text-center min-w-[72px]">
                <p className="font-serif text-2xl text-ink mb-1">{wtp[k]}</p>
                <p className="label-sm text-ink-muted capitalize">{k}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {comingSoon > 0 && (
        <div className="mb-8">
          <p className="label-sm text-ink-muted mb-3">Needs Capstone Resources (coming-soon group)</p>
          <div className="flex gap-4">
            {([["Yes", capstoneYes], ["No", capstoneNo]] as [string, number][]).map(([label, count]) => (
              <div key={label} className="border border-ink-faint/30 px-5 py-4 text-center min-w-[72px]">
                <p className="font-serif text-2xl text-ink mb-1">{count}</p>
                <p className="label-sm text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-w-wide">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-faint/30">
              {["Name", "Email", "Year", "Subject", "Module", "Device", "Date"].map(h => (
                <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-ink-faint/15">
                <td className="py-3 pr-6 font-sans text-sm text-ink">{e.name}</td>
                <td className="py-3 pr-6 font-sans text-sm text-ink-muted">{e.email}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{e.year_label ?? "—"}</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{e.subject_title ?? "—"}</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{e.module_title ?? "—"}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{e.device_type}</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                  {new Date(e.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminDashboard({
  funnel, dau, topSubjects, topModules, topSections,
  pendingUnlocks, totalUniqueUsers, todayUsers, last7Sessions,
  approvedUnlocks, activeNow, newUsers, recurringUsers, totalRevenue,
  waitlistEntries,
}: Props) {
  const unlockClicks    = funnel.find(s => s.type === "unlock_click")?.unique ?? 0;
  const unlockSubmitted = funnel.find(s => s.type === "unlock_submitted")?.unique ?? 0;

  const [queue, setQueue] = useState<PendingUnlock[]>(pendingUnlocks);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  async function handleUnlock(id: string, action: "approve" | "reject") {
    setProcessing(prev => new Set(prev).add(id));
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) setQueue(prev => prev.filter(u => u.id !== id));
    } finally {
      setProcessing(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div>
          <p className="label mb-2">Admin</p>
          <h1 className="font-serif text-display-md text-ink">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin" className="label-sm text-ink-muted hover:text-ink transition-colors">
            Refresh
          </a>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="label-sm text-ink-faint hover:text-ink transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Key stats */}
      <section className="mb-16">
        <p className="label mb-4">Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat value={activeNow} label="Active Now (15 min)" dot />
          <Stat value={totalUniqueUsers.toLocaleString()} label="Total Users" />
          <Stat value={newUsers} label="New Users (3 days)" />
          <Stat value={recurringUsers} label="Recurring Users" />
          <Stat value={todayUsers} label="Active Today (PH)" />
          <Stat value={last7Sessions} label="7-day Sessions" />
          <Stat value={`₱${totalRevenue.toLocaleString()}`} label="Total Revenue" />
          <Stat
            value={pendingUnlocks.length > 0 ? pendingUnlocks.length : approvedUnlocks}
            label={pendingUnlocks.length > 0 ? "Pending Unlocks ⚠" : "Approved Unlocks"}
            accent={pendingUnlocks.length > 0}
          />
        </div>
      </section>

      {/* Onboarding funnel */}
      <section className="mb-16 max-w-wide">
        <FunnelChart steps={funnel} />
      </section>

      {/* DAU chart */}
      <section className="mb-16 max-w-wide">
        <DauChart data={dau} />
      </section>

      {/* Content engagement */}
      <section className="mb-16">
        <p className="label mb-6">Content Engagement</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-wide">
          <BarChart data={topSubjects} label="Top Subjects" />
          <BarChart data={topModules} label="Top Modules" />
          <BarChart
            data={topSections.map(s => ({ label: s.heading, count: s.count }))}
            label="Top Sections"
          />
        </div>
      </section>

      {/* Unlock funnel */}
      <section className="mb-16">
        <p className="label mb-6">Unlock Funnel</p>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {[
            { label: "Tapped Unlock", value: unlockClicks },
            { label: "Submitted Payment", value: unlockSubmitted },
            { label: "Approved", value: approvedUnlocks },
          ].map(item => (
            <div key={item.label} className="border border-ink-faint/30 p-5 text-center">
              <p className="font-serif text-3xl text-ink mb-1">{item.value}</p>
              <p className="label-sm text-ink-muted">{item.label}</p>
            </div>
          ))}
        </div>
        {unlockClicks > 0 && (
          <p className="font-sans text-xs text-ink-faint mt-3">
            Conversion: {unlockSubmitted}/{unlockClicks} who tapped submitted
            {approvedUnlocks > 0 && ` · ${approvedUnlocks}/${unlockSubmitted} approved`}
          </p>
        )}
      </section>

      {/* Pending unlocks queue */}
      {queue.length > 0 ? (
        <section className="mb-16">
          <div className="flex items-baseline gap-3 mb-6">
            <p className="label">Pending Unlocks</p>
            <span className="font-mono text-xs text-accent">{queue.length} waiting</span>
          </div>
          <div className="overflow-x-auto max-w-wide">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-ink-faint/30">
                  {["Module", "GCash Ref", "Amount", "Device", "Submitted", "Action"].map(h => (
                    <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map(u => {
                  const busy = processing.has(u.id);
                  return (
                    <tr key={u.id} className="border-b border-ink-faint/15">
                      <td className="py-3 pr-6 font-sans text-sm text-ink">{u.module_title}</td>
                      <td className="py-3 pr-6 font-mono text-sm text-ink font-medium">{u.gcash_ref}</td>
                      <td className="py-3 pr-6 font-sans text-sm text-ink">₱{u.amount}</td>
                      <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{u.device_id.slice(0, 10)}…</td>
                      <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                        {new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnlock(u.id, "approve")}
                            disabled={busy}
                            className="font-mono text-xs text-paper bg-ink px-3 py-1 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {busy ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleUnlock(u.id, "reject")}
                            disabled={busy}
                            className="font-mono text-xs text-ink-muted border border-ink-faint/40 px-3 py-1 hover:text-ink hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mb-16">
          <p className="label mb-2">Pending Unlocks</p>
          <p className="font-sans text-xs text-ink-faint">No pending unlock requests.</p>
        </section>
      )}

      <WaitlistSection entries={waitlistEntries} />

    </main>
  );
}
