// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  // QA CT-06: the policy named three processors while the site also loads
  // Google Analytics, takes payment through PayMongo and emails through Resend.
  it("names every service provider the site actually uses", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    for (const name of ["Supabase", "Vercel", "Google Analytics", "PayMongo", "Resend", "Judge0"]) {
      expect(text).toContain(name);
    }
    expect(text).toContain("G-WN5Q254FCG");
  });

  it("lists the cookies and storage keys the code sets", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    for (const key of [
      "bsit_device_id",
      "sb-…-auth-token",
      "_ga",
      "theme",
      "bsit_last_module",
      "bsit_recent_lessons",
      "bsit-pages-",
      "bsit_install_prompt_dismissed",
      "bsit:tour:",
      "bsit:landing-seen",
      "bsit_signup_nudge_dismissed",
      "bsit_signup_nudge_shown",
      "bsit:session-entered",
      "rated-modules",
    ]) {
      expect(text).toContain(key);
    }
  });

  it("says data is never sold, and does not head a section 'share' while the footer said 'never shared'", () => {
    const { container } = render(<PrivacyPage />);
    expect(screen.getByRole("heading", { name: /service providers we use/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /share data with/i })).toBeNull();
    expect(container.textContent).toMatch(/we never sell your data/i);
  });

  it("is dated 31 October 2026 and no longer calls payments GCash-only", () => {
    const { container } = render(<PrivacyPage />);
    expect(screen.getByText(/last updated: 31 october 2026/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/GCash payment data/);
    expect(container.textContent).toMatch(/GCash, Maya, or card/);
  });
});
