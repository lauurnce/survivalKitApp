import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { SEMESTER_END } from "@/lib/paymongo";

const recorded: Array<Record<string, unknown>> = [];
vi.mock("@/lib/payments", () => ({
  recordPayment: (_supabase: unknown, input: Record<string, unknown>) => {
    recorded.push(input);
    return Promise.resolve({ recorded: true, deduped: false });
  },
}));

// Chainable Supabase mock, dispatched per-table, for the class-purchase
// branch only (the device-subscription path never touches createServerClient
// directly — it goes through the mocked recordPayment above).
// payments: insert() resolves directly (ledger row, no chaining needed).
// classes: insert() resolves directly (or a 23505 collision on the first N
// attempts, to exercise the retry loop).
const paymentsInserts: Array<Record<string, unknown>> = [];
const classesInserts: Array<Record<string, unknown>> = [];
let paymentsInsertError: { message: string; code?: string } | null = null;
let classesInsertErrors: ({ message: string; code?: string } | null)[] = [null];
let classesInsertCallIndex = 0;

function makeMockSupabase() {
  return {
    from: (table: string) => {
      if (table === "payments") {
        return {
          insert: (row: Record<string, unknown>) => {
            paymentsInserts.push(row);
            return Promise.resolve({ error: paymentsInsertError });
          },
        };
      }
      if (table === "classes") {
        return {
          insert: (row: Record<string, unknown>) => {
            classesInserts.push(row);
            const err = classesInsertErrors[classesInsertCallIndex] ?? null;
            classesInsertCallIndex++;
            return Promise.resolve({ error: err });
          },
        };
      }
      throw new Error(`Unexpected table in mock: ${table}`);
    },
  };
}

vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => makeMockSupabase() }));

import { POST } from "./route";

const SECRET = "whsk_test_secret";
const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const REP_DEVICE = "bbbbbbbb-cccc-dddd-eeee-ffffffffffff";

let ipCounter = 0;
function signedRequest(remarks: string, amount: number) {
  const body = JSON.stringify({
    data: {
      attributes: {
        type: "link.payment.paid",
        livemode: false,
        data: { id: "link_test_1", attributes: { remarks, amount, status: "paid" } },
      },
    },
  });
  const t = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac("sha256", SECRET).update(`${t}.${body}`).digest("hex");
  const ip = `10.2.0.${ipCounter++ % 250}`;
  return {
    text: () => Promise.resolve(body),
    headers: {
      get: (h: string) =>
        h === "paymongo-signature" ? `t=${t},te=${hmac},li=${hmac}` : ip,
    },
  } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  recorded.length = 0;
  paymentsInserts.length = 0;
  classesInserts.length = 0;
  paymentsInsertError = null;
  classesInsertErrors = [null];
  classesInsertCallIndex = 0;
  vi.stubEnv("PAYMONGO_WEBHOOK_SECRET", SECRET);
});

describe("webhook plan handling", () => {
  it("grants a subject_sem payment until SEMESTER_END", async () => {
    const res = await POST(
      signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV} plan:subject_sem`, 9900)
    );
    expect(res.status).toBe(200);
    expect(recorded).toHaveLength(1);
    expect((recorded[0].periodEnd as Date).getTime()).toBe(SEMESTER_END.getTime());
  });

  it("rejects a subject_sem underpayment at the semester price", async () => {
    const res = await POST(
      signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV} plan:subject_sem`, 4900)
    );
    expect(res.status).toBe(400);
    expect(recorded).toHaveLength(0);
  });

  it("treats legacy remarks without a plan token as before (subject_month at 4900)", async () => {
    const res = await POST(signedRequest(`year:${YEAR} subject:${SUBJ} device:${DEV}`, 4900));
    expect(res.status).toBe(200);
    expect(recorded).toHaveLength(1);
    // subject_month: ~31 days, definitely not SEMESTER_END
    expect((recorded[0].periodEnd as Date).getTime()).not.toBe(SEMESTER_END.getTime());
  });

  it("grants a year_sem payment at 29900 until SEMESTER_END", async () => {
    const res = await POST(signedRequest(`year:${YEAR} device:${DEV} plan:year_sem`, 29900));
    expect(res.status).toBe(200);
    expect((recorded[0].periodEnd as Date).getTime()).toBe(SEMESTER_END.getTime());
  });
});

describe("POST /api/webhooks/paymongo - class purchase branch", () => {
  it("creates a classes row and a payments row when remarks contain block:1", async () => {
    // computeAmount('subject', 15) = 79900 + 4*5900 = 103500
    const paidAmount = 103500;
    const res = await POST(
      signedRequest(
        `block:1 year:${YEAR} subject:${SUBJ} seats:15 rep:${REP_DEVICE}`,
        paidAmount
      )
    );
    expect(res.status).toBe(200);

    expect(recorded).toHaveLength(0); // device-subscription path untouched

    expect(paymentsInserts).toHaveLength(1);
    expect(paymentsInserts[0]).toMatchObject({
      device_id: REP_DEVICE,
      amount: paidAmount,
      year_id: YEAR,
      subject_id: SUBJ,
    });

    expect(classesInserts).toHaveLength(1);
    expect(classesInserts[0]).toMatchObject({
      subject_id: SUBJ,
      year_id: YEAR,
      rep_device_id: REP_DEVICE,
      seat_cap: 15,
      status: "active",
      current_period_end: SEMESTER_END.toISOString(),
      paymongo_link_id: "link_test_1",
    });
    expect(classesInserts[0].paymongo_link_id).not.toMatch(/^block-/);
    expect(typeof classesInserts[0].code).toBe("string");
    expect((classesInserts[0].code as string)).toHaveLength(6);
  });

  it("creates a classes row with subject_id null for an all-subjects purchase", async () => {
    // computeAmount('all', 11) = 99900
    const paidAmount = 99900;
    const res = await POST(
      signedRequest(`block:1 year:${YEAR} seats:11 rep:${REP_DEVICE}`, paidAmount)
    );
    expect(res.status).toBe(200);
    expect(classesInserts).toHaveLength(1);
    expect(classesInserts[0].subject_id).toBeNull();
    expect(paymentsInserts[0].subject_id).toBeNull();
  });

  it("rejects underpayment: paidAmount less than the recomputed expected amount", async () => {
    // expected for subject/15 seats = 103500; pay less
    const res = await POST(
      signedRequest(`block:1 year:${YEAR} subject:${SUBJ} seats:15 rep:${REP_DEVICE}`, 100000)
    );
    expect(res.status).toBe(400);
    expect(paymentsInserts).toHaveLength(0);
    expect(classesInserts).toHaveLength(0);
  });

  it("retries code generation on a unique-constraint collision, mirroring grant-class's existing retry logic", async () => {
    classesInsertErrors = [{ message: "duplicate", code: "23505" }, null];
    const res = await POST(
      signedRequest(`block:1 year:${YEAR} subject:${SUBJ} seats:11 rep:${REP_DEVICE}`, 79900)
    );
    expect(res.status).toBe(200);
    expect(classesInserts).toHaveLength(2);
  });

  it("dedupes a replayed webhook (23505 on payments insert) without creating a duplicate class", async () => {
    paymentsInsertError = { message: "duplicate", code: "23505" };
    const res = await POST(
      signedRequest(`block:1 year:${YEAR} subject:${SUBJ} seats:11 rep:${REP_DEVICE}`, 79900)
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true, deduped: true });
    expect(classesInserts).toHaveLength(0);
  });
});
