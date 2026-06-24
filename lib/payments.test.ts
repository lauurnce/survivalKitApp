import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordPayment, sumRevenueForMonth } from "./payments";

// Chainable Supabase mock.
// payments: select→eq→limit→maybeSingle for replay check; insert for ledger row.
// subscriptions: select→eq→is/eq→maybeSingle for existing-sub check; update/insert for grant.
function makeSupabase(opts: {
  existingLink?: boolean;
  existingSub?: boolean;
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

  const subsBuilder: Record<string, unknown> = {};
  subsBuilder.select = vi.fn().mockReturnValue(subsBuilder);
  subsBuilder.eq = vi.fn().mockReturnValue(subsBuilder);
  subsBuilder.is = vi.fn().mockReturnValue(subsBuilder);
  subsBuilder.maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: opts.existingSub ? { id: "s1" } : null, error: null });
  const subsUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  const subsInsert = vi.fn().mockResolvedValue({ error: null });
  subsBuilder.update = subsUpdate;
  subsBuilder.insert = subsInsert;

  const supabase = {
    from: vi.fn((table: string) =>
      table === "payments" ? paymentsBuilder : subsBuilder
    ),
  };
  return { supabase, paymentsBuilder, subsBuilder, subsUpdate, subsInsert };
}

const input = {
  linkId: "link_abc",
  deviceId: "11111111-1111-1111-1111-111111111111",
  yearId: "22222222-2222-2222-2222-222222222222",
  subjectId: null as string | null,
  amount: 5000,
  paidAt: new Date("2026-06-24T03:00:00Z"),
};

describe("recordPayment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("inserts a ledger row and creates a subscription on a first payment (year plan)", async () => {
    const { supabase, paymentsBuilder, subsInsert } = makeSupabase({});
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(paymentsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        paymongo_link_id: "link_abc",
        device_id: input.deviceId,
        year_id: input.yearId,
        subject_id: null,
        amount: 5000,
        currency: "PHP",
      })
    );
    expect(subsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", subject_id: null })
    );
  });

  it("inserts a ledger row and creates a subscription for a subject plan", async () => {
    const subjectInput = { ...input, subjectId: "33333333-3333-3333-3333-333333333333" };
    const { supabase, paymentsBuilder, subsInsert } = makeSupabase({});
    const res = await recordPayment(supabase as never, subjectInput);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(paymentsBuilder.insert).toHaveBeenCalledTimes(1);
    expect(subsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ subject_id: subjectInput.subjectId, status: "active" })
    );
  });

  it("updates existing subscription instead of inserting when one already exists", async () => {
    const { supabase, subsUpdate, subsInsert } = makeSupabase({ existingSub: true });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(subsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" })
    );
    expect(subsInsert).not.toHaveBeenCalled();
  });

  it("dedups when the link already exists (no insert, no subscription change)", async () => {
    const { supabase, paymentsBuilder, subsInsert, subsUpdate } = makeSupabase({ existingLink: true });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(paymentsBuilder.insert).not.toHaveBeenCalled();
    expect(subsInsert).not.toHaveBeenCalled();
    expect(subsUpdate).not.toHaveBeenCalled();
  });

  it("treats a unique-violation on insert as a dedup, not an error", async () => {
    const { supabase, subsInsert } = makeSupabase({ insertError: { code: "23505" } });
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: false, deduped: true });
    expect(subsInsert).not.toHaveBeenCalled();
  });
});

describe("sumRevenueForMonth", () => {
  it("sums centavos to pesos for rows in the given PH month", () => {
    const rows = [
      { amount: 5000, paid_at: "2026-06-24T03:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-06-01T00:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-05-31T10:00:00Z" }, // May PH
    ];
    expect(sumRevenueForMonth(rows, 2026, 5)).toBe(100);
  });

  it("returns 0 for an empty list", () => {
    expect(sumRevenueForMonth([], 2026, 5)).toBe(0);
  });
});
