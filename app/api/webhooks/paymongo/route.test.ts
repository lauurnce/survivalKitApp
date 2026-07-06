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
vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => ({}) }));

import { POST } from "./route";

const SECRET = "whsk_test_secret";
const YEAR = "00000000-0000-0000-0000-000000000001";
const SUBJ = "10000000-0001-0001-0001-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

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
