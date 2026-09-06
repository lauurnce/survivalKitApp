import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPaymongoLink,
  createDynamicPaymongoLink,
  verifyPaymongoWebhook,
  parseLinkRemarks,
  getLinkByReference,
  getCheckoutSessionById,
  getPaymentById,
  listRecentPaidLinks,
  PLANS,
  SEMESTER_END,
  resolvePlan,
  periodEndFor,
  MIN_CHARGE,
  COUPON_DISCOUNT,
  couponDiscountFor,
  MAX_SEATS,
  type PlanKey,
} from "./paymongo";
import crypto from "crypto";

const FAKE_SECRET = "sk_test_fakesecretkey";
const FAKE_WEBHOOK_SECRET = "whsec_fakewebhooksecret";

describe("createPaymongoLink", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("throws if PAYMONGO_SECRET_KEY is missing", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(
      createPaymongoLink("year-1", "device-1", "https://example.com/success")
    ).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });

  it("calls PayMongo checkout sessions API with correct amount and returns checkout URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_abc123",
          attributes: { checkout_url: "https://checkout.paymongo.com/abc" },
        },
      }),
    } as Response);

    const result = await createPaymongoLink("year-1", "device-1", "https://example.com/success");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/checkout_sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic"),
          // Idempotency key prevents duplicate charges on retry/double-click.
          "Idempotency-Key": expect.any(String),
        }),
      })
    );
    // The session is created for the pinned subscription price.
    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.line_items[0].amount).toBe(PLANS.year_sem.amount);
    expect(sentBody.data.attributes.payment_method_types).toEqual(
      expect.arrayContaining(["card", "gcash", "paymaya", "grab_pay"])
    );
    expect(result.checkoutUrl).toBe("https://checkout.paymongo.com/abc");
    expect(result.linkId).toBe("cs_abc123");
  });

  it("uses a stable idempotency key for the same device+year", async () => {
    const mockOk = () =>
      ({
        ok: true,
        json: async () => ({
          data: {
            id: "link_abc123",
            attributes: { checkout_url: "https://checkout.paymongo.com/abc" },
          },
        }),
      }) as Response;
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());

    await createPaymongoLink("year-1", "device-1", "https://example.com/s");
    await createPaymongoLink("year-1", "device-1", "https://example.com/s");

    const headers = (i: number) =>
      (vi.mocked(fetch).mock.calls[i][1]!.headers as Record<string, string>)[
        "Idempotency-Key"
      ];
    expect(headers(0)).toBe(headers(1));
  });

  it("throws on PayMongo API error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: "Invalid API key" }] }),
    } as Response);

    await expect(
      createPaymongoLink("year-1", "device-1", "https://example.com/success")
    ).rejects.toThrow("PayMongo error");
  });

  // Checkout Sessions carries both redirect legs at creation time as
  // separate top-level fields. A cancelled payment must land on the
  // cancel leg WITHOUT ?payment=success, or the module pages would poll,
  // unlock, and flash success UI.
  function sentRedirect(i = 0): { success: string; failed: string } {
    const attrs = JSON.parse(
      vi.mocked(fetch).mock.calls[i][1]!.body as string
    ).data.attributes;
    return { success: attrs.success_url, failed: attrs.cancel_url };
  }

  it("defaults the failed redirect leg to the success URL when failedUrl is omitted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "cs_r1", attributes: { checkout_url: "https://checkout.paymongo.com/r" } },
      }),
    } as Response);

    await createPaymongoLink(
      "year-1", "device-1", "https://example.com/return?payment=success"
    );

    expect(sentRedirect()).toEqual({
      success: "https://example.com/return?payment=success",
      failed: "https://example.com/return?payment=success",
    });
  });

  it("sends a separate failed redirect leg that never carries payment=success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "cs_r2", attributes: { checkout_url: "https://checkout.paymongo.com/r" } },
      }),
    } as Response);

    await createPaymongoLink(
      "year-1",
      "device-1",
      "https://example.com/year/y/subjects/s/modules/m?payment=success",
      null,
      undefined,
      undefined,
      "https://example.com/year/y/subjects/s/modules/m"
    );

    const redirect = sentRedirect();
    expect(redirect.success).toContain("payment=success");
    expect(redirect.failed).not.toContain("payment=success");
    expect(redirect.failed).toBe("https://example.com/year/y/subjects/s/modules/m");
  });
});

describe("createDynamicPaymongoLink", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("calls the PayMongo checkout sessions API with the exact caller-supplied amount and remarks", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_dyn123",
          attributes: { checkout_url: "https://checkout.paymongo.com/dyn" },
        },
      }),
    } as Response);

    const result = await createDynamicPaymongoLink(
      12345,
      "BSIT Survival Kit — Class block (25 seats)",
      "class:abc-123 seats:25",
      "https://example.com/success",
      "idem-key-1"
    );

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/checkout_sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic"),
          "Idempotency-Key": "idem-key-1",
        }),
      })
    );

    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.line_items[0].amount).toBe(12345);
    expect(sentBody.data.attributes.description).toBe(
      "BSIT Survival Kit — Class block (25 seats)"
    );
    expect(sentBody.data.attributes.metadata.remarks).toBe("class:abc-123 seats:25");
    expect(result.checkoutUrl).toBe("https://checkout.paymongo.com/dyn");
    expect(result.linkId).toBe("cs_dyn123");
  });

  it("throws when PAYMONGO_SECRET_KEY is not set", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(
      createDynamicPaymongoLink(
        12345,
        "desc",
        "remarks",
        "https://example.com/success",
        "idem-key-2"
      )
    ).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });

  it("throws with the PayMongo error detail on a non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ detail: "Invalid API key" }] }),
    } as Response);

    await expect(
      createDynamicPaymongoLink(
        12345,
        "desc",
        "remarks",
        "https://example.com/success",
        "idem-key-3"
      )
    ).rejects.toThrow("PayMongo error");
  });

  it("defaults the failed redirect leg to the success URL when failedUrl is omitted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "cs_dyn_r1", attributes: { checkout_url: "https://checkout.paymongo.com/d" } },
      }),
    } as Response);

    await createDynamicPaymongoLink(
      12345,
      "desc",
      "remarks",
      "https://example.com/for-blocks?payment=success",
      "idem-key-r1"
    );

    const attrs = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    ).data.attributes;
    expect(attrs.success_url).toBe("https://example.com/for-blocks?payment=success");
    expect(attrs.cancel_url).toBe("https://example.com/for-blocks?payment=success");
  });

  it("sends a separate failed redirect leg that never carries payment=success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "cs_dyn_r2", attributes: { checkout_url: "https://checkout.paymongo.com/d" } },
      }),
    } as Response);

    await createDynamicPaymongoLink(
      12345,
      "desc",
      "remarks",
      "https://example.com/for-blocks?payment=success",
      "idem-key-r2",
      "https://example.com/for-blocks"
    );

    const attrs = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    ).data.attributes;
    expect(attrs.success_url).toContain("payment=success");
    expect(attrs.cancel_url).not.toContain("payment=success");
    expect(attrs.cancel_url).toBe("https://example.com/for-blocks");
  });
});

describe("remarks user: field", () => {
  it("parses an optional user id from remarks", () => {
    const remarks =
      "year:11111111-1111-1111-1111-111111111111 device:22222222-2222-2222-2222-222222222222 user:33333333-3333-3333-3333-333333333333";
    expect(remarks.match(/user:([^\s]+)/)?.[1]).toBe(
      "33333333-3333-3333-3333-333333333333"
    );
  });

  it("does not match user: when userId is absent from remarks", () => {
    const remarks =
      "year:11111111-1111-1111-1111-111111111111 device:22222222-2222-2222-2222-222222222222";
    expect(remarks.match(/user:([^\s]+)/)?.[1]).toBeUndefined();
  });

  it("includes user:<id> in remarks when userId is passed to createPaymongoLink", async () => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_u1",
          attributes: { checkout_url: "https://checkout.paymongo.com/u1" },
        },
      }),
    } as Response);

    await createPaymongoLink(
      "year-1",
      "device-1",
      "https://example.com/success",
      null,
      "33333333-3333-3333-3333-333333333333"
    );

    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.metadata.remarks).toContain(
      "user:33333333-3333-3333-3333-333333333333"
    );

    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("omits user: from remarks when userId is not passed to createPaymongoLink", async () => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_u2",
          attributes: { checkout_url: "https://checkout.paymongo.com/u2" },
        },
      }),
    } as Response);

    await createPaymongoLink("year-1", "device-1", "https://example.com/success");

    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.metadata.remarks).not.toContain("user:");

    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });
});

describe("verifyPaymongoWebhook", () => {
  beforeEach(() => {
    process.env.PAYMONGO_WEBHOOK_SECRET = FAKE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
  });

  function signHeader(body: string, timestamp: number): string {
    const hmac = crypto
      .createHmac("sha256", FAKE_WEBHOOK_SECRET)
      .update(`${timestamp}.${body}`)
      .digest("hex");
    return `t=${timestamp},te=${hmac},li=${hmac}`;
  }

  it("returns true for a valid, fresh signature header", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const now = Math.floor(Date.now() / 1000);
    expect(verifyPaymongoWebhook(body, signHeader(body, now))).toBe(true);
  });

  it("returns false for a stale signature (replay protection)", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const stale = Math.floor(Date.now() / 1000) - 600; // 10 minutes old
    // Signature is otherwise valid; only the timestamp is out of tolerance.
    expect(verifyPaymongoWebhook(body, signHeader(body, stale))).toBe(false);
  });

  it("returns false for a tampered signature header", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const now = Math.floor(Date.now() / 1000);
    const header = `t=${now},te=badhmac,li=badhmac`;
    expect(verifyPaymongoWebhook(body, header)).toBe(false);
  });

  it("returns false if PAYMONGO_WEBHOOK_SECRET is missing", () => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
    const now = Math.floor(Date.now() / 1000);
    expect(verifyPaymongoWebhook("body", `t=${now},te=abc,li=abc`)).toBe(false);
  });

  it("returns false for a malformed header with no timestamp", () => {
    expect(verifyPaymongoWebhook("body", "te=abc")).toBe(false);
  });

  // PayMongo signs LIVE events in `li` and TEST events in `te` — a live
  // delivery does NOT carry a valid te. Verification must accept either field.
  it("accepts a live-mode header where only li carries the valid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const now = Math.floor(Date.now() / 1000);
    const hmac = crypto
      .createHmac("sha256", FAKE_WEBHOOK_SECRET)
      .update(`${now}.${body}`)
      .digest("hex");
    expect(verifyPaymongoWebhook(body, `t=${now},te=,li=${hmac}`)).toBe(true);
  });

  it("accepts a test-mode header where only te carries the valid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const now = Math.floor(Date.now() / 1000);
    const hmac = crypto
      .createHmac("sha256", FAKE_WEBHOOK_SECRET)
      .update(`${now}.${body}`)
      .digest("hex");
    expect(verifyPaymongoWebhook(body, `t=${now},te=${hmac},li=`)).toBe(true);
  });

  it("returns false when neither te nor li matches", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const now = Math.floor(Date.now() / 1000);
    expect(verifyPaymongoWebhook(body, `t=${now},te=deadbeef,li=deadbeef`)).toBe(false);
  });
});

describe("getLinkByReference", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  // PayMongo resolves a link by reference at GET /v1/links/{reference}. The
  // query-param form (?reference_number=) is NOT a real route and 404s.
  it("fetches the link by reference in the URL path", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "link_abc123",
          attributes: { remarks: "year:y device:d", amount: 4900, status: "paid" },
        },
      }),
    } as Response);

    const result = await getLinkByReference("kktO0LG");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/links/kktO0LG",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic"),
        }),
      })
    );
    expect(result).toEqual({
      linkId: "link_abc123",
      remarks: "year:y device:d",
      amount: 4900,
      status: "paid",
    });
  });

  it("returns null when PayMongo has no such link", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ code: "not_found" }] }),
    } as Response);

    expect(await getLinkByReference("nope")).toBeNull();
  });
});

describe("getCheckoutSessionById", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("fetches the session by id and extracts remarks, payment id, and the paid payment", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_abc123",
          attributes: {
            metadata: { remarks: "year:y device:d plan:year_sem" },
            payments: [
              { id: "pay_failed", attributes: { status: "failed", amount: 29900 } },
              { id: "pay_abc123", attributes: { status: "paid", amount: 29900, paid_at: 1788664145 } },
            ],
          },
        },
      }),
    } as Response);

    const result = await getCheckoutSessionById("cs_abc123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/checkout_sessions/cs_abc123",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining("Basic") }),
      })
    );
    expect(result).toEqual({
      paymentId: "pay_abc123",
      remarks: "year:y device:d plan:year_sem",
      paidAmount: 29900,
      paidStatus: "paid",
      paidAtSeconds: 1788664145,
    });
  });

  it("returns undefined paid fields when no payment in the array has status paid", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_pending",
          attributes: {
            metadata: { remarks: "year:y device:d" },
            payments: [{ id: "pay_failed", attributes: { status: "failed", amount: 4900 } }],
          },
        },
      }),
    } as Response);

    const result = await getCheckoutSessionById("cs_pending");
    expect(result).toEqual({
      paymentId: undefined,
      remarks: "year:y device:d",
      paidAmount: undefined,
      paidStatus: undefined,
      paidAtSeconds: undefined,
    });
  });

  it("returns null when PayMongo has no such session", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ code: "not_found" }] }),
    } as Response);

    expect(await getCheckoutSessionById("cs_nope")).toBeNull();
  });

  it("throws if PAYMONGO_SECRET_KEY is missing", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(getCheckoutSessionById("cs_abc123")).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });
});

describe("getPaymentById", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  it("fetches the payment by id and extracts remarks, amount, and status", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "pay_abc123",
          attributes: {
            metadata: { remarks: "year:y device:d plan:year_sem" },
            amount: 29900,
            status: "paid",
          },
        },
      }),
    } as Response);

    const result = await getPaymentById("pay_abc123");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/payments/pay_abc123",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining("Basic") }),
      })
    );
    expect(result).toEqual({
      remarks: "year:y device:d plan:year_sem",
      amount: 29900,
      status: "paid",
    });
  });

  it("returns empty remarks when the payment has no metadata", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { id: "pay_nometa", attributes: { amount: 4900, status: "paid" } },
      }),
    } as Response);

    const result = await getPaymentById("pay_nometa");
    expect(result).toEqual({ remarks: "", amount: 4900, status: "paid" });
  });

  it("returns null when PayMongo has no such payment", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ code: "not_found" }] }),
    } as Response);

    expect(await getPaymentById("pay_nope")).toBeNull();
  });

  it("throws if PAYMONGO_SECRET_KEY is missing", async () => {
    delete process.env.PAYMONGO_SECRET_KEY;
    await expect(getPaymentById("pay_abc123")).rejects.toThrow("PAYMONGO_SECRET_KEY");
  });
});

describe("listRecentPaidLinks", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  function paymentsListPage(rows: unknown[]) {
    return { ok: true, json: async () => ({ data: rows }) } as Response;
  }

  it("resolves a Checkout-Sessions-era payment from its inline metadata, with no extra fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([
        {
          id: "pay_cs1",
          attributes: {
            status: "paid",
            amount: 29900,
            description: "BSIT Survival Kit",
            paid_at: 1788664145,
            external_reference_number: null,
            metadata: { remarks: "year:y device:d plan:year_sem" },
          },
        },
      ])
    );

    const result = await listRecentPaidLinks();

    // Exactly one fetch call — the list page itself. No per-item resolution.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        linkId: "pay_cs1",
        amount: 29900,
        description: "BSIT Survival Kit",
        reference: "",
        paidAt: new Date(1788664145 * 1000),
        remarks: "year:y device:d plan:year_sem",
        yearId: "y",
        subjectId: null,
        deviceId: "d",
        userId: null,
        plan: "year_sem",
        coupon: null,
      },
    ]);
  });

  it("still resolves a legacy Links-era payment by reference, unchanged", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_legacy1",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "BSIT Survival Kit",
              paid_at: 1788664000,
              external_reference_number: "REF123",
            },
          },
        ])
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            id: "link_legacy1",
            attributes: { remarks: "year:y device:d", amount: 4900, status: "paid" },
          },
        }),
      } as Response);

    const result = await listRecentPaidLinks();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "https://api.paymongo.com/v1/links/REF123",
      expect.anything()
    );
    expect(result[0]).toMatchObject({ linkId: "link_legacy1", reference: "REF123" });
  });

  it("resolves a mixed batch of legacy and Checkout-Sessions payments in one call", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_legacy2",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "d",
              paid_at: 1,
              external_reference_number: "REF456",
            },
          },
          {
            id: "pay_cs2",
            attributes: {
              status: "paid",
              amount: 9900,
              description: "d",
              paid_at: 2,
              metadata: { remarks: "year:y2 device:d2 plan:subject_sem" },
            },
          },
        ])
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: "link_legacy2", attributes: { remarks: "year:y1 device:d1", amount: 4900, status: "paid" } },
        }),
      } as Response);

    const result = await listRecentPaidLinks();

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.linkId === "link_legacy2")).toBeTruthy();
    expect(result.find((r) => r.linkId === "pay_cs2")).toMatchObject({ yearId: "y2", deviceId: "d2" });
  });

  it("never leaves linkId empty when a payment has neither metadata nor a resolvable reference", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([
        {
          id: "pay_orphan",
          attributes: { status: "paid", amount: 100, description: "d", paid_at: 1 },
        },
      ])
    );

    const result = await listRecentPaidLinks();
    expect(result[0].linkId).toBe("pay_orphan");
    expect(result[0].remarks).toBe("");
  });

  it("falls back to the payment's own id when a legacy reference fails to resolve at PayMongo", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_deadref",
            attributes: {
              status: "paid",
              amount: 100,
              description: "d",
              paid_at: 1,
              external_reference_number: "GONE",
            },
          },
        ])
      )
      .mockResolvedValueOnce({ ok: false, json: async () => ({ errors: [] }) } as Response);

    const result = await listRecentPaidLinks();
    expect(result[0].linkId).toBe("pay_deadref");
  });

  it("ignores unpaid payments", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      paymentsListPage([{ id: "pay_failed", attributes: { status: "failed", amount: 100, description: "d" } }])
    );
    expect(await listRecentPaidLinks()).toEqual([]);
  });

  it("emits only one row when two payments share the same legacy reference", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        paymentsListPage([
          {
            id: "pay_retry1",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "d",
              paid_at: 1,
              external_reference_number: "SHARED",
            },
          },
          {
            id: "pay_retry2",
            attributes: {
              status: "paid",
              amount: 4900,
              description: "d",
              paid_at: 2,
              external_reference_number: "SHARED",
            },
          },
        ])
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: "link_shared", attributes: { remarks: "year:y device:d", amount: 4900, status: "paid" } },
        }),
      } as Response);

    const result = await listRecentPaidLinks();

    // Exactly one getLinkByReference call and one emitted row — no duplicate
    // linkId, which would otherwise collide as a React key on the admin table.
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0].linkId).toBe("link_shared");
  });
});

describe("parseLinkRemarks", () => {
  const yearId = "00000000-0000-0000-0000-000000000001";
  const subjectId = "10000000-0001-0001-0001-000000000001";
  const deviceId = "50de1efd-6d0f-4bbd-b8db-933df30fe58e";
  const userId = "18163322-f639-4a28-9eba-b82ae3188088";

  it("parses a full subject-plan remarks string (year+subject+device+user)", () => {
    const r = `year:${yearId} subject:${subjectId} device:${deviceId} user:${userId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId, plan: null, coupon: null });
  });

  it("parses a year-plan remarks string (no subject)", () => {
    const r = `year:${yearId} device:${deviceId} user:${userId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId: null, deviceId, userId, plan: null, coupon: null });
  });

  it("parses a remarks string without a user (anonymous device payment)", () => {
    const r = `year:${yearId} subject:${subjectId} device:${deviceId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId: null, plan: null, coupon: null });
  });

  it("returns all-null for empty or garbage remarks (caller must reject)", () => {
    expect(parseLinkRemarks("")).toEqual({ yearId: null, subjectId: null, deviceId: null, userId: null, plan: null, coupon: null });
    expect(parseLinkRemarks("totally unrelated text")).toEqual({
      yearId: null, subjectId: null, deviceId: null, userId: null, plan: null, coupon: null,
    });
  });

  it("extracts the plan token", () => {
    const r = parseLinkRemarks(`year:${yearId} subject:${subjectId} device:${deviceId} plan:subject_sem`);
    expect(r.plan).toBe("subject_sem");
  });

  it("returns null plan for legacy remarks", () => {
    const r = parseLinkRemarks(`year:${yearId} device:${deviceId}`);
    expect(r.plan).toBeNull();
  });

  it("extracts the coupon token from coupon-discounted remarks", () => {
    const r = parseLinkRemarks(
      `year:${yearId} device:${deviceId} plan:year_sem coupon:FEEDBACK-TESTTEST`
    );
    expect(r.coupon).toBe("FEEDBACK-TESTTEST");
    // The token must not bleed into neighbouring fields.
    expect(r.plan).toBe("year_sem");
  });

  it("returns null coupon for links created without one", () => {
    const r = parseLinkRemarks(`year:${yearId} device:${deviceId} plan:subject_month`);
    expect(r.coupon).toBeNull();
  });
});

describe("coupon constants", () => {
  it("caps the discount at each plan price", () => {
    expect(couponDiscountFor("subject_month")).toBe(PLANS.subject_month.amount);
    expect(couponDiscountFor("subject_sem")).toBe(PLANS.subject_sem.amount);
    // Face value is below the year plan, so it applies in full there.
    expect(couponDiscountFor("year_sem")).toBe(COUPON_DISCOUNT);
    expect(couponDiscountFor("year_sem")).toBeLessThan(PLANS.year_sem.amount);
  });

  it("never lets a discounted remainder go negative", () => {
    for (const plan of Object.keys(PLANS) as PlanKey[]) {
      expect(PLANS[plan].amount - couponDiscountFor(plan)).toBeGreaterThanOrEqual(0);
    }
  });

  it("keeps the gateway minimum and face value at their product-decided values", () => {
    expect(MIN_CHARGE).toBe(10000); // PayMongo minimum charge
    expect(COUPON_DISCOUNT).toBe(MIN_CHARGE); // face value equals it today by decision
  });

  it("keeps the seat cap at 55 for checkout and webhook", () => {
    expect(MAX_SEATS).toBe(55);
  });
});

describe("createPaymongoLink plans", () => {
  beforeEach(() => {
    process.env.PAYMONGO_SECRET_KEY = FAKE_SECRET;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAYMONGO_SECRET_KEY;
  });

  const mockOk = () =>
    ({
      ok: true,
      json: async () => ({
        data: {
          id: "cs_plan1",
          attributes: { checkout_url: "https://checkout.paymongo.com/p" },
        },
      }),
    }) as Response;

  function sentBody(i: number) {
    return JSON.parse(vi.mocked(fetch).mock.calls[i][1]!.body as string);
  }
  function sentIdempotencyKey(i: number) {
    return (vi.mocked(fetch).mock.calls[i][1]!.headers as Record<string, string>)[
      "Idempotency-Key"
    ];
  }

  it("charges 9900 and stamps plan:subject_sem in remarks for the semester subject plan", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_sem");
    expect(sentBody(0).data.attributes.line_items[0].amount).toBe(9900);
    expect(sentBody(0).data.attributes.metadata.remarks).toContain("plan:subject_sem");
    expect(sentBody(0).data.attributes.metadata.remarks).toContain("subject:subj-1");
  });

  it("defaults to legacy plans when plan is omitted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());

    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1");
    expect(sentBody(0).data.attributes.line_items[0].amount).toBe(4900);
    expect(sentBody(0).data.attributes.metadata.remarks).toContain("plan:subject_month");

    await createPaymongoLink("year-1", "device-1", "https://x/ok", null);
    expect(sentBody(1).data.attributes.line_items[0].amount).toBe(29900);
    expect(sentBody(1).data.attributes.metadata.remarks).toContain("plan:year_sem");
  });

  it("includes the plan in the idempotency key so different tiers are distinct purchases", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());

    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_month");
    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1", undefined, "subject_sem");
    expect(sentIdempotencyKey(0)).not.toBe(sentIdempotencyKey(1));
  });
});

describe("PLANS", () => {
  it("defines the three tiers with exact centavo amounts", () => {
    expect(PLANS.subject_month.amount).toBe(4900);
    expect(PLANS.subject_sem.amount).toBe(9900);
    expect(PLANS.year_sem.amount).toBe(29900);
  });
});

describe("resolvePlan", () => {
  const SUBJ = "10000000-0001-0001-0001-000000000001";

  it("returns the token's plan when scope matches", () => {
    expect(resolvePlan("subject_sem", SUBJ)).toBe("subject_sem");
    expect(resolvePlan("subject_month", SUBJ)).toBe("subject_month");
    expect(resolvePlan("year_sem", null)).toBe("year_sem");
  });

  it("falls back to legacy inference when token is missing", () => {
    expect(resolvePlan(null, SUBJ)).toBe("subject_month");
    expect(resolvePlan(null, null)).toBe("year_sem");
  });

  it("falls back to legacy inference when token contradicts scope or is unknown", () => {
    expect(resolvePlan("year_sem", SUBJ)).toBe("subject_month");
    expect(resolvePlan("subject_sem", null)).toBe("year_sem");
    expect(resolvePlan("premium_gold", SUBJ)).toBe("subject_month");
  });
});

describe("periodEndFor", () => {
  const DAY_MS = 24 * 60 * 60 * 1000;

  it("gives subject_month exactly 31 days from `from`", () => {
    const from = new Date("2026-07-10T00:00:00Z");
    expect(periodEndFor("subject_month", from).getTime()).toBe(from.getTime() + 31 * DAY_MS);
  });

  it("gives semester plans access until SEMESTER_END", () => {
    const from = new Date("2026-07-10T00:00:00Z");
    expect(periodEndFor("subject_sem", from).getTime()).toBe(SEMESTER_END.getTime());
    expect(periodEndFor("year_sem", from).getTime()).toBe(SEMESTER_END.getTime());
  });

  it("floors semester plans at 31 days when SEMESTER_END is stale", () => {
    const from = new Date("2026-12-25T00:00:00Z"); // < 31 days before SEMESTER_END
    expect(periodEndFor("subject_sem", from).getTime()).toBe(from.getTime() + 31 * DAY_MS);
  });
});
