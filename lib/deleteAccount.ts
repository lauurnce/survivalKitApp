import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "@/lib/validation";

export interface DeleteAccountResult {
  ok: boolean;
  error?: string;
}

export interface DeleteAccountOptions {
  /**
   * Device ids proven to belong to this user beyond the ones already linked to
   * their user_id — in practice the verified device cookie of the browser
   * making the erasure request.
   */
  extraDeviceIds?: string[];
  /** Injectable for tests: the replacement id for one erased device. */
  newToken?: () => string;
}

type DbError = { message: string; code?: string } | null;

// PostgREST answers PGRST205 ("Could not find the table … in the schema
// cache") for a table that does not exist; Postgres itself says 42P01.
function isMissingTable(error: DbError): boolean {
  return !!error && (error.code === "PGRST205" || error.code === "42P01");
}

// RA 10173 right-to-erasure fulfillment for authenticated users.
//
// Every table holding identity (user_id, device_id, email) gets one decision.
// The privacy report (lib/reports/privacyPosture.ts) reads the table names out
// of this file's `.from("…")` calls, and its RETENTION_REGISTER lists the
// tables kept on purpose, so a table added without a decision here surfaces
// there as residue.
//
//   DELETE — personal content with no reason to outlive the account:
//     profiles, subject_quiz_progress (answers cascade via progress_id),
//     user_feedback, email_outbox (holds to_email), email_unsubscribes,
//     waitlist (name + email; matched by account email and by device), and
//     class_join_requests (the user's own requests, by device).
//
//   ANONYMIZE — aggregate analytics that stay useful without a person behind
//     them: events and counter_log get their device_id re-keyed to a fresh
//     random id per device. The rows still count, but no longer join to the
//     device's retained rows or to anything the same browser does next.
//
//   UNLINK (user_id -> null, device_id kept) — privacy policy Section 6
//     promises to "unlink your name from your subscription and progress
//     history"; Section 7 keeps payment records for disputes and accounting:
//     subscriptions, payments, unlocks, module_progress, module_quiz_progress,
//     module_quiz_answers. The device keeps what it paid for and what it
//     studied; nothing ties it back to the deleted account. module_quiz_* have
//     to be unlinked regardless: their user_id FK has no ON DELETE clause, so a
//     remaining link makes the auth delete fail outright.
//
//   KEEP — classes (rep_device_id) and class_members: a class is a paid,
//     shared entitlement other students depend on, keyed only by pseudonymous
//     device ids. Both are in RETENTION_REGISTER.
//
// Order matters. Reads first (which devices and which email are this user's),
// then device-scoped work, then user-scoped deletes and unlinks, and the auth
// user LAST: a mid-failure leaves the account logged-in and intact, and since
// the unlinks run after device discovery, a retry rediscovers the same devices.
export async function deleteAccount(
  supabase: SupabaseClient,
  userId: string,
  options: DeleteAccountOptions = {}
): Promise<DeleteAccountResult> {
  const newToken = options.newToken ?? randomUUID;
  const check = (table: string, error: DbError) => {
    if (error) throw new Error(`${table}: ${error.message}`);
  };
  const deviceIds = new Set((options.extraDeviceIds ?? []).filter((id) => isUuid(id)));
  const collect = (
    table: string,
    result: { data: { device_id: string | null }[] | null; error: DbError }
  ) => {
    check(table, result.error);
    for (const row of result.data ?? []) if (row.device_id) deviceIds.add(String(row.device_id));
  };

  try {
    // ── 1. Discover this user's devices and email ─────────────────────────
    collect("subscriptions", await supabase.from("subscriptions").select("device_id").eq("user_id", userId));
    collect("payments", await supabase.from("payments").select("device_id").eq("user_id", userId));
    collect("unlocks", await supabase.from("unlocks").select("device_id").eq("user_id", userId));
    collect("module_progress", await supabase.from("module_progress").select("device_id").eq("user_id", userId));
    collect(
      "module_quiz_progress",
      await supabase.from("module_quiz_progress").select("device_id").eq("user_id", userId)
    );
    collect("user_feedback", await supabase.from("user_feedback").select("device_id").eq("user_id", userId));
    const devices = [...deviceIds];

    const { data: authData, error: lookupError } = await supabase.auth.admin.getUserById(userId);
    if (lookupError) throw new Error(`auth lookup: ${lookupError.message}`);
    const email = authData?.user?.email?.trim() || null;

    // ── 2. Device- and email-scoped: delete personal rows, anonymize analytics
    if (devices.length > 0) {
      check("waitlist", (await supabase.from("waitlist").delete().in("device_id", devices)).error);
      check(
        "class_join_requests",
        (await supabase.from("class_join_requests").delete().in("device_id", devices)).error
      );
      // One token per device: counter_log's primary key is
      // (device_id, resource_type, resource_id), so folding two devices into
      // one token could collide on a resource both of them read.
      for (const deviceId of devices) {
        const token = newToken();
        check("events", (await supabase.from("events").update({ device_id: token }).eq("device_id", deviceId)).error);
        check(
          "counter_log",
          (await supabase.from("counter_log").update({ device_id: token }).eq("device_id", deviceId)).error
        );
      }
    }
    if (email) {
      // Exact matches only (as stored, and lower-cased). A LIKE pattern would
      // treat `_` in an address as a wildcard and could reach someone else's row.
      const emails = [...new Set([email, email.toLowerCase()])];
      check("waitlist", (await supabase.from("waitlist").delete().in("email", emails)).error);
    }

    // ── 3. User-scoped: delete personal content ───────────────────────────
    // subject_quiz_progress (migration 20260827000001) is not on every
    // database — production has never had it applied. With no table there is
    // nothing of this user's to erase, so a missing table must not block the
    // rest of the erasure; every self-service deletion failed on it.
    const subjectQuiz = (await supabase.from("subject_quiz_progress").delete().eq("user_id", userId)).error;
    if (!isMissingTable(subjectQuiz)) check("subject_quiz_progress", subjectQuiz);
    check("user_feedback", (await supabase.from("user_feedback").delete().eq("user_id", userId)).error);
    check("email_outbox", (await supabase.from("email_outbox").delete().eq("user_id", userId)).error);
    check("email_unsubscribes", (await supabase.from("email_unsubscribes").delete().eq("user_id", userId)).error);
    check("profiles", (await supabase.from("profiles").delete().eq("user_id", userId)).error);

    // ── 4. User-scoped: sever the link, keep the device's rows ────────────
    const unlinked = { user_id: null };
    check("subscriptions", (await supabase.from("subscriptions").update(unlinked).eq("user_id", userId)).error);
    check("payments", (await supabase.from("payments").update(unlinked).eq("user_id", userId)).error);
    check("unlocks", (await supabase.from("unlocks").update(unlinked).eq("user_id", userId)).error);
    check("module_progress", (await supabase.from("module_progress").update(unlinked).eq("user_id", userId)).error);
    check(
      "module_quiz_answers",
      (await supabase.from("module_quiz_answers").update(unlinked).eq("user_id", userId)).error
    );
    check(
      "module_quiz_progress",
      (await supabase.from("module_quiz_progress").update(unlinked).eq("user_id", userId)).error
    );

    // ── 5. The login itself, last ─────────────────────────────────────────
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw new Error(`auth user: ${authError.message}`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
