import { createServerClient } from "./supabase/server";

/**
 * Check whether a device has an approved unlock for a given module.
 * TODO: PayMongo integration stub — swap body here when auto-verification is live.
 */
export async function isUnlocked(deviceId: string, moduleId: string): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") return true;

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
