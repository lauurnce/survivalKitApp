import type { SupabaseClient } from "@supabase/supabase-js";

export interface DeleteAccountResult {
  ok: boolean;
  error?: string;
}

// RA 10173 right-to-erasure fulfillment for authenticated users. Order matters:
// unlink user_id from every table that references it BEFORE deleting the auth
// user, since those FKs have no ON DELETE clause (see
// supabase/migrations/20260624200000_accounts_user_id.sql) — deleting the auth
// row first would either fail the FK constraint or leave rows in an undefined
// state depending on Postgres's default RESTRICT behavior. Deleting the auth
// user LAST means a mid-failure leaves the account still logged-in and
// intact rather than orphaned data with no way to log back in and retry.
//
// payments rows are NOT deleted — the privacy policy (Section 7) commits to
// retaining payment records "as long as necessary to resolve disputes and
// comply with any applicable accounting or legal obligations." We still sever
// the identity link (user_id -> null) so the ledger entry survives without
// remaining personal data; device_id stays (needed for dispute resolution
// against the original grant, and isn't independently identifying per the
// policy's own description of device_id).
export async function deleteAccount(
  supabase: SupabaseClient,
  userId: string
): Promise<DeleteAccountResult> {
  const unlink = async (table: string) => {
    const { error } = await supabase.from(table).update({ user_id: null }).eq("user_id", userId);
    if (error) throw new Error(`${table}: ${error.message}`);
  };

  try {
    await unlink("subscriptions");
    await unlink("payments");
    await unlink("module_progress");
    await unlink("unlocks");

    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", userId);
    if (profileError) throw new Error(`profiles: ${profileError.message}`);

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) throw new Error(`auth user: ${authError.message}`);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
