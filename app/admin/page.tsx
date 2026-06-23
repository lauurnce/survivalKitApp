import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminDashboard } from "@/components/AdminDashboard";
import type { EventType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

function getTitle(rel: unknown): string {
  if (!rel) return "unknown";
  if (Array.isArray(rel)) return (rel[0] as { title?: string })?.title ?? "unknown";
  return (rel as { title?: string }).title ?? "unknown";
}

function countById(ids: (string | null)[]): { id: string; count: number }[] {
  const map = new Map<string, number>();
  for (const id of ids) {
    if (!id) continue;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

const FUNNEL_STEPS: { type: EventType; label: string; hint: string }[] = [
  { type: "enter",            label: "Opened App",        hint: "Unique devices that launched the app" },
  { type: "year_select",      label: "Selected Year",      hint: "Completed first onboarding step" },
  { type: "subject_open",     label: "Opened Subject",     hint: "Navigated to a subject" },
  { type: "module_open",      label: "Opened Module",      hint: "Went into a module" },
  { type: "section_view",     label: "Read a Section",     hint: "Scrolled and read content" },
  { type: "unlock_click",     label: "Tapped Unlock",      hint: "Showed payment intent" },
  { type: "unlock_submitted", label: "Submitted Payment",  hint: "Completed GCash payment flow" },
];

export default async function AdminPage() {
  // Session cookie auth — password never touches a URL or DOM
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");

  const supabase = createServerClient();

  const [
    { data: funnelRaw },
    { data: dauRaw },
    { data: subjectCounters },
    { data: moduleCounters },
    { data: sectionEventRaw },
    { data: _pendingRaw },
    { data: approvedRaw },
    { data: activeRaw },
    { data: userTotalsRaw },
    { data: waitlistRaw },
    { data: subscriptionRaw },
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
    supabase
      .from("events")
      .select("section_id")
      .eq("event_type", "section_view")
      .not("section_id", "is", null)
      .limit(3000),
    supabase
      .from("unlocks")
      .select("id, device_id, gcash_ref, amount, created_at, modules(title)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("unlocks").select("id, amount").eq("status", "approved"),
    // "Active now" = distinct devices with any event in the last 15 min,
    // counted in Postgres (avoids the row cap and counts users still reading).
    supabase.rpc("admin_active_since", { p_minutes: 15 }),
    // Total users + new-vs-recurring split, aggregated in Postgres so it
    // counts all devices (the old raw enter query was capped at 1000 rows).
    supabase.rpc("admin_user_totals", { p_new_days: 3 }),
    supabase
      .from("waitlist")
      .select("id, email, name, source, device_type, willing_to_pay, needs_capstone, year_label, subject_title, module_title, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("subscriptions")
      .select("id, created_at, status")
      .order("created_at", { ascending: false }),
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
  const PH_OFFSET_MS = 8 * 60 * 60 * 1000;
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

  const sectionCounts = countById(
    (sectionEventRaw ?? []).map((e) => (e as { section_id: string | null }).section_id)
  );
  const topSectionIds = sectionCounts.slice(0, 8).map((s) => s.id);
  let sectionDetails: { id: string; heading: string; modules: unknown }[] = [];
  if (topSectionIds.length > 0) {
    const { data } = await supabase
      .from("sections")
      .select("id, heading, modules(title)")
      .in("id", topSectionIds);
    sectionDetails = (data ?? []) as typeof sectionDetails;
  }
  const topSections = sectionCounts.slice(0, 8).map((s) => {
    const detail = sectionDetails.find((d) => d.id === s.id);
    return {
      heading: detail?.heading ?? s.id.slice(0, 8),
      module_title: getTitle(detail?.modules),
      count: s.count,
    };
  });

  // "Today" in PH time — last bar in the scaffolded window above
  const todayStrPH = todayPH.toISOString().slice(0, 10);
  const todayUsers = dau.find((d) => d.date === todayStrPH)?.unique ?? 0;
  const last7Sessions = dau.slice(-7).reduce((sum, d) => sum + d.unique, 0);

  // activeRaw is a single bigint from admin_active_since() (returned as a number)
  const activeNow = Number(activeRaw ?? 0);

  // userTotalsRaw is a single row from admin_user_totals(): total / new / recurring
  const userTotals = ((userTotalsRaw ?? [])[0] ?? {}) as {
    total_users?: number;
    new_users?: number;
    recurring_users?: number;
  };
  const totalUniqueUsers = Number(userTotals.total_users ?? 0);
  const newUsers = Number(userTotals.new_users ?? 0);
  const recurringUsers = Number(userTotals.recurring_users ?? 0);

  const subscriptions = subscriptionRaw ?? [];
  const activeSubscribers = subscriptions.filter(s => s.status === "active").length;
  const totalRevenue = activeSubscribers * 50; // ₱50/subscriber, simplified
  const todayStr = new Date().toISOString().slice(0, 10);
  const newSubscribersToday = subscriptions.filter(
    s => s.created_at.slice(0, 10) === todayStr
  ).length;

  const waitlistEntries = (waitlistRaw ?? []) as {
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
  }[];

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
      approvedUnlocks={approvedRaw?.length ?? 0}
      activeNow={activeNow}
      newUsers={newUsers}
      recurringUsers={recurringUsers}
      totalRevenue={totalRevenue}
      activeSubscribers={activeSubscribers}
      newSubscribersToday={newSubscribersToday}
      waitlistEntries={waitlistEntries}
    />
  );
}
