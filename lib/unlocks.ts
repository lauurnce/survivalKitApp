import { createServerClient } from "./supabase/server";
import { isUuid } from "./validation";

export async function isUnlocked(
  deviceId: string,
  moduleId: string,
  userId?: string,
): Promise<boolean> {
  if (process.env.UNLOCK_ALL === "true") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("UNLOCK_ALL must not be set in production — disable it in Vercel environment variables");
    }
    return true;
  }

  const supabase = createServerClient();
  const useUser = isUuid(userId);
  const { data } = await supabase
    .from("unlocks")
    .select("id")
    .eq(useUser ? "user_id" : "device_id", useUser ? (userId as string) : deviceId)
    .eq("module_id", moduleId)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  return !!data;
}
