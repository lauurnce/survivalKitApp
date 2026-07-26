import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaidLink } from "./paymongo";

const listRecentPaidLinks = vi.fn<() => Promise<PaidLink[]>>();
vi.mock("./paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./paymongo")>();
  // parseBlockRemarks is the real implementation — the whole point of these
  // tests is that reconcile agrees with it.
  return { ...actual, listRecentPaidLinks: () => listRecentPaidLinks() };
});

const { findUnreflectedPayments } = await import("./reconcile");

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const DEVICE = "33333333-3333-3333-3333-333333333333";

function paidLink(over: Partial<PaidLink> = {}): PaidLink {
  const remarks = over.remarks ?? `year:${YEAR} device:${DEVICE} plan:year_sem`;
  return {
    linkId: "link_1",
    amount: 29900,
    description: "BSIT Survival Kit",
    reference: "REF1",
    paidAt: new Date("2026-07-20T10:00:00Z"),
    remarks,
    yearId: YEAR,
    subjectId: null,
    deviceId: DEVICE,
    userId: null,
    plan: "year_sem",
    ...over,
  };
}

// A block sale's remarks carry no device:/user: token, so parseLinkRemarks
// leaves those null — exactly as lib/paymongo produces them in production.
function blockLink(over: Partial<PaidLink> = {}): PaidLink {
  return paidLink({
    linkId: "link_block",
    reference: "REFBLOCK",
    amount: 99900,
    remarks: `block:1 year:${YEAR} seats:20 rep:${DEVICE}`,
    deviceId: null,
    userId: null,
    plan: null,
    ...over,
  });
}

/**
 * Minimal Supabase stub. Each table answers one query shape:
 *   payments      select→in       → ledger rows
 *   classes       select→in       → fulfilled block sales
 *   subscriptions select→eq→gt→or → active subscriptions
 */
function makeSupabase(opts: {
  ledgeredLinkIds?: string[];
  classLinkIds?: string[];
  activeSubs?: Array<{
    device_id: string | null;
    user_id: string | null;
    year_id: string;
    subject_id: string | null;
  }>;
}) {
  const classesIn = vi.fn().mockResolvedValue({
    data: (opts.classLinkIds ?? []).map((id) => ({ paymongo_link_id: id })),
    error: null,
  });

  const supabase = {
    from: vi.fn((table: string) => {
      if (table === "payments") {
        return {
          select: () => ({
            in: vi.fn().mockResolvedValue({
              data: (opts.ledgeredLinkIds ?? []).map((id) => ({ paymongo_link_id: id })),
              error: null,
            }),
          }),
        };
      }
      if (table === "classes") {
        return { select: () => ({ in: classesIn }) };
      }
      return {
        select: () => ({
          eq: () => ({
            gt: () => ({
              or: vi.fn().mockResolvedValue({ data: opts.activeSubs ?? [], error: null }),
            }),
          }),
        }),
      };
    }),
  };

  return { supabase: supabase as unknown as SupabaseClient, classesIn };
}

describe("findUnreflectedPayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listRecentPaidLinks.mockResolvedValue([]);
  });

  it("returns nothing when PayMongo reports no paid links", async () => {
    const { supabase } = makeSupabase({});
    expect(await findUnreflectedPayments(supabase)).toEqual([]);
  });

  it("skips a device purchase already covered by an active year subscription", async () => {
    listRecentPaidLinks.mockResolvedValue([paidLink()]);
    const { supabase } = makeSupabase({
      activeSubs: [{ device_id: DEVICE, user_id: null, year_id: YEAR, subject_id: null }],
    });
    expect(await findUnreflectedPayments(supabase)).toEqual([]);
  });

  it("flags a device purchase with no matching subscription", async () => {
    listRecentPaidLinks.mockResolvedValue([paidLink()]);
    const { supabase } = makeSupabase({ activeSubs: [] });

    const out = await findUnreflectedPayments(supabase);
    expect(out).toHaveLength(1);
    expect(out[0].reason).toBe("no_subscription");
    expect(out[0].hasLedgerRow).toBe(false);
  });

  it("reports hasLedgerRow when the payment was recorded but the subscription is missing", async () => {
    listRecentPaidLinks.mockResolvedValue([paidLink()]);
    const { supabase } = makeSupabase({ ledgeredLinkIds: ["link_1"], activeSubs: [] });

    const out = await findUnreflectedPayments(supabase);
    expect(out[0]).toMatchObject({ reason: "no_subscription", hasLedgerRow: true });
  });

  it("flags remarks that carry no usable year or device", async () => {
    listRecentPaidLinks.mockResolvedValue([
      paidLink({ remarks: "garbage", yearId: null, deviceId: null }),
    ]);
    const { supabase } = makeSupabase({});

    const out = await findUnreflectedPayments(supabase);
    expect(out[0].reason).toBe("malformed_remarks");
  });

  // ── Class block sales ──────────────────────────────────────────────────────
  // Regression: block remarks have no device: token, so a fulfilled block sale
  // used to fall through to the !deviceId check and be reported forever as
  // "malformed_remarks" — a permanent false positive on the admin dashboard.

  it("does not flag a class block sale that already created its class", async () => {
    listRecentPaidLinks.mockResolvedValue([blockLink()]);
    const { supabase } = makeSupabase({
      ledgeredLinkIds: ["link_block"],
      classLinkIds: ["link_block"],
      activeSubs: [],
    });

    expect(await findUnreflectedPayments(supabase)).toEqual([]);
  });

  it("flags a class block sale whose class row was never created", async () => {
    listRecentPaidLinks.mockResolvedValue([blockLink()]);
    const { supabase } = makeSupabase({
      ledgeredLinkIds: ["link_block"],
      classLinkIds: [],
      activeSubs: [],
    });

    const out = await findUnreflectedPayments(supabase);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      reason: "class_block_unfulfilled",
      reference: "REFBLOCK",
      hasLedgerRow: true,
    });
  });

  it("resolves a subject-scoped block sale against the classes table too", async () => {
    listRecentPaidLinks.mockResolvedValue([
      blockLink({
        remarks: `block:1 year:${YEAR} subject:${SUBJECT} seats:15 rep:${DEVICE}`,
        subjectId: SUBJECT,
        amount: 79900,
      }),
    ]);
    const { supabase, classesIn } = makeSupabase({ classLinkIds: ["link_block"] });

    expect(await findUnreflectedPayments(supabase)).toEqual([]);
    expect(classesIn).toHaveBeenCalledWith("paymongo_link_id", ["link_block"]);
  });

  it("never queries the classes table when no block sales are present", async () => {
    listRecentPaidLinks.mockResolvedValue([paidLink()]);
    const { supabase, classesIn } = makeSupabase({
      activeSubs: [{ device_id: DEVICE, user_id: null, year_id: YEAR, subject_id: null }],
    });

    await findUnreflectedPayments(supabase);
    expect(classesIn).not.toHaveBeenCalled();
  });

  it("classifies block and device purchases independently in one batch", async () => {
    listRecentPaidLinks.mockResolvedValue([
      blockLink(),
      paidLink({ linkId: "link_1", reference: "REF1" }),
    ]);
    const { supabase } = makeSupabase({ classLinkIds: ["link_block"], activeSubs: [] });

    const out = await findUnreflectedPayments(supabase);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ reference: "REF1", reason: "no_subscription" });
  });

  it("sorts the most recently paid first", async () => {
    listRecentPaidLinks.mockResolvedValue([
      paidLink({ linkId: "old", reference: "OLD", paidAt: new Date("2026-07-01T00:00:00Z") }),
      paidLink({ linkId: "new", reference: "NEW", paidAt: new Date("2026-07-25T00:00:00Z") }),
    ]);
    const { supabase } = makeSupabase({ activeSubs: [] });

    const out = await findUnreflectedPayments(supabase);
    expect(out.map((r) => r.reference)).toEqual(["NEW", "OLD"]);
  });
});
