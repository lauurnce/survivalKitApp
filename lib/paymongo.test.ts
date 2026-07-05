import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPaymongoLink,
  verifyPaymongoWebhook,
  parseLinkRemarks,
  getLinkByReference,
  YEAR_AMOUNT,
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
    expect(sentBody.data.attributes.amount).toBe(YEAR_AMOUNT);
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
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId });
  });

  it("parses a year-plan remarks string (no subject)", () => {
    const r = `year:${yearId} device:${deviceId} user:${userId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId: null, deviceId, userId });
  });

  it("parses a remarks string without a user (anonymous device payment)", () => {
    const r = `year:${yearId} subject:${subjectId} device:${deviceId}`;
    expect(parseLinkRemarks(r)).toEqual({ yearId, subjectId, deviceId, userId: null });
  });

  it("returns all-null for empty or garbage remarks (caller must reject)", () => {
    expect(parseLinkRemarks("")).toEqual({ yearId: null, subjectId: null, deviceId: null, userId: null });
    expect(parseLinkRemarks("totally unrelated text")).toEqual({
      yearId: null, subjectId: null, deviceId: null, userId: null,
    });
  });
});
