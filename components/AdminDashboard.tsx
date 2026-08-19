"use client";

import { useState } from "react";
// Type-only imports: erased at compile time, so this client component never
// pulls in lib/reconcile's server-side deps (node:crypto via lib/paymongo).
import type { UnreflectedPayment } from "@/lib/reconcile";
import type { MonthlyRevenue } from "@/lib/payments";

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

interface FeedbackAgg {
  total: number;
  avg_app_rating: number | null;
  avg_module_rating: number | null;
  recent_comments: { feedback_text: string; created_at: string }[] | null;
}

interface ProfilesAgg {
  total: number;
  by_pathway: { pathway: string; count: number }[] | null;
  by_university: { university: string; count: number }[] | null;
  by_major: { major: string; count: number }[] | null;
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
  activeNow: number;
  newUsers: number;
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  activeSubscribers: number;
  newSubscribersToday: number;
  feedbackAgg: FeedbackAgg;
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
        <span className="label-sm text-ink-faint font-mono" data-testid="section-band-eyebrow">{eyebrow}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-none">{title}</h2>
        {summary && (
          <span className="ml-auto font-mono text-xs text-ink-muted">{summary}</span>
        )}
      </div>
    </div>
  );
}

const PHP_TO_USD_RATE = 58;

function Stat({
  value,
  label,
  accent,
  dot,
  subValue,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
  dot?: boolean;
  subValue?: string;
}) {
  return (
    <div
      className={`relative border p-6 transition-colors duration-150 ${
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
      {subValue && (
        <p className="absolute bottom-2 right-3 font-mono text-[10px] text-ink-faint">
          {subValue}
        </p>
      )}
    </div>
  );
}

function formatPeso(pesos: number): string {
  return `₱${pesos.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
}

// "2026-08" → "Aug 2026"
function monthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  return new Date(Number(year), Number(monthNum) - 1).toLocaleString("en-PH", {
    month: "short",
    year: "numeric",
  });
}

/**
 * Month-over-month revenue history, collapsed by default.
 *
 * The dashboard leads with the current month; this opens on demand so the
 * headline number can be read against the months before it. `months` arrives
 * newest-first, so index 0 is the current — still incomplete — month, and the
 * row below each one is its comparison month.
 */
function MonthlyRevenueSection({ months }: { months: MonthlyRevenue[] }) {
  const [expanded, setExpanded] = useState(false);

  // Trim the empty months before the first peso ever earned so the panel isn't
  // mostly zero rows early on — but always keep at least the current month and
  // the one before it, otherwise there's nothing to compare against.
  const lastFunded = months.reduce((last, m, i) => (m.revenue > 0 ? i : last), 0);
  const visible = months.slice(0, Math.max(lastFunded + 1, 2));
  const max = Math.max(...visible.map(m => m.revenue), 1);
  const windowTotal = months.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150"
      >
        {expanded ? "Hide monthly revenue ↑" : "View monthly revenue ↓"}
      </button>

      {expanded && (
        <div className="mt-6 max-w-wide mx-auto">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
            <p className="label">Revenue by Month</p>
            <span className="font-sans text-[10px] text-ink-faint">
              PH calendar months · {formatPeso(windowTotal)} over the last {months.length}
            </span>
          </div>
          <div className="space-y-2">
            {visible.map((m, i) => {
              const prev = months[i + 1];
              const pct =
                prev && prev.revenue > 0
                  ? Math.round(((m.revenue - prev.revenue) / prev.revenue) * 100)
                  : null;
              return (
                <div key={m.month} className="group flex items-center gap-3">
                  <span className="font-sans text-xs text-ink-muted w-24 sm:w-28 shrink-0 text-right">
                    {monthLabel(m.month)}
                    {i === 0 && (
                      <span className="font-mono text-[9px] text-ink-faint ml-1">so far</span>
                    )}
                  </span>
                  <div className="flex-1 bg-ink-faint/20 h-4">
                    <div
                      className="h-4 bg-accent transition-all duration-300 group-hover:bg-accent-dark"
                      style={{ width: `${(m.revenue / max) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-ink w-20 text-right shrink-0">
                    {formatPeso(m.revenue)}
                  </span>
                  <span className="hidden sm:block font-mono text-[10px] text-ink-faint w-16 text-right shrink-0">
                    {m.payments} paid
                  </span>
                  <span className="font-mono text-[10px] w-20 text-right shrink-0">
                    {pct === null ? (
                      <span className="text-ink-faint">
                        {prev && m.revenue > 0 ? "first" : "—"}
                      </span>
                    ) : pct > 0 ? (
                      <span className="text-accent">▲ {pct}%</span>
                    ) : pct < 0 ? (
                      <span className="text-ink-muted">▼ {Math.abs(pct)}%</span>
                    ) : (
                      <span className="text-ink-faint">flat</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="font-sans text-[10px] text-ink-faint mt-4">
            Change is against the month directly below. The top row is the month
            in progress, so it will read low until the month closes.
          </p>
        </div>
      )}
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
          type="button"
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
                    {r.reason === "malformed_remarks"
                      ? "Bad remarks"
                      : r.reason === "class_block_unfulfilled"
                        ? "Class not created"
                        : r.hasLedgerRow ? "Sub missing" : "Not reflected"}
                  </td>
                  <td className="py-3 pr-6">
                    {st === "done" ? (
                      <span className="font-mono text-xs text-green-600">{msg[r.reference] ?? "Done"}</span>
                    ) : r.reason === "malformed_remarks" ? (
                      <span className="font-mono text-xs text-ink-faint">Manual — bad remarks</span>
                    ) : r.reason === "class_block_unfulfilled" ? (
                      // /api/admin/reconcile grants a device subscription; it
                      // cannot mint the class row a block sale needs.
                      <span className="font-mono text-xs text-ink-faint">Manual — create class</span>
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

/**
 * Feedback summary tile — counts, average ratings, and a few recent comments,
 * linking through to the full /admin/feedback page. Deliberately renders
 * nothing identifying: no device id, user id, or coupon code, and only the
 * comment text and its date.
 */
// Quote comments sparingly on the summary tile — long ones are truncated
// here; the full text is still available on /admin/feedback.
const COMMENT_PREVIEW_MAX = 160;
function previewComment(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > COMMENT_PREVIEW_MAX
    ? `${trimmed.slice(0, COMMENT_PREVIEW_MAX).trimEnd()}…`
    : trimmed;
}

function FeedbackSummary({ agg }: { agg: FeedbackAgg }) {
  const comments = agg.recent_comments ?? [];

  if (agg.total === 0) {
    return <p className="font-sans text-xs text-ink-faint">No feedback yet.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 max-w-wide mx-auto">
        <Stat value={agg.total} label="Total Responses" />
        <Stat value={agg.avg_app_rating ?? "—"} label="Avg App Rating" />
        <Stat value={agg.avg_module_rating ?? "—"} label="Avg Module Rating" />
      </div>

      {comments.length > 0 && (
        <div className="mb-8 max-w-wide mx-auto">
          <p className="label-sm text-ink-muted mb-3">Recent Comments</p>
          <div className="flex flex-col gap-3">
            {comments.map((c, i) => (
              <blockquote key={i} className="border-l-2 border-ink-faint/30 pl-4">
                <p className="font-sans text-sm text-ink italic">&ldquo;{previewComment(c.feedback_text)}&rdquo;</p>
                <p className="font-mono text-[10px] text-ink-faint mt-1">
                  {new Date(c.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      <a
        href="/admin/feedback"
        className="font-mono text-xs text-ink-muted border border-ink-faint/30 px-3 py-1 hover:text-ink hover:border-ink transition-colors duration-150 inline-block"
      >
        View all feedback →
      </a>
    </div>
  );
}

export function AdminDashboard({
  funnel, dau, topSubjects, topModules, topSections,
  totalUniqueUsers, todayUsers, last7Sessions,
  activeNow, newUsers, totalRevenue, monthlyRevenue,
  activeSubscribers, newSubscribersToday,
  feedbackAgg, profilesAgg, transactions,
  unreflectedPayments, reconcileError,
}: Props) {
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
          <Stat
            value={`₱${totalRevenue}`}
            label="Monthly Revenue"
            subValue={`≈ $${(totalRevenue / PHP_TO_USD_RATE).toFixed(2)}`}
          />
          <Stat value={newSubscribersToday} label="Payments Today" />
        </div>
        <MonthlyRevenueSection months={monthlyRevenue} />
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
          <Stat value={totalUniqueUsers.toLocaleString()} label="Devices reached" />
          <Stat value={newUsers} label="New Users (3 days)" />
          <Stat value={todayUsers} label="Active Today (PH)" />
          <Stat value={last7Sessions} label="Active User-Days (7d)" />
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

      {/* ── Feedback ────────────────────────────────────────── */}
      <section className="mb-20">
        <SectionBand
          eyebrow="06"
          title="Feedback"
          summary={`${feedbackAgg.total} responses`}
        />
        <FeedbackSummary agg={feedbackAgg} />
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
