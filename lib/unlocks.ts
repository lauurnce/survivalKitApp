import { createServerClient } from "./supabase/server";

export async function isUnlocked(deviceId: string, moduleId: string): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production — disable it in Vercel environment variables");
    }
    return true;
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("unlocks")
    .select("id")
    .eq("device_id", deviceId)
    .eq("module_id", moduleId)
    .eq("status", "approved")
    .limit(1)
    .single();

  return !!data;
}
