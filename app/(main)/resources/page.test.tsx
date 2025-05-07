// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/resources",
}));

vi.mock("@/app/(auth)/actions", () => ({ signOutAction: vi.fn() }));

vi.mock("@/lib/account", () => ({
  completionPercentage: (done: number, total: number) => (total > 0 ? done / total : 0),
}));

import ResourcesPage from "./page";
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


let signedIn = true;
// jsdom has neither; the mobile rail uses both.
let desktop = false;
const scrollIntoView = vi.fn();

beforeEach(() => {
  signedIn = true;
  desktop = false;
  scrollIntoView.mockClear();
  localStorage.clear();
  window.matchMedia = ((query: string) => ({ matches: desktop, media: query })) as unknown as typeof window.matchMedia;
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderPage() {
  stubSession(signedIn, { overallDone: 2, overallTotal: 10 });
  const ui = ResourcesPage();
  return render(ui);
}

async function settle() {
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
}

describe("ResourcesPage — tour anchors", () => {
  it("marks the playground and search cards for the tour to anchor to", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: /code playground/i })).toHaveAttribute(
      "data-tour",
      "resources-playground"
    );
    expect(screen.getByRole("link", { name: /search the kit/i })).toHaveAttribute(
      "data-tour",
      "resources-search"
    );
  });

  it("mounts the tour for a signed-in visitor", async () => {
    await renderPage();

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Code playground" })).toBeInTheDocument();
  });

  it("does not mount the tour for an anonymous visitor", async () => {
    signedIn = false;
    await renderPage();
    await settle();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("no longer lists subject quizzes, signed in or anonymous", async () => {
    const member = await renderPage();
    expect(member.container.querySelector('[data-tour="resources-quiz"]')).toBeNull();
    expect(screen.queryByText(/quiz yourself/i)).not.toBeInTheDocument();
    member.unmount();

    signedIn = false;
    const anon = await renderPage();
    expect(anon.container.querySelector('[data-tour="resources-quiz"]')).toBeNull();
    expect(screen.queryByText(/sign in to quiz yourself/i)).not.toBeInTheDocument();
  });
});

describe("ResourcesPage — mobile rail (QA DS-09)", () => {
  it("scrolls the active Resources tab into view on a phone", async () => {
    await renderPage();
    await settle();
    expect(scrollIntoView).toHaveBeenCalledWith({ inline: "center", block: "nearest" });
    const active = screen.getByRole("link", { name: "Resources", current: "page" });
    expect(scrollIntoView.mock.contexts[0]).toBe(active);
  });

  it("leaves the desktop sidebar alone", async () => {
    desktop = true;
    await renderPage();
    await settle();
    // The signed-in tour scrolls its own targets; only the rail's call matters.
    expect(scrollIntoView).not.toHaveBeenCalledWith({ inline: "center", block: "nearest" });
  });

  it("keeps the rail's scroll area clear of the fixed top bar", async () => {
    await renderPage();
    expect(screen.getByTestId("resources-rail").className).toMatch(/\bpr-40\b.*\blg:contents\b/);
  });

  it("renders no empty log-out band for an anonymous visitor", async () => {
    signedIn = false;
    const { container } = await renderPage();
    await settle();
    expect(screen.queryByRole("button", { name: /log out/i })).toBeNull();
    expect(container.querySelector(".py-3.border-b")).toBeNull();
  });

  it("keeps the log-out band for a signed-in visitor", async () => {
    await renderPage();
    expect(await screen.findByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});
