// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { TopBar } from "./TopBar";
import { resetSessionCache } from "@/hooks/useSession";

// Session now resolves client-side via /api/me (hooks/useSession).
function stubSession(signedIn: boolean, overview = { overallDone: 0, overallTotal: 0 }) {
  resetSessionCache();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify(signedIn ? { signedIn: true, firstName: null, overview } : { signedIn: false, firstName: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TopBar", () => {
  it("marks the log-in link for the landing tour's closing step", async () => {
    stubSession(false);
    render(<TopBar />);
    expect(await screen.findByRole("link", { name: /log in/i })).toHaveAttribute(
      "data-tour",
      "landing-login"
    );
  });

  it("switches to the account link once /api/me reports a session", async () => {
    stubSession(true);
    render(<TopBar />);
    expect(await screen.findByRole("link", { name: /my account/i })).toHaveAttribute(
      "data-tour",
      "landing-login"
    );
  });

  it("renders the signed-out link before the session resolves (static HTML)", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    resetSessionCache();
    render(<TopBar />);
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  // QA FL-12: viewport-fit=cover lets the page run under the notch, so the
  // fixed bar has to add the safe-area insets to its offsets.
  it("offsets the fixed bar by the safe-area insets", () => {
    stubSession(false);
    const { container } = render(<TopBar />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.className).toContain("top-[calc(1rem+env(safe-area-inset-top))]");
    expect(bar.className).toContain("right-[calc(1rem+env(safe-area-inset-right))]");
  });
});
