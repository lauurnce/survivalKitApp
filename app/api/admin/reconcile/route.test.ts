import { describe, it, expect, vi, beforeEach } from "vitest";

const getAdminSessionMock = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/lib/auth/adminSession", () => ({ getAdminSession: getAdminSessionMock }));

const getLinkByReferenceMock = vi.hoisted(() => vi.fn());
const getPaymentByIdMock = vi.hoisted(() => vi.fn());
vi.mock("@/lib/paymongo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/paymongo")>();
  return {
    ...actual,
    getLinkByReference: getLinkByReferenceMock,
    getPaymentById: getPaymentByIdMock,
  };
});

const recordPaymentMock = vi.hoisted(() => vi.fn(async () => ({ recorded: true, deduped: false })));
vi.mock("@/lib/payments", () => ({ recordPayment: recordPaymentMock }));

vi.mock("@/lib/supabase/server", () => ({ createServerClient: () => ({}) }));

import { POST } from "./route";

const YEAR = "00000000-0000-0000-0000-000000000001";
const DEV = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function req(body: unknown) {
  return { json: async () => body } as unknown as import("next/server").NextRequest;
}

beforeEach(() => {
  getAdminSessionMock.mockResolvedValue(true);
  getLinkByReferenceMock.mockReset();
  getPaymentByIdMock.mockReset();
  recordPaymentMock.mockClear();
  recordPaymentMock.mockResolvedValue({ recorded: true, deduped: false });
});

it("rejects when not authenticated as admin", async () => {
  getAdminSessionMock.mockResolvedValue(false);
  const res = await POST(req({ identifier: "anything" }));
  expect(res.status).toBe(401);
});

it("rejects a request with no identifier", async () => {
  const res = await POST(req({}));
  expect(res.status).toBe(400);
  expect(getLinkByReferenceMock).not.toHaveBeenCalled();
  expect(getPaymentByIdMock).not.toHaveBeenCalled();
});

describe("legacy reference identifier (Links API)", () => {
  it("resolves via getLinkByReference and grants", async () => {
    getLinkByReferenceMock.mockResolvedValue({
      linkId: "link_1",
      remarks: `year:${YEAR} device:${DEV} plan:year_sem`,
      amount: 29900,
      status: "paid",
    });

    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(200);
    expect(getLinkByReferenceMock).toHaveBeenCalledWith("REF123");
    expect(getPaymentByIdMock).not.toHaveBeenCalled();
    expect(recordPaymentMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linkId: "link_1", deviceId: DEV, yearId: YEAR, amount: 29900 })
    );
  });

  it("404s when PayMongo has no such link", async () => {
    getLinkByReferenceMock.mockResolvedValue(null);
    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(404);
  });

  it("rejects when the link is not paid", async () => {
    getLinkByReferenceMock.mockResolvedValue({ linkId: "link_1", remarks: "", amount: 0, status: "unpaid" });
    const res = await POST(req({ identifier: "REF123" }));
    expect(res.status).toBe(400);
  });
});

describe("payment id identifier (Checkout Sessions)", () => {
  it("resolves via getPaymentById and grants", async () => {
    const SUBJ = "10000000-0001-0001-0001-000000000001";
    getPaymentByIdMock.mockResolvedValue({
      remarks: `year:${YEAR} subject:${SUBJ} device:${DEV} plan:subject_month`,
      amount: 4900,
      status: "paid",
    });

    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(200);
    expect(getPaymentByIdMock).toHaveBeenCalledWith("pay_abc123");
    expect(getLinkByReferenceMock).not.toHaveBeenCalled();
    expect(recordPaymentMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linkId: "pay_abc123", deviceId: DEV, yearId: YEAR, amount: 4900 })
    );
  });

  it("404s when PayMongo has no such payment", async () => {
    getPaymentByIdMock.mockResolvedValue(null);
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(404);
  });

  it("rejects when the payment is not paid", async () => {
    getPaymentByIdMock.mockResolvedValue({ remarks: "", amount: 0, status: "awaiting_payment_method" });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed remarks", async () => {
    getPaymentByIdMock.mockResolvedValue({ remarks: "garbage", amount: 4900, status: "paid" });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(422);
  });

  it("rejects underpayment", async () => {
    getPaymentByIdMock.mockResolvedValue({
      remarks: `year:${YEAR} device:${DEV} plan:year_sem`,
      amount: 100,
      status: "paid",
    });
    const res = await POST(req({ identifier: "pay_abc123" }));
    expect(res.status).toBe(400);
  });
});
