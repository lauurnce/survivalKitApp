// lib/email/templates/index.test.ts
import { describe, it, expect } from "vitest";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail, reactivationEmail } from "./index";

const ENDS = new Date("2026-12-31T15:59:59Z");

describe("templates", () => {
  it("receipt states the amount in pesos and the access end date", () => {
    const e = receiptEmail({ planLabel: "Subject (semester)", amountCentavos: 9900, accessEndsAt: ENDS, returnUrl: "https://x.test/m" });
    expect(e.subject).toContain("₱99");
    expect(e.text).toContain("Subject (semester)");
    expect(e.text).toContain("https://x.test/m");
    expect(e.text).toMatch(/Dec(ember)? 31, 2026/);
  });

  it("every template returns non-empty html and text", () => {
    const all = [
      receiptEmail({ planLabel: "P", amountCentavos: 4900, accessEndsAt: ENDS, returnUrl: "https://x.test/a" }),
      welcomeEmail({ planLabel: "P", returnUrl: "https://x.test/b" }),
      expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c" }),
      winbackEmail({ planLabel: "P", renewUrl: "https://x.test/d" }),
      reactivationEmail({ ctaUrl: "https://x.test/e", unsubscribeUrl: "https://x.test/u" }),
    ];
    for (const e of all) {
      expect(e.subject.length).toBeGreaterThan(0);
      expect(e.html).toContain("<");
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.text).not.toContain("<p>");
    }
  });

  it("expiry warning names the deadline; winback speaks in the past tense", () => {
    expect(expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c" }).text)
      .toMatch(/Dec(ember)? 31, 2026/);
    expect(winbackEmail({ planLabel: "P", renewUrl: "https://x.test/d" }).text.toLowerCase())
      .toContain("expired");
  });

  it("tells the reader what a renewal buys when the term schedule knows", () => {
    const renewalEndsAt = new Date("2027-06-30T15:59:59Z");
    const warn = expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c", renewalEndsAt });
    const back = winbackEmail({ planLabel: "P", renewUrl: "https://x.test/d", renewalEndsAt });
    for (const e of [warn, back]) {
      expect(e.text).toContain("A semester pass bought now runs until June 30, 2027.");
      expect(e.html).toContain("June 30, 2027");
    }
  });

  it("omits the renewal line rather than guess when no end is known", () => {
    expect(expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c" }).text)
      .not.toContain("semester pass bought now");
  });

  it("escapes HTML metacharacters in interpolated values", () => {
    const e = welcomeEmail({ planLabel: `Evil<script>alert(1)</script>`, returnUrl: "https://x.test/b" });
    expect(e.html).not.toContain("<script>");
  });
});

describe("reactivationEmail", () => {
  const e = reactivationEmail({
    ctaUrl: "https://tryi2i.com/?utm_source=reactivation&utm_medium=email&utm_campaign=finals-dec-2026",
    unsubscribeUrl: "https://tryi2i.com/api/email/unsubscribe?u=x&t=y",
  });

  it("names finals, the free lessons, and the CP1 lesson range", () => {
    expect(e.subject).toMatch(/finals/i);
    for (const body of [e.text, e.html]) {
      expect(body).toMatch(/free/);
      expect(body).toContain("Computer Programming 1");
      expect(body).toContain("Lessons 1–7");
    }
  });

  it("has exactly one CTA link plus the unsubscribe link", () => {
    const hrefs = [...e.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(hrefs).toEqual([
      "https://tryi2i.com/?utm_source=reactivation&utm_medium=email&utm_campaign=finals-dec-2026",
      "https://tryi2i.com/api/email/unsubscribe?u=x&t=y",
    ]);
  });

  it("carries the opt-out line in both parts", () => {
    expect(e.text).toContain("Unsubscribe: https://tryi2i.com/api/email/unsubscribe?u=x&t=y");
    expect(e.html).toMatch(/Unsubscribe<\/a>/);
  });

  it("promises nothing paid and has no images or tracking pixels", () => {
    expect(e.html).not.toContain("<img");
    expect(e.text).not.toMatch(/answer key|discount|sale|₱/i);
  });
});
