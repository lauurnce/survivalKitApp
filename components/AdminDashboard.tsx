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

interface TransactionRow {
  id: string;
  paid_at: string;
  device_id: string;
  year_label: string;
  scope: string;
  amount: number;            // centavos
  paymongo_link_id: string;
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

interface WaitlistAgg {
  total: number;
  by_year: { year_label: string; count: number }[] | null;
  by_subject: { subject_title: string; year_label: string; count: number }[] | null;
}

interface ProfilesAgg {
  total: number;
  by_pathway: { pathway: string; count: number }[] | null;
  by_university: { university: string; count: number }[] | null;
  by_major: { major: string; count: number }[] | null;
}

interface UnreflectedPayment {
  linkId: string;
  reference: string;
  amount: number;          // centavos
  description: string;
  paidAt: string | null;
  yearId: string | null;
  subjectId: string | null;
  deviceId: string | null;
  userId: string | null;
  reason: "no_subscription" | "malformed_remarks";
  hasLedgerRow: boolean;
}

interface Props {
  funnel: FunnelStep[];
  dau: DauDay[];
  topSubjects: TopItem[];
  topModules: TopItem[];
  topSections: TopSection[];
  totalUniqueUsers: number;
  todayUsers: number;
  last7Sessions: number;
  approvedUnlocks: number;
  activeNow: number;
  newUsers: number;
  recurringUsers: number;
  totalRevenue: number;
  activeSubscribers: number;
  newSubscribersToday: number;
  waitlistEntries: WaitlistEntry[];
  waitlistAgg: WaitlistAgg;
  profilesAgg: ProfilesAgg;
  transactions: TransactionRow[];
  unreflectedPayments: UnreflectedPayment[];
  reconcileError: string | null;
}

/**
 * Outlined card header that introduces each major section of the dashboard.
 * A thin ink-outlined bar on the paper background — frames the section as a
 * zone rather than sitting on top of it like a colored strip. The numbered
 * eyebrow + serif title sit on the left; an optional summary string (a count
 * or headline metric) sits on the right. Sticky so the current section stays
 * labelled as you scroll through a long page.
 */
function SectionBand({
  eyebrow,
  title,
  summary,
}: {
  eyebrow: string;
  title: string;
  summary?: string;
}) {
  return (
    <div className="sticky top-4 z-20 mb-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border border-ink/30 bg-paper px-5 py-4 shadow-sm">
        <span className="label-sm text-ink-faint font-mono">{eyebrow}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-none">{title}</h2>
        {summary && (
          <span className="ml-auto font-mono text-xs text-ink-muted">{summary}</span>
        )}
      </div>
    </div>
  );
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
    <div
      className={`border p-6 transition-colors duration-150 ${
        accent
          ? "border-accent/40 bg-accent/5 hover:border-accent/70"
          : "border-ink-faint/30 hover:border-ink/40"
      }`}
    >
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
          <div key={item.label} className="group flex items-center gap-3">
            <span className="font-sans text-xs text-ink-muted w-28 sm:w-40 truncate shrink-0" title={item.label}>{item.label}</span>
            <div className="flex-1 bg-ink-faint/20 h-4">
              <div className="h-4 bg-accent transition-all duration-300 group-hover:bg-accent-dark" style={{ width: `${(item.count / max) * 100}%` }} />
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
    n > 0 ? Math.max((Math.sqrt(n) / sqrtMax) * 140, 8) : 2;
  const showLabels = data.length <= 15;
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <p className="label">Daily Active Users</p>
        <span className="font-sans text-[10px] text-ink-faint">30 days · hover a bar for detail</span>
      </div>
      <div className="flex items-end gap-0.5 h-40">
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
                <div className="flex items-center gap-3 py-1 px-2 -mx-2 rounded-sm hover:bg-ink-faint/10 transition-colors" title={step.hint}>
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

function WaitlistPieChart({ byYear, total }: { byYear: { year_label: string; count: number }[]; total: number }) {
  if (total === 0 || byYear.length === 0) return null;

  const slices = byYear.map((r) => ({
    label: r.year_label,
    count: r.count,
    pct: Math.round((r.count / total) * 100),
  }));

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

function WaitlistSubjectDemand({ bySubject }: { bySubject: { subject_title: string; year_label: string; count: number }[] }) {
  const [expanded, setExpanded] = useState(false);

  if (bySubject.length === 0) return null;

  const max = bySubject[0].count;
  const visible = expanded ? bySubject : bySubject.slice(0, 5);
  const hasMore = bySubject.length > 5;

  return (
    <div className="mb-8 max-w-wide mx-auto">
      <p className="label-sm text-ink-muted mb-4">Most Requested Subjects</p>
      <div className="flex flex-col gap-2">
        {visible.map((r) => (
          <div key={r.subject_title} className="group flex items-center gap-3">
            <div className="w-48 shrink-0 text-right">
              <span className="font-sans text-sm text-ink">{r.subject_title}</span>
              {r.year_label && (
                <span className="font-mono text-[10px] text-ink-faint ml-2">{r.year_label}</span>
              )}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div
                className="h-4 bg-navy transition-all duration-300 group-hover:bg-accent"
                style={{ width: `${Math.max((r.count / max) * 100, 4)}%` }}
              />
              <span className="font-mono text-xs text-ink-muted">{r.count}</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          {expanded ? `Minimize ↑` : `Reveal all (${bySubject.length - 5} more) ↓`}
        </button>
      )}
    </div>
  );
}

function TransactionsSection({ rows }: { rows: TransactionRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 5);
  const hasMore = rows.length > 5;

  if (rows.length === 0) {
    return <p className="font-sans text-xs text-ink-faint">No transactions yet.</p>;
  }
  return (
    <div className="max-w-wide mx-auto">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-faint/30">
              {["Date", "Device", "Year", "Plan", "Amount", "Ref"].map(h => (
                <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(t => (
              <tr key={t.id} className="border-b border-ink-faint/15 hover:bg-ink-faint/5 transition-colors">
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                  {new Date(t.paid_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{t.device_id.slice(0, 8)}…</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{t.year_label}</td>
                <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{t.scope}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink">₱{(t.amount / 100).toFixed(2)}</td>
                <td className="py-3 pr-6 font-mono text-xs text-ink-faint">{t.paymongo_link_id.slice(0, 12)}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          {expanded ? `Show less ↑` : `Show all ${rows.length} transactions ↓`}
        </button>
      )}
    </div>
  );
}

function ReconcileSection({
  rows,
  error,
}: {
  rows: UnreflectedPayment[];
  error: string | null;
}) {
  // Track per-row grant state (keyed by reference) so each button reflects its
  // own status.
  const [state, setState] = useState<Record<string, "idle" | "granting" | "done" | "error">>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  async function grant(reference: string) {
    setState(s => ({ ...s, [reference]: "granting" }));
    setMsg(m => ({ ...m, [reference]: "" }));
    try {
      const res = await fetch("/api/admin/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        deduped?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setState(s => ({ ...s, [reference]: "error" }));
        setMsg(m => ({ ...m, [reference]: data.error ?? "Grant failed" }));
        return;
      }
      setState(s => ({ ...s, [reference]: "done" }));
      setMsg(m => ({
        ...m,
        [reference]: data.deduped ? "Already recorded — access ensured" : "Access granted",
      }));
    } catch {
      setState(s => ({ ...s, [reference]: "error" }));
      setMsg(m => ({ ...m, [reference]: "Network error" }));
    }
  }

  if (error) {
    return (
      <p className="font-sans text-xs text-red-500">
        Couldn&apos;t reach PayMongo to reconcile: {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="font-sans text-xs text-ink-faint">
        All recent paid payments are reflected. No stranded payments. ✓
      </p>
    );
  }

  return (
    <div className="max-w-wide mx-auto">
      <p className="font-sans text-xs text-ink-muted mb-4">
        These PayMongo payments are <span className="text-ink font-semibold">paid</span> but
        have no matching active subscription. Click <span className="font-mono">Grant access</span> to
        record the payment and unlock it for the buyer.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-faint/30">
              {["Paid", "Reference", "Plan", "Amount", "Device", "Why", ""].map(h => (
                <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const st = state[r.reference] ?? "idle";
              return (
                <tr key={r.reference} className="border-b border-ink-faint/15 hover:bg-ink-faint/5 transition-colors">
                  <td className="py-3 pr-6 font-sans text-xs text-ink-muted">
                    {r.paidAt
                      ? new Date(r.paidAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink-muted">{r.reference || r.linkId.slice(0, 12)}</td>
                  <td className="py-3 pr-6 font-sans text-xs text-ink-muted">{r.subjectId ? "Subject" : "Whole year"}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink">₱{(r.amount / 100).toFixed(2)}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-ink-faint">
                    {r.deviceId ? `${r.deviceId.slice(0, 8)}…` : "—"}
                  </td>
                  <td className="py-3 pr-6 font-sans text-xs text-ink-faint">
                    {r.reason === "malformed_remarks" ? "Bad remarks" : r.hasLedgerRow ? "Sub missing" : "Not reflected"}
                  </td>
                  <td className="py-3 pr-6">
                    {st === "done" ? (
                      <span className="font-mono text-xs text-green-600">{msg[r.reference] ?? "Done"}</span>
                    ) : r.reason === "malformed_remarks" ? (
                      <span className="font-mono text-xs text-ink-faint">Manual — bad remarks</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => grant(r.reference)}
                          disabled={st === "granting"}
                          className="font-mono text-xs border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150 disabled:opacity-50"
                        >
                          {st === "granting" ? "Granting…" : "Grant access"}
                        </button>
                        {st === "error" && (
                          <span className="font-mono text-xs text-red-500">{msg[r.reference]}</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WaitlistTable({ entries }: { entries: WaitlistEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, 5);
  const hasMore = entries.length > 5;

  return (
    <div className="overflow-x-auto max-w-wide mx-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-ink-faint/30">
            {["Name", "Email", "Year", "Subject", "Module", "Device", "Date"].map(h => (
              <th key={h} className="text-left py-2 pr-6 label-sm text-ink-muted font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map(e => (
            <tr key={e.id} className="border-b border-ink-faint/15 hover:bg-ink-faint/5 transition-colors">
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
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-4 font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
        >
          {expanded ? `Show less ↑` : `Show all ${entries.length} entries ↓`}
        </button>
      )}
    </div>
  );
}

function WaitlistSection({ entries, agg }: { entries: WaitlistEntry[]; agg: WaitlistAgg }) {
  const displayCount = entries.length;
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

  if (displayCount === 0) {
    return <p className="font-sans text-xs text-ink-faint">No signups yet.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-4 mb-6">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-wide mx-auto">
        <Stat value={comingSoon} label="Coming Soon Signups" />
        <Stat value={paywall} label="Paywall Signups" />
        <Stat value={mobile} label="Mobile" />
        <Stat value={desktop} label="Desktop" />
      </div>

      {/* Pie chart — signups by year level */}
      <WaitlistPieChart byYear={agg.by_year ?? []} total={agg.total} />

      {/* Ranked demand — which subjects to focus on */}
      <WaitlistSubjectDemand bySubject={agg.by_subject ?? []} />

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
      <WaitlistTable entries={entries} />
    </div>
  );
}

export function AdminDashboard({
  funnel, dau, topSubjects, topModules, topSections,
  totalUniqueUsers, todayUsers, last7Sessions,
  approvedUnlocks, activeNow, newUsers, recurringUsers, totalRevenue,
  activeSubscribers, newSubscribersToday,
  waitlistEntries, waitlistAgg, profilesAgg, transactions,
  unreflectedPayments, reconcileError,
}: Props) {
  const unlockClicks    = funnel.find(s => s.type === "unlock_click")?.unique ?? 0;
  const unlockSubmitted = funnel.find(s => s.type === "unlock_submitted")?.unique ?? 0;

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

      {/* ── Revenue & subscribers ───────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="01"
          title="Revenue & Subscribers"
          summary={`₱${totalRevenue} this month`}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat value={activeSubscribers} label="Active Subscribers" accent />
          <Stat value={`₱${totalRevenue}`} label="Monthly Revenue" />
          <Stat value={newSubscribersToday} label="Payments Today" />
        </div>
      </section>

      {/* ── Activity ────────────────────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="02"
          title="Activity"
          summary={`${activeNow} active now`}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <Stat value={activeNow} label="Active Now (15 min)" dot />
          <Stat value={totalUniqueUsers.toLocaleString()} label="Total Users" />
          <Stat value={newUsers} label="New Users (3 days)" />
          <Stat value={recurringUsers} label="Recurring Users" />
          <Stat value={todayUsers} label="Active Today (PH)" />
          <Stat value={last7Sessions} label="Active User-Days (7d)" />
          <Stat value={approvedUnlocks} label="Approved Unlocks" />
        </div>
        <div className="max-w-wide mx-auto">
          <DauChart data={dau} />
        </div>
      </section>

      {/* ── Onboarding ──────────────────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="03"
          title="Onboarding"
          summary={`${funnel[0]?.unique.toLocaleString() ?? 0} opened the app`}
        />
        <div className="max-w-wide mx-auto">
          <FunnelChart steps={funnel} />
        </div>
      </section>

      {/* ── Content engagement ──────────────────────────────── */}
      <section className="mb-20">
        <SectionBand eyebrow="04" title="Content Engagement" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-wide mx-auto">
          <BarChart data={topSubjects} label="Top Subjects" />
          <BarChart data={topModules} label="Top Modules" />
          <BarChart
            data={topSections.map(s => ({ label: s.heading, count: s.count }))}
            label="Top Sections"
          />
        </div>
      </section>

      {/* ── Payments ────────────────────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="05"
          title="Payments"
          summary={`${transactions.length} transactions`}
        />
        <div className="mb-12">
          <p className="label mb-6">Unlock Funnel</p>
          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {[
              { label: "Tapped Unlock", value: unlockClicks },
              { label: "Submitted Payment", value: unlockSubmitted },
              { label: "Approved", value: approvedUnlocks },
            ].map(item => (
              <div key={item.label} className="border border-ink-faint/30 p-5 text-center hover:border-ink/40 transition-colors">
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
        </div>
        <p className="label mb-6">Transactions</p>
        <TransactionsSection rows={transactions} />

        <div className="mt-12">
          <p className="label mb-6">
            Reconcile — Paid but not reflected
            {unreflectedPayments.length > 0 && (
              <span className="ml-2 font-mono text-xs text-red-500">
                {unreflectedPayments.length} need{unreflectedPayments.length === 1 ? "s" : ""} attention
              </span>
            )}
          </p>
          <ReconcileSection rows={unreflectedPayments} error={reconcileError} />
        </div>
      </section>

      {/* ── Waitlist ────────────────────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="06"
          title="Waitlist"
          summary={`${waitlistAgg.total} total signups`}
        />
        <WaitlistSection entries={waitlistEntries} agg={waitlistAgg} />
      </section>

      {/* ── Student profiles — who our users are and where they
             want to go, to guide which tracks to build next ──── */}
      <section className="mb-12">
        <SectionBand
          eyebrow="07"
          title="Student Profiles"
          summary={`${profilesAgg.total} profiles completed`}
        />
        {profilesAgg.total === 0 ? (
          <p className="font-sans text-xs text-ink-faint">
            No profiles yet — this fills in as logged-in users complete the
            profile card on their account page.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-wide mx-auto">
            <BarChart
              data={(profilesAgg.by_pathway ?? []).map(p => ({ label: p.pathway, count: p.count }))}
              label="Preferred Pathways"
            />
            <BarChart
              data={(profilesAgg.by_university ?? []).map(u => ({ label: u.university, count: u.count }))}
              label="Universities"
            />
            <BarChart
              data={(profilesAgg.by_major ?? []).map(m => ({ label: m.major, count: m.count }))}
              label="Majors / Programs"
            />
          </div>
        )}
      </section>

    </main>
  );
}
