import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminDashboard } from "@/components/AdminDashboard";
import { revenueByMonth, PH_OFFSET_MS } from "@/lib/payments";
import { findUnreflectedPayments, type UnreflectedPayment } from "@/lib/reconcile";
import { ADMIN_FUNNEL_STEPS } from "@/lib/adminFunnel";

export const dynamic = "force-dynamic";

function getTitle(rel: unknown): string {
  if (!rel) return "unknown";
  if (Array.isArray(rel)) return (rel[0] as { title?: string })?.title ?? "unknown";
  return (rel as { title?: string }).title ?? "unknown";
}


// How many PH calendar months of revenue the dashboard keeps on hand, counting
// the current one. Drives both the ledger query window and the month-over-month
// comparison panel.
const REVENUE_MONTHS = 12;

const FUNNEL_STEPS = ADMIN_FUNNEL_STEPS;

export default async function AdminPage() {
  // Session cookie auth — password never touches a URL or DOM
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  const supabase = createServerClient();

  // Compute PH-month boundaries in UTC for the uncapped revenue query.
  // paid_at is timestamptz so we must filter using UTC instants that correspond
  // to the start of a PH calendar month. The window opens REVENUE_MONTHS - 1
  // months before the current one so the dashboard can compare month over
  // month, and closes at the start of next month.
  // We derive these BEFORE the Promise.all so we can use them in the query.
  const todayPHForBounds = new Date(Date.now() + PH_OFFSET_MS);
  const phYear = todayPHForBounds.getUTCFullYear();
  const phMonth = todayPHForBounds.getUTCMonth();
  const windowStartUtcMs =
    Date.UTC(phYear, phMonth - (REVENUE_MONTHS - 1), 1) - PH_OFFSET_MS;
  const nextMonthStartUtcMs = Date.UTC(phYear, phMonth + 1, 1) - PH_OFFSET_MS;
  const windowStartUtcIso = new Date(windowStartUtcMs).toISOString();
  const nextMonthStartUtcIso = new Date(nextMonthStartUtcMs).toISOString();

  const [
    { data: funnelRaw },
    { data: dauRaw },
    { data: subjectCounters },
    { data: moduleCounters },
    { data: topSectionsRaw },
    { data: activeRaw },
    { data: userTotalsRaw },
    { data: activeSubscribersRaw },
    { data: paymentsRaw },
    // Revenue query is SEPARATE from paymentsRaw and has NO row cap. The
    // transactions list (paymentsRaw) is capped at 100 for display; using it
    // for revenue would silently undercount once lifetime payments exceed 100.
    { data: revenueRaw },
    { data: profilesAggRaw },
    { data: feedbackAggRaw },
  ] = await Promise.all([
    // Funnel distinct-device counts per event_type, aggregated in Postgres
    // (the old raw .limit() was capped at 1000 rows and undercounted).
    supabase.rpc("admin_funnel_counts"),
    // DAU = any device that did ANYTHING in the app that day, bucketed by PH
    // calendar day. Aggregated in Postgres via RPC so we get one row per day
    // instead of pulling tens of thousands of raw events (which the 1000-row
    // PostgREST cap would silently truncate, hiding the most recent days).
    supabase.rpc("admin_dau_30d"),
    // Use pre-aggregated counters (10-min cooldown per device — more accurate than raw event counts)
    supabase
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "subject")
      .order("read_count", { ascending: false })
      .limit(8),
    supabase
      .from("counters")
      .select("resource_id, read_count")
      .eq("resource_type", "module")
      .order("read_count", { ascending: false })
      .limit(8),
    supabase.rpc("admin_top_sections", { p_limit: 8 }),
    // "Active now" = distinct devices with any event in the last 15 min,
    // counted in Postgres (avoids the row cap and counts users still reading).
    supabase.rpc("admin_active_since", { p_minutes: 15 }),
    // Total devices + new-devices split, aggregated in Postgres so it counts
    // all devices (the old raw enter query was capped at 1000 rows). The RPC
    // also returns a recurring_users figure (total - new) that the dashboard
    // deliberately does not read: it counts a device that visited once months
    // ago as "recurring", which is arithmetic wearing a behaviour label.
    supabase.rpc("admin_user_totals", { p_new_days: 3 }),
    supabase.rpc("admin_active_subscribers"),
    supabase
      .from("payments")
      .select("id, device_id, year_id, subject_id, amount, paymongo_link_id, paid_at")
      .order("paid_at", { ascending: false })
      .limit(100),
    // Uncapped trailing-window fetch for revenue: only amount + paid_at are
    // needed. No .limit() so every payment in the window is included.
    supabase
      .from("payments")
      .select("amount, paid_at")
      .gte("paid_at", windowStartUtcIso)
      .lt("paid_at", nextMonthStartUtcIso),
    // Aggregated student profiles: pathway / university / major breakdowns
    // for deciding which future tracks to build.
    supabase.rpc("admin_profiles_agg"),
    // Aggregated feedback stats: total responses, average app/module ratings,
    // and the 3 most recent comments. Runs entirely in Postgres so the counts
    // are never subject to PostgREST's 1000-row default cap.
    supabase.rpc("admin_feedback_agg"),
  ]);

  const funnelCounts = new Map<string, number>();
  for (const r of (funnelRaw ?? []) as { event_type: string; unique_devices: number }[]) {
    funnelCounts.set(r.event_type, Number(r.unique_devices));
  }
  const funnel = FUNNEL_STEPS.map((step) => ({
    type: step.type,
    label: step.label,
    hint: step.hint,
    unique: funnelCounts.get(step.type) ?? 0,
  }));

  // dauRaw comes pre-aggregated from the admin_dau_30d() RPC: one row per PH
  // calendar day with its distinct-device count. Index it by date string.
  const dauByDay = new Map<string, number>();
  for (const r of (dauRaw ?? []) as { day: string; unique_devices: number }[]) {
    // r.day is already a 'YYYY-MM-DD' PH date from Postgres
    dauByDay.set(r.day, Number(r.unique_devices));
  }

  // Scaffold a continuous 30-day window ending today (PH time) and fill zeros
  // for days with no activity. This keeps the chart spanning the full range and
  // makes the latest bar always "today" — it never freezes on the last active day.
  const todayPH = new Date(Date.now() + PH_OFFSET_MS);
  const dau = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(todayPH.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const date = d.toISOString().slice(0, 10);
    return { date, unique: dauByDay.get(date) ?? 0 };
  });

  const subjectIds = (subjectCounters ?? []).map((c) => c.resource_id);
  const moduleIds = (moduleCounters ?? []).map((c) => c.resource_id);

  const [{ data: subjectTitles }, { data: moduleTitles }] = await Promise.all([
    subjectIds.length > 0
      ? supabase.from("subjects").select("id, title").in("id", subjectIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    moduleIds.length > 0
      ? supabase.from("modules").select("id, title").in("id", moduleIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const topSubjects = (subjectCounters ?? []).map((c) => ({
    label: subjectTitles?.find((s) => s.id === c.resource_id)?.title ?? c.resource_id.slice(0, 8),
    count: c.read_count,
  }));

  const topModules = (moduleCounters ?? []).map((c) => ({
    label: moduleTitles?.find((m) => m.id === c.resource_id)?.title ?? c.resource_id.slice(0, 8),
    count: c.read_count,
  }));

  const topSectionIds = ((topSectionsRaw ?? []) as { section_id: string; event_count: number }[])
    .map((r) => r.section_id);
  let sectionDetails: { id: string; heading: string; modules: unknown }[] = [];
  if (topSectionIds.length > 0) {
    const { data } = await supabase
      .from("sections")
      .select("id, heading, modules(title)")
      .in("id", topSectionIds);
    sectionDetails = (data ?? []) as typeof sectionDetails;
  }
  const sectionRpcRows = (topSectionsRaw ?? []) as { section_id: string; event_count: number }[];
  const topSections = sectionRpcRows.map((r) => {
    const detail = sectionDetails.find((d) => d.id === r.section_id);
    return {
      heading: detail?.heading ?? r.section_id.slice(0, 8),
      module_title: getTitle(detail?.modules),
      count: Number(r.event_count),
    };
  });

  // "Today" in PH time — last bar in the scaffolded window above
  const todayStrPH = todayPH.toISOString().slice(0, 10);
  const todayUsers = dau.find((d) => d.date === todayStrPH)?.unique ?? 0;
  const last7Sessions = dau.slice(-7).reduce((sum, d) => sum + d.unique, 0);

  // activeRaw is a single bigint from admin_active_since() (returned as a number)
  const activeNow = Number(activeRaw ?? 0);

  // userTotalsRaw is a single row from admin_user_totals(): total / new / recurring.
  // recurring_users is intentionally not read here — see the RPC call comment above.
  const userTotals = ((userTotalsRaw ?? [])[0] ?? {}) as {
    total_users?: number;
    new_users?: number;
  };
  const totalUniqueUsers = Number(userTotals.total_users ?? 0);
  const newUsers = Number(userTotals.new_users ?? 0);

  const activeSubscribers = Number(activeSubscribersRaw ?? 0);

  const payments = (paymentsRaw ?? []) as {
    id: string;
    device_id: string;
    year_id: string;
    subject_id: string | null;
    amount: number;
    paymongo_link_id: string;
    paid_at: string;
  }[];

  // Revenue rows: uncapped set of all payments in the trailing month window.
  // Using this instead of `payments` (which is capped at 100) ensures the
  // revenue tile stays accurate once lifetime payments exceed 100.
  const revenueRows = (revenueRaw ?? []) as { amount: number; paid_at: string }[];

  // Real revenue per PH calendar month, newest first. monthlyRevenue[0] is the
  // current (still-running) month, so the headline tile reads from it rather
  // than summing the same rows a second time.
  const monthlyRevenue = revenueByMonth(revenueRows, REVENUE_MONTHS);
  const totalRevenue = monthlyRevenue[0]?.revenue ?? 0;

  // "Payments Today" counts payments (renewals included), not subscription rows.
  // Uses the uncapped revenueRows (today is always within the window).
  const paymentsToday = revenueRows.filter(
    p => new Date(new Date(p.paid_at).getTime() + PH_OFFSET_MS).toISOString().slice(0, 10) === todayStrPH
  ).length;

  // Build transactions rows — resolve year labels and subject scope.
  const txYearIds = Array.from(new Set(payments.map(p => p.year_id)));
  const { data: txYears } = txYearIds.length
    ? await supabase.from("years").select("id, label").in("id", txYearIds)
    : { data: [] as { id: string; label: string }[] };

  const txSubjectIds = Array.from(new Set(payments.map(p => p.subject_id).filter((id): id is string => id !== null)));
  const { data: txSubjects } = txSubjectIds.length
    ? await supabase.from("subjects").select("id, title").in("id", txSubjectIds)
    : { data: [] as { id: string; title: string }[] };

  const transactions = payments.map(p => ({
    id: p.id,
    paid_at: p.paid_at,
    device_id: p.device_id,
    year_label: txYears?.find(y => y.id === p.year_id)?.label ?? "—",
    scope: p.subject_id
      ? (txSubjects?.find(s => s.id === p.subject_id)?.title ?? "—")
      : "Whole year",
    amount: p.amount,
    paymongo_link_id: p.paymongo_link_id,
  }));

  const profilesAgg = (profilesAggRaw ?? { total: 0, by_pathway: [], by_university: [], by_major: [] }) as {
    total: number;
    by_pathway: { pathway: string; count: number }[] | null;
    by_university: { university: string; count: number }[] | null;
    by_major: { major: string; count: number }[] | null;
  };

  const feedbackAgg = (feedbackAggRaw ?? {
    total: 0,
    avg_app_rating: null,
    avg_module_rating: null,
    recent_comments: [],
  }) as {
    total: number;
    avg_app_rating: number | null;
    avg_module_rating: number | null;
    recent_comments: { feedback_text: string; created_at: string }[] | null;
  };

  // Reconcile: paid PayMongo links with no matching active subscription
  // ("paid but not reflected"). Calls the PayMongo API; if it fails (network,
  // rate limit, key issue) we degrade gracefully so the rest of the dashboard
  // still renders, and surface the error in the section instead.
  let unreflectedPayments: UnreflectedPayment[] = [];
  let reconcileError: string | null = null;
  try {
    unreflectedPayments = await findUnreflectedPayments(supabase);
  } catch (err) {
    reconcileError = err instanceof Error ? err.message : "Failed to load reconcile data";
  }

  return (
    <AdminDashboard
      funnel={funnel}
      dau={dau}
      topSubjects={topSubjects}
      topModules={topModules}
      topSections={topSections}
      totalUniqueUsers={totalUniqueUsers}
      todayUsers={todayUsers}
      last7Sessions={last7Sessions}
      activeNow={activeNow}
      newUsers={newUsers}
      totalRevenue={totalRevenue}
      monthlyRevenue={monthlyRevenue}
      activeSubscribers={activeSubscribers}
      newSubscribersToday={paymentsToday}
      feedbackAgg={feedbackAgg}
      profilesAgg={profilesAgg}
      transactions={transactions}
      unreflectedPayments={unreflectedPayments}
      reconcileError={reconcileError}
    />
  );
}
