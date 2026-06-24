import type { SupabaseClient } from "@supabase/supabase-js";

export const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

const PERIOD_DAYS = 31;

export interface RecordPaymentInput {
  linkId: string;
  deviceId: string;
  yearId: string;
  amount: number; // centavos
  paidAt: Date;
}

// Append-only ledger write + subscription grant. Idempotent on linkId: a
// replayed webhook (same single-use link) is deduped and does NOT extend access.
export async function recordPayment(
  supabase: SupabaseClient,
  input: RecordPaymentInput
): Promise<{ recorded: boolean; deduped: boolean }> {
  const { linkId, deviceId, yearId, amount, paidAt } = input;

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

  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      device_id: deviceId,
      year_id: yearId,
      paymongo_link_id: linkId,
      status: "active",
      current_period_end: currentPeriodEnd.toISOString(),
    },
    { onConflict: "device_id,year_id" }
  );

  if (upsertError) throw new Error(upsertError.message);

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
