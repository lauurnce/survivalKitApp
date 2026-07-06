import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPaymongoLink,
  verifyPaymongoWebhook,
  parseLinkRemarks,
  getLinkByReference,
  PLANS,
  SEMESTER_END,
  resolvePlan,
  periodEndFor,
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

  it("calls PayMongo links API with correct amount and returns checkout URL", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          id: "link_abc123",
          attributes: { checkout_url: "https://checkout.paymongo.com/abc" },
        },
      }),
    } as Response);

    const result = await createPaymongoLink("year-1", "device-1", "https://example.com/success");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.paymongo.com/v1/links",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic"),
          // Idempotency key prevents duplicate charges on retry/double-click.
          "Idempotency-Key": expect.any(String),
        }),
      })
    );
    // The link is created for the pinned subscription price.
    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.amount).toBe(PLANS.year_sem.amount);
    expect(result.checkoutUrl).toBe("https://checkout.paymongo.com/abc");
    expect(result.linkId).toBe("link_abc123");
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
          id: "link_u1",
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
    expect(sentBody.data.attributes.remarks).toContain(
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
          id: "link_u2",
          attributes: { checkout_url: "https://checkout.paymongo.com/u2" },
        },
      }),
    } as Response);

    await createPaymongoLink("year-1", "device-1", "https://example.com/success");

    const sentBody = JSON.parse(
      vi.mocked(fetch).mock.calls[0][1]!.body as string
    );
    expect(sentBody.data.attributes.remarks).not.toContain("user:");

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

describe("parseLinkRemarks", () => {
  const yearId = "00000000-0000-0000-0000-000000000001";
  const subjectId = "10000000-0001-0001-0001-000000000001";
  const deviceId = "50de1efd-6d0f-4bbd-b8db-933df30fe58e";
  const userId = "18163322-f639-4a28-9eba-b82ae3188088";

  it("parses a full subject-plan remarks string (year+subject+device+user)", () => {
    const r = `year:${yearId} subject:${subjectId} device:${deviceId} user:${userId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId, plan: null });
  });

  it("parses a year-plan remarks string (no subject)", () => {
    const r = `year:${yearId} device:${deviceId} user:${userId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId: null, deviceId, userId, plan: null });
  });

  it("parses a remarks string without a user (anonymous device payment)", () => {
    const r = `year:${yearId} subject:${subjectId} device:${deviceId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId: null, plan: null });
  });

  it("returns all-null for empty or garbage remarks (caller must reject)", () => {
    expect(parseLinkRemarks("")).toEqual({ yearId: null, subjectId: null, deviceId: null, userId: null, plan: null });
    expect(parseLinkRemarks("totally unrelated text")).toEqual({
      yearId: null, subjectId: null, deviceId: null, userId: null, plan: null,
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
          id: "link_plan1",
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
    expect(sentBody(0).data.attributes.amount).toBe(9900);
    expect(sentBody(0).data.attributes.remarks).toContain("plan:subject_sem");
    expect(sentBody(0).data.attributes.remarks).toContain("subject:subj-1");
  });

  it("defaults to legacy plans when plan is omitted", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());
    vi.mocked(fetch).mockResolvedValueOnce(mockOk());

    await createPaymongoLink("year-1", "device-1", "https://x/ok", "subj-1");
    expect(sentBody(0).data.attributes.amount).toBe(4900);
    expect(sentBody(0).data.attributes.remarks).toContain("plan:subject_month");

    await createPaymongoLink("year-1", "device-1", "https://x/ok", null);
    expect(sentBody(1).data.attributes.amount).toBe(29900);
    expect(sentBody(1).data.attributes.remarks).toContain("plan:year_sem");
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
