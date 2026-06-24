import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordPayment, sumRevenueForMonth } from "./payments";

// Chainable Supabase mock. payments: select→eq→maybeSingle for the replay check,
// insert for the ledger row. subscriptions: upsert.
function makeSupabase(opts: {
  existingLink?: boolean;
  insertError?: { code?: string } | null;
}) {
  const paymentsBuilder: Record<string, unknown> = {};
  paymentsBuilder.select = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.eq = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.limit = vi.fn().mockReturnValue(paymentsBuilder);
  paymentsBuilder.maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: opts.existingLink ? { id: "p1" } : null, error: null });
  paymentsBuilder.insert = vi
    .fn()
    .mockResolvedValue({ error: opts.insertError ?? null });

  const subsUpsert = vi.fn().mockResolvedValue({ error: null });
  const subscriptionsBuilder = { upsert: subsUpsert };

  const supabase = {
    from: vi.fn((table: string) =>
      table === "payments" ? paymentsBuilder : subscriptionsBuilder
    ),
  };
  return { supabase, paymentsBuilder, subsUpsert };
}

const input = {
  linkId: "link_abc",
  deviceId: "11111111-1111-1111-1111-111111111111",
  yearId: "22222222-2222-2222-2222-222222222222",
  amount: 5000,
  paidAt: new Date("2026-06-24T03:00:00Z"),
};

describe("recordPayment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a ledger row and upserts the subscription on a first payment", async () => {
    const { supabase, paymentsBuilder, subsUpsert } = makeSupabase({});
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(paymentsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        paymongo_link_id: "link_abc",
        device_id: input.deviceId,
        year_id: input.yearId,
        amount: 5000,
        currency: "PHP",
      })
    );
    expect(subsUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      { onConflict: "device_id,year_id" }
    );
  });

  it("dedups when the link already exists (no insert, no upsert)", async () => {
    const { supabase, paymentsBuilder, subsUpsert } = makeSupabase({ existingLink: true });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(paymentsBuilder.insert).not.toHaveBeenCalled();
    expect(subsUpsert).not.toHaveBeenCalled();
  });

  it("treats a unique-violation on insert as a dedup, not an error", async () => {
    const { supabase, subsUpsert } = makeSupabase({ insertError: { code: "23505" } });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(subsUpsert).not.toHaveBeenCalled();
  });
});

describe("sumRevenueForMonth", () => {
  it("sums centavos to pesos for rows in the given PH month", () => {
    const rows = [
      { amount: 5000, paid_at: "2026-06-24T03:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-06-01T00:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-05-31T10:00:00Z" }, // May PH
    ];
    // June 2026 => monthIndex0 = 5
    expect(sumRevenueForMonth(rows, 2026, 5)).toBe(100);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenueForMonth([], 2026, 5)).toBe(0);
  });
});
