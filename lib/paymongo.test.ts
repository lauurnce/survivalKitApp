import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPaymongoLink,
  verifyPaymongoWebhook,
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
});
