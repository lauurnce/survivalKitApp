import { createServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

const TABLES = ["subscriptions", "payments", "module_progress", "unlocks"] as const;

/**
 * Migrate a device's unclaimed rows onto a logged-in user. Only touches rows
 * matching the given device_id whose user_id is still NULL, so it can never
 * reassign another account's rows. Safe to call on every login (idempotent).
 */
export async function claimDeviceRows(userId: string, deviceId: string): Promise<void> {
  if (!isUuid(userId) || !isUuid(deviceId)) return;
  const supabase = createServerClient();
  await Promise.all(
    TABLES.map((table) =>
      supabase
        .from(table)
        .update({ user_id: userId })
        .eq("device_id", deviceId)
        .is("user_id", null),
    ),
  );
}
