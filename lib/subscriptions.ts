import { createServerClient } from "./supabase/server";

export async function isSubscribed(
  deviceId: string,
  yearId: string,
  subjectId?: string
): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production");
    }
    return true;
  }

  const now = new Date().toISOString();
  const supabase = createServerClient();

  // Year-level plan (subject_id IS NULL) unlocks everything in the year
  const { data: yearPlan } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("device_id", deviceId)
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
    .eq("device_id", deviceId)
    .eq("year_id", yearId)
    .eq("subject_id", subjectId)
    .eq("status", "active")
    .gt("current_period_end", now)
    .limit(1)
    .maybeSingle();

  return !!subjectPlan;
}
