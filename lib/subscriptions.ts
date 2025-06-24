import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

/**
 * What unlocks a (year, subject) for one reader, and until when.
 *
 * - `year`: a year pass (subscriptions.subject_id IS NULL) — every subject in the year.
 * - `subject`: a single-subject plan.
 * - `class`: a class-rep block sale the reader's device joined.
 *
 * `until` is the grant's current_period_end (ISO). It is null only for the
 * UNLOCK_ALL dev flag, which has no end.
 */
export type EntitlementScope = "year" | "subject" | "class";
export interface Entitlement {
  scope: EntitlementScope;
  until: string | null;
}

function lookup(userId: string | undefined, deviceId: string) {
  const useUser = isUuid(userId);
  return { col: useUser ? "user_id" : "device_id", val: useUser ? (userId as string) : deviceId };
}

function guardUnlockAll(): boolean {
  if (process.env.UNLOCK_ALL !== "true") return false;
  if (process.env.NODE_ENV === "production") {
    throw new Error("UNLOCK_ALL must not be set in production");
  }
  return true;
}

/**
 * The grant that unlocks (yearId[, subjectId]) for this reader, or null.
 * Same precedence and filters isSubscribed() has always used: year pass, then
 * subject plan, then class membership. Where several active grants of one
 * kind overlap (an early renewal), the one that runs longest is reported.
 */
export async function getEntitlement(
  deviceId: string,
  yearId: string,
  subjectId?: string,
  userId?: string,
): Promise<Entitlement | null> {
  if (guardUnlockAll()) return { scope: "year", until: null };

  const now = new Date().toISOString();
  const supabase = createServerClient();
  const { col, val } = lookup(userId, deviceId);

  // Year-level plan (subject_id IS NULL) unlocks everything in the year
  const { data: yearPlan } = await supabase
    .from("subscriptions")
    .select("id, current_period_end")
    .eq(col, val)
    .eq("year_id", yearId)
    .is("subject_id", null)
    .eq("status", "active")
    .gt("current_period_end", now)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (yearPlan) return { scope: "year", until: periodEnd(yearPlan) };

  // Subject-level plan only unlocks the specific subject
  if (!subjectId) return null;

  const { data: subjectPlan } = await supabase
    .from("subscriptions")
    .select("id, current_period_end")
    .eq(col, val)
    .eq("year_id", yearId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .gt("current_period_end", now)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subjectPlan) return { scope: "subject", until: periodEnd(subjectPlan) };

  // subjectId is string-interpolated into the PostgREST .or() filter below,
  // so only a strict UUID may ever reach it — a crafted value could
  // otherwise inject extra filter branches (e.g. "x,subject_id.not.is.null"
  // widens the OR and bypasses the subject match). Callers today validate
  // this upstream, but this guard must not depend on them.
  if (!isUuid(subjectId)) return null;

  // Class membership: a joined class with an active, unexpired grant for
  // this exact subject (or an all-subjects class for this year, where
  // classes.subject_id IS NULL) unlocks every member (block sales via class
  // rep). A plain .eq("classes.subject_id", subjectId) can never match a
  // NULL subject_id row (SQL "= NULL" never matches), so an .or() covering
  // both cases is required.
  const { data: membership } = await supabase
    .from("class_members")
    .select("class_id, classes!inner(subject_id, year_id, status, current_period_end)")
    .eq("device_id", deviceId)
    .eq("classes.year_id", yearId)
    .or(`subject_id.eq.${subjectId},subject_id.is.null`, { referencedTable: "classes" })
    .eq("classes.status", "active")
    .gt("classes.current_period_end", now)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;
  const cls = (membership as { classes?: unknown }).classes;
  const row = (Array.isArray(cls) ? cls[0] : cls) as { current_period_end?: unknown } | undefined;
  return { scope: "class", until: periodEnd(row) };
}

export async function isSubscribed(
  deviceId: string,
  yearId: string,
  subjectId?: string,
  userId?: string,
): Promise<boolean> {
  return (await getEntitlement(deviceId, yearId, subjectId, userId)) !== null;
}

/**
 * Every subject in one year this reader can open, for the subject list's
 * "Unlocked" tags. `year` is set when a year pass (or an all-subjects class)
 * covers the whole year; `subjects` holds the per-subject grants.
 */
export interface YearEntitlements {
  year: Entitlement | null;
  subjects: Record<string, Entitlement>;
}

export async function getYearEntitlements(
  deviceId: string,
  yearId: string,
  userId?: string,
): Promise<YearEntitlements> {
  if (guardUnlockAll()) return { year: { scope: "year", until: null }, subjects: {} };

  const now = new Date().toISOString();
  const supabase = createServerClient();
  const { col, val } = lookup(userId, deviceId);
  const result: YearEntitlements = { year: null, subjects: {} };

  const { data: plans } = await supabase
    .from("subscriptions")
    .select("subject_id, current_period_end")
    .eq(col, val)
    .eq("year_id", yearId)
    .eq("status", "active")
    .gt("current_period_end", now);

  for (const plan of (plans ?? []) as { subject_id: string | null; current_period_end: string }[]) {
    const ent: Entitlement = plan.subject_id
      ? { scope: "subject", until: plan.current_period_end }
      : { scope: "year", until: plan.current_period_end };
    if (plan.subject_id) mergeLonger(result.subjects, plan.subject_id, ent);
    else result.year = longer(result.year, ent);
  }

  if (deviceId) {
    const { data: memberships } = await supabase
      .from("class_members")
      .select("class_id, classes!inner(subject_id, year_id, status, current_period_end)")
      .eq("device_id", deviceId)
      .eq("classes.year_id", yearId)
      .eq("classes.status", "active")
      .gt("classes.current_period_end", now);

    for (const m of (memberships ?? []) as { classes?: unknown }[]) {
      const cls = (Array.isArray(m.classes) ? m.classes[0] : m.classes) as
        | { subject_id: string | null; current_period_end: string }
        | undefined;
      if (!cls) continue;
      const ent: Entitlement = { scope: "class", until: cls.current_period_end };
      if (cls.subject_id) mergeLonger(result.subjects, cls.subject_id, ent);
      else result.year = longer(result.year, ent);
    }
  }

  return result;
}

function periodEnd(row: { current_period_end?: unknown } | null | undefined): string | null {
  const v = row?.current_period_end;
  return typeof v === "string" ? v : null;
}

function longer(a: Entitlement | null, b: Entitlement): Entitlement {
  if (!a) return b;
  return (b.until ?? "") > (a.until ?? "") ? b : a;
}

function mergeLonger(map: Record<string, Entitlement>, key: string, ent: Entitlement) {
  map[key] = longer(map[key] ?? null, ent);
}
