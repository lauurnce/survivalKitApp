import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

export async function isSubscribed(
  deviceId: string,
  yearId: string,
  subjectId?: string,
  userId?: string,
): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production");
    }
    return true;
  }

  const now = new Date().toISOString();
  const supabase = createServerClient();
  const useUser = isUuid(userId);
  const col = useUser ? "user_id" : "device_id";
  const val = useUser ? (userId as string) : deviceId;

  // Year-level plan (subject_id IS NULL) unlocks everything in the year
  const { data: yearPlan } = await supabase
    .from("subscriptions")
    .select("id")
    .eq(col, val)
    .eq("year_id", yearId)
    .is("subject_id", null)
    .eq("status", "active")
    .gt("current_period_end", now)
    .limit(1)
    .maybeSingle();

  if (yearPlan) return true;

  // Subject-level plan only unlocks the specific subject
  if (!subjectId) return false;

  const { data: subjectPlan } = await supabase
    .from("subscriptions")
    .select("id")
    .eq(col, val)
    .eq("year_id", yearId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .gt("current_period_end", now)
    .limit(1)
    .maybeSingle();

  if (subjectPlan) return true;

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

  return !!membership;
}
