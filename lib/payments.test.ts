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

  it("returns {recorded:true,deduped:false} when grant INSERT races and gets 23505 (concurrent delivery)", async () => {
    // The payments ledger insert succeeds (no insertError), but the subscriptions
    // INSERT returns 23505 because a concurrent delivery already created the row.
    // A race on the grant should NOT throw — the payment was recorded; the active
    // subscription already exists (correct end state).
    const subsInsert23505 = vi.fn().mockResolvedValue({ error: { code: "23505", message: "duplicate key" } });
    const paymentsBuilder: Record<string, unknown> = {};
    paymentsBuilder.select = vi.fn().mockReturnValue(paymentsBuilder);
    paymentsBuilder.eq = vi.fn().mockReturnValue(paymentsBuilder);
    paymentsBuilder.limit = vi.fn().mockReturnValue(paymentsBuilder);
    paymentsBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    paymentsBuilder.insert = vi.fn().mockResolvedValue({ error: null });

    const subsBuilder: Record<string, unknown> = {};
    subsBuilder.select = vi.fn().mockReturnValue(subsBuilder);
    subsBuilder.eq = vi.fn().mockReturnValue(subsBuilder);
    subsBuilder.is = vi.fn().mockReturnValue(subsBuilder);
    // existingSub = null → INSERT path is taken
    subsBuilder.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    subsBuilder.update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    subsBuilder.insert = subsInsert23505;

    const supabase = { from: vi.fn((t: string) => (t === "payments" ? paymentsBuilder : subsBuilder)) };
    const res = await recordPayment(supabase as never, input);
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(subsInsert23505).toHaveBeenCalledOnce();
  });

  it("writes user_id on payments and subscriptions insert when userId is provided", async () => {
    const userId = "44444444-4444-4444-4444-444444444444";
    const { supabase, paymentsBuilder, subsInsert } = makeSupabase({});
    const res = await recordPayment(supabase as never, { ...input, userId });
    expect(res).toEqual({ recorded: true, deduped: false });
    expect(paymentsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId })
    );
    expect(subsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId })
    );
  });

  it("writes user_id on subscription UPDATE when userId is provided and sub already exists", async () => {
    const userId = "44444444-4444-4444-4444-444444444444";
    const { supabase, subsUpdate } = makeSupabase({ existingSub: true });
    await recordPayment(supabase as never, { ...input, userId });
    expect(subsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: userId })
    );
  });

  it("does NOT include user_id on subscription UPDATE when userId is absent", async () => {
    const { supabase, subsUpdate } = makeSupabase({ existingSub: true });
    await recordPayment(supabase as never, input); // no userId
    const updateArg = (subsUpdate as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(updateArg)).not.toContain("user_id");
  });

  it("writes user_id null on payments insert when userId is absent (device-only)", async () => {
    const { supabase, paymentsBuilder } = makeSupabase({});
    await recordPayment(supabase as never, input); // no userId
    expect(paymentsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: null })
    );
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
