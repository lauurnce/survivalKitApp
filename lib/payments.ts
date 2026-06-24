import type { SupabaseClient } from "@supabase/supabase-js";

export const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

const PERIOD_DAYS = 31;

export interface RecordPaymentInput {
  linkId: string;
  deviceId: string;
  yearId: string;
  // null = whole-year plan (₱300); set = single-subject plan (₱50).
  subjectId: string | null;
  amount: number; // centavos
  paidAt: Date;
}

// Append-only ledger write + subscription grant. Idempotent on linkId: a
// replayed webhook (same single-use link) is deduped and does NOT extend access.
export async function recordPayment(
  supabase: SupabaseClient,
  input: RecordPaymentInput
): Promise<{ recorded: boolean; deduped: boolean }> {
  const { linkId, deviceId, yearId, subjectId, amount, paidAt } = input;

  // Replay check against the ledger.
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("paymongo_link_id", linkId)
    .limit(1)
    .maybeSingle();

  if (existing) return { recorded: false, deduped: true };

  // Ledger row first — never grant access without a recorded payment.
  const { error: insertError } = await supabase.from("payments").insert({
    paymongo_link_id: linkId,
    device_id: deviceId,
    year_id: yearId,
    subject_id: subjectId,
    amount,
    currency: "PHP",
    paid_at: paidAt.toISOString(),
  });

  if (insertError) {
    // 23505 = unique_violation: a concurrent delivery beat us. Treat as dedup.
    if ((insertError as { code?: string }).code === "23505") {
      return { recorded: false, deduped: true };
    }
    throw new Error(insertError.message);
  }

  // Grant / extend access.
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + PERIOD_DAYS);

  // Use a manual upsert because the unique indexes are partial (one for
  // year plans where subject_id IS NULL, one where it IS NOT NULL).
  // Supabase's onConflict helper requires a single non-partial index.
  let subQuery = supabase
    .from("subscriptions")
    .select("id")
    .eq("device_id", deviceId)
    .eq("year_id", yearId);
  if (subjectId === null) {
    subQuery = subQuery.is("subject_id", null);
  } else {
    subQuery = subQuery.eq("subject_id", subjectId);
  }
  const { data: existingSub } = await subQuery.maybeSingle();

  let upsertError;
  if (existingSub) {
    ({ error: upsertError } = await supabase
      .from("subscriptions")
      .update({ status: "active", current_period_end: currentPeriodEnd.toISOString(), paymongo_link_id: linkId })
      .eq("id", existingSub.id));
  } else {
    ({ error: upsertError } = await supabase.from("subscriptions").insert({
      device_id: deviceId,
      year_id: yearId,
      subject_id: subjectId,
      paymongo_link_id: linkId,
      status: "active",
      current_period_end: currentPeriodEnd.toISOString(),
    }));
  }

  if (upsertError) {
    // 23505 = unique_violation on the INSERT path only: a concurrent payment
    // delivery already created the active subscription row. The ledger row was
    // written by this call, so this is NOT a dedup — the payment was recorded.
    if (!existingSub && (upsertError as { code?: string }).code === "23505") {
      return { recorded: true, deduped: false };
    }
    throw new Error(upsertError.message);
  }

  return { recorded: true, deduped: false };
}

// Sum ledger rows (centavos) to pesos for a given PH calendar month.
export function sumRevenueForMonth(
  rows: { amount: number; paid_at: string }[],
  year: number,
  monthIndex0: number
): number {
  let centavos = 0;
  for (const r of rows) {
    const ph = new Date(new Date(r.paid_at).getTime() + PH_OFFSET_MS);
    if (ph.getUTCFullYear() === year && ph.getUTCMonth() === monthIndex0) {
      centavos += r.amount;
    }
  }
  return centavos / 100;
}
