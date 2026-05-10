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

beforeEach(() => {
  signedIn = true;
  localStorage.clear();
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
