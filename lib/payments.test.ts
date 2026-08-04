import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordPayment, revenueByMonth } from "./payments";

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

  it("writes the caller-supplied periodEnd as current_period_end", async () => {
    const periodEnd = new Date("2026-12-31T15:59:59Z");
    const { supabase, subsInsert } = makeSupabase({});
    await recordPayment(supabase as never, {
      ...input,
      subjectId: "33333333-3333-3333-3333-333333333333",
      amount: 9900,
      periodEnd,
    });
    expect(subsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ current_period_end: periodEnd.toISOString() })
    );
  });

  it("defaults to ~31 days from now when periodEnd is absent", async () => {
    const { supabase, subsInsert } = makeSupabase({});
    await recordPayment(supabase as never, input);
    const row = (subsInsert as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      current_period_end: string;
    };
    const delta = new Date(row.current_period_end).getTime() - Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    expect(delta).toBeGreaterThan(30 * DAY_MS);
    expect(delta).toBeLessThanOrEqual(31 * DAY_MS + 5000);
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

describe("revenueByMonth", () => {
  // 2026-06-24 11:00 PH — mid-June, so "now" sits inside the June bucket.
  const now = new Date("2026-06-24T03:00:00Z");

  it("buckets centavos into pesos per PH month, newest first", () => {
    const rows = [
      { amount: 5000, paid_at: "2026-06-24T03:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-06-01T00:00:00Z" }, // June PH
      { amount: 5000, paid_at: "2026-05-31T10:00:00Z" }, // May PH (18:00 PH)
    ];
    const months = revenueByMonth(rows, 3, now);
    expect(months).toEqual([
      { month: "2026-06", revenue: 100, payments: 2 },
      { month: "2026-05", revenue: 50, payments: 1 },
      { month: "2026-04", revenue: 0, payments: 0 },
    ]);
  });

  it("buckets by PH date, not UTC — a late-UTC payment counts as the next PH month", () => {
    // 2026-05-31 17:00 UTC is 2026-06-01 01:00 PH.
    const months = revenueByMonth([{ amount: 9900, paid_at: "2026-05-31T17:00:00Z" }], 2, now);
    expect(months[0]).toEqual({ month: "2026-06", revenue: 99, payments: 1 });
    expect(months[1]).toEqual({ month: "2026-05", revenue: 0, payments: 0 });
  });

  it("returns a full zero-filled window for an empty list", () => {
    const months = revenueByMonth([], 12, now);
    expect(months).toHaveLength(12);
    expect(months.every(m => m.revenue === 0 && m.payments === 0)).toBe(true);
  });

  it("rolls the window back across a year boundary", () => {
    const january = new Date("2026-01-15T03:00:00Z");
    const months = revenueByMonth([{ amount: 29900, paid_at: "2025-12-20T03:00:00Z" }], 3, january);
    expect(months.map(m => m.month)).toEqual(["2026-01", "2025-12", "2025-11"]);
    expect(months[1]).toEqual({ month: "2025-12", revenue: 299, payments: 1 });
  });

  it("ignores rows that fall outside the window", () => {
    const rows = [
      { amount: 5000, paid_at: "2026-06-10T03:00:00Z" }, // in window
      { amount: 5000, paid_at: "2025-01-10T03:00:00Z" }, // far older than 3 months
    ];
    const months = revenueByMonth(rows, 3, now);
    expect(months.reduce((sum, m) => sum + m.revenue, 0)).toBe(50);
  });
});
