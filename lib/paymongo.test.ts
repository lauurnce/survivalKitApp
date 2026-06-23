import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPaymongoLink, verifyPaymongoWebhook } from "./paymongo";
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
        }),
      })
    );
    expect(result.checkoutUrl).toBe("https://checkout.paymongo.com/abc");
    expect(result.linkId).toBe("link_abc123");
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

describe("verifyPaymongoWebhook", () => {
  beforeEach(() => {
    process.env.PAYMONGO_WEBHOOK_SECRET = FAKE_WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
  });

  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    const sig = crypto
      .createHmac("sha256", FAKE_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    expect(verifyPaymongoWebhook(body, sig)).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    const body = JSON.stringify({ data: { type: "link.payment.paid" } });
    expect(verifyPaymongoWebhook(body, "badsignature")).toBe(false);
  });

  it("returns false if PAYMONGO_WEBHOOK_SECRET is missing", () => {
    delete process.env.PAYMONGO_WEBHOOK_SECRET;
    expect(verifyPaymongoWebhook("body", "sig")).toBe(false);
  });
});
