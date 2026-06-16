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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: funnelRaw },
    { data: dauRaw },
    { data: subjectCounters },
    { data: moduleCounters },
    { data: sectionEventRaw },
    { data: pendingRaw },
    { data: approvedRaw },
    { data: activeRaw },
    { data: allEnterRaw },
  ] = await Promise.all([
    supabase.from("events").select("device_id, event_type").limit(10000),
    supabase
      .from("events")
      .select("device_id, created_at")
      .eq("event_type", "enter")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true }),
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
    supabase
      .from("events")
      .select("device_id")
      .eq("event_type", "enter")
      .gte("created_at", fifteenMinutesAgo)
      .limit(1000),
    supabase
      .from("events")
      .select("device_id, created_at")
      .eq("event_type", "enter")
      .order("created_at", { ascending: true })
      .limit(50000),
  ]);

  const allEvents = funnelRaw ?? [];
  const funnel = FUNNEL_STEPS.map((step) => ({
    type: step.type,
    label: step.label,
    hint: step.hint,
    unique: new Set(
      allEvents.filter((e) => e.event_type === step.type).map((e) => e.device_id)
    ).size,
  }));

  const dauByDay = new Map<string, Set<string>>();
  for (const e of dauRaw ?? []) {
    const day = e.created_at.slice(0, 10);
    if (!dauByDay.has(day)) dauByDay.set(day, new Set());
    dauByDay.get(day)!.add(e.device_id);
  }
  const dau = Array.from(dauByDay.entries())
    .map(([date, devices]) => ({ date, unique: devices.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

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

  const pendingUnlocks = (pendingRaw ?? []).map((u) => ({
    id: u.id,
    device_id: u.device_id,
    gcash_ref: u.gcash_ref,
    amount: u.amount,
    created_at: u.created_at,
    module_title: getTitle((u as { modules: unknown }).modules),
  }));

  const totalUniqueUsers = funnel[0]?.unique ?? 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayUsers = dau.find((d) => d.date === todayStr)?.unique ?? 0;
  const last7Sessions = dau.slice(-7).reduce((sum, d) => sum + d.unique, 0);

  const activeNow = new Set((activeRaw ?? []).map((e) => e.device_id)).size;

  const firstSeen = new Map<string, string>();
  for (const e of allEnterRaw ?? []) {
    if (!firstSeen.has(e.device_id)) firstSeen.set(e.device_id, e.created_at);
  }
  let newUsers = 0;
  let recurringUsers = 0;
  for (const date of firstSeen.values()) {
    if (date >= threeDaysAgo) newUsers++;
    else recurringUsers++;
  }

  const totalRevenue = (approvedRaw ?? []).reduce((sum, u) => sum + (u.amount ?? 0), 0);

  return (
    <AdminDashboard
      funnel={funnel}
      dau={dau}
      topSubjects={topSubjects}
      topModules={topModules}
      topSections={topSections}
      pendingUnlocks={pendingUnlocks}
      totalUniqueUsers={totalUniqueUsers}
      todayUsers={todayUsers}
      last7Sessions={last7Sessions}
      approvedUnlocks={approvedRaw?.length ?? 0}
      activeNow={activeNow}
      newUsers={newUsers}
      recurringUsers={recurringUsers}
      totalRevenue={totalRevenue}
    />
  );
}
