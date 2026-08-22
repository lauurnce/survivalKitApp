// lib/email/templates/index.test.ts
import { describe, it, expect } from "vitest";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail } from "./index";

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

  it("escapes HTML metacharacters in interpolated values", () => {
    const e = welcomeEmail({ planLabel: `Evil<script>alert(1)</script>`, returnUrl: "https://x.test/b" });
    expect(e.html).not.toContain("<script>");
  });
});
