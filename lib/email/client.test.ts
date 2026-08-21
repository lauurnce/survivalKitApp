import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class { emails = { send: sendMock }; },
}));

beforeEach(() => { sendMock.mockReset(); process.env.RESEND_API_KEY = "re_test"; });

describe("sendEmail", () => {
  it("sends from the branded address and reports the id", async () => {
    sendMock.mockResolvedValue({ data: { id: "abc" }, error: null });
    const { sendEmail, FROM } = await import("./client");
    const r = await sendEmail("s@example.com", { subject: "S", html: "<p>H</p>", text: "H" });
    expect(FROM).toBe("BSIT Survival Kit <noreply@mail.lawrenceigen.me>");
    expect(r).toEqual({ ok: true, id: "abc" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: FROM, to: "s@example.com", subject: "S", html: "<p>H</p>", text: "H" })
    );
  });

  it("returns ok:false instead of throwing when Resend errors", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "rate limited" } });
    const { sendEmail } = await import("./client");
    expect(await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" }))
      .toEqual({ ok: false, error: "rate limited" });
  });

  it("returns ok:false instead of throwing when the SDK throws", async () => {
    sendMock.mockRejectedValue(new Error("network down"));
    const { sendEmail } = await import("./client");
    expect(await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" }))
      .toEqual({ ok: false, error: "network down" });
  });

  it("returns ok:false when the API key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    vi.resetModules();
    const { sendEmail } = await import("./client");
    const r = await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" });
    expect(r.ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
