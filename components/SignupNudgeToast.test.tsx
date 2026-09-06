// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import { SignupNudgeToast } from "./SignupNudgeToast";

const SIGNUP_HREF = "/signup?next=%2Fyear%2F1%2Fsubjects%2Fcp1%2Fmodules%2Fm1";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("SignupNudgeToast", () => {
  it("shows the nudge on first mount this session for a signed-out reader", async () => {
    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);

    expect(
      await screen.findByText(/save your progress across devices/i)
    ).toBeInTheDocument();
  });

  it("links the sign-up CTA to the provided next= href", async () => {
    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);

    const cta = await screen.findByRole("link", { name: /sign up/i });
    expect(cta).toHaveAttribute("href", SIGNUP_HREF);
  });

  it("does not appear a second time in the same session after remounting without a dismiss", async () => {
    const first = render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    await screen.findByText(/save your progress across devices/i);
    first.unmount();

    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    expect(
      screen.queryByText(/save your progress across devices/i)
    ).not.toBeInTheDocument();
  });

  it("clicking Continue reading closes the toast and remembers the dismissal permanently", async () => {
    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    await screen.findByText(/save your progress across devices/i);

    fireEvent.click(screen.getByRole("button", { name: /continue reading/i }));

    expect(
      screen.queryByText(/save your progress across devices/i)
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("bsit_signup_nudge_dismissed")).toBe("1");
  });

  it("never shows again once permanently dismissed, even in a brand new session", async () => {
    localStorage.setItem("bsit_signup_nudge_dismissed", "1");

    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);

    expect(
      screen.queryByText(/save your progress across devices/i)
    ).not.toBeInTheDocument();
  });

  it("reappears in a new session when the reader only navigated away without dismissing", async () => {
    sessionStorage.setItem("bsit_signup_nudge_shown", "1"); // shown earlier this session
    const first = render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    expect(
      screen.queryByText(/save your progress across devices/i)
    ).not.toBeInTheDocument();
    first.unmount();

    // A new session clears sessionStorage; localStorage was never touched.
    sessionStorage.clear();
    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    expect(
      await screen.findByText(/save your progress across devices/i)
    ).toBeInTheDocument();
  });

  // Regression: this toast has no auto-dismiss timer and previously used the
  // exact same fixed bottom-6/inset-x-0/z-40 wrapper as ModuleDoneToggle's own
  // "Nice! One more down" prompt (components/ModuleDoneToggle.tsx), which a
  // signed-out reader can trigger just by marking a module done (that action
  // only needs the device cookie, not sign-in). The two could stack and
  // overlap on screen for up to 10 seconds. Anchoring to the top instead
  // guarantees no shared position with any bottom-anchored toast in the app.
  it("anchors to the top of the viewport, never the bottom-center spot ModuleDoneToggle's prompt uses", async () => {
    render(<SignupNudgeToast signupHref={SIGNUP_HREF} />);
    const status = await screen.findByRole("status");
    const wrapper = status.parentElement;
    expect(wrapper?.className).toContain("top-6");
    expect(wrapper?.className).not.toContain("bottom-6");
  });
});
