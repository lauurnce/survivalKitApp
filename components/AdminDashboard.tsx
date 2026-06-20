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
  if (!data.length) return (
    <div>
      <p className="label mb-4">Daily Active Users — 30 days</p>
      <p className="font-sans text-xs text-ink-faint">No data yet.</p>
    </div>
  );
  const max = Math.max(...data.map(d => d.unique), 1);
  const showLabels = data.length <= 15;
  return (
    <div>
      <p className="label mb-4">Daily Active Users — 30 days</p>
      <div className="flex items-end gap-0.5 h-28">
        {data.map(item => (
          <div
            key={item.date}
            className="flex-1 flex flex-col justify-end items-center gap-1"
            title={`${item.date}: ${item.unique} users`}
          >
            <div
              className="w-full bg-ink hover:bg-accent transition-colors cursor-default"
              style={{ height: `${Math.max((item.unique / max) * 96, 2)}px` }}
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

  function downloadCSV() {
    // RFC-4180 quoting + neutralize spreadsheet formula injection (=, +, -, @)
    const cell = (value: string) => {
      const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const header = "Name,Email,Source,Device,Willing to Pay,Needs Capstone,Date";
    const rows = entries.map(e =>
      [
        cell(e.name),
        cell(e.email),
        e.source,
        e.device_type,
        e.willing_to_pay ?? "",
        e.needs_capstone === null ? "" : String(e.needs_capstone),
        new Date(e.created_at).toLocaleDateString("en-PH"),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="flex items-baseline gap-4 mb-6">
        <p className="label">Waitlist</p>
        <span className="font-mono text-xs text-ink-faint">{total} total</span>
        <button
          onClick={downloadCSV}
          className="font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          Download CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide">
        <Stat value={comingSoon} label="Coming Soon Signups" />
        <Stat value={paywall} label="Paywall Signups" />
        <Stat value={mobile} label="Mobile" />
        <Stat value={desktop} label="Desktop" />
      </div>

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
              {["Name", "Email", "Source", "Device", "Date"].map(h => (
                <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b border-ink-faint/15">
                <td className="py-3 pr-6 font-sans text-sm text-ink">{e.name}</td>
                <td className="py-3 pr-6 font-sans text-sm text-ink-muted">{e.email}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{e.source}</td>
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
