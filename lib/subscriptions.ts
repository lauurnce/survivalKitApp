import { createServerClient } from "./supabase/server";

export async function isSubscribed(deviceId: string, yearId: string): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production");
    }
    return true;
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("device_id", deviceId)
    .eq("year_id", yearId)
    .eq("status", "active")
    .limit(1)
    .single();

  return !!data;
}
