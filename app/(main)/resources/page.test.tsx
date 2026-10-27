// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/resources",
}));

let currentUserId: string | null = "11111111-1111-1111-1111-111111111111";
vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

vi.mock("@/lib/account", () => ({
  completionPercentage: (done: number, total: number) => (total > 0 ? done / total : 0),
  getAccountOverview: () => Promise.resolve({ overallDone: 2, overallTotal: 10 }),
}));

import ResourcesPage from "./page";

beforeEach(() => {
  currentUserId = "11111111-1111-1111-1111-111111111111";
  localStorage.clear();
});

async function renderPage() {
  const ui = await ResourcesPage();
  return render(ui);
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
    currentUserId = "11111111-1111-1111-1111-111111111111";
    await renderPage();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Code playground" })).toBeInTheDocument();
  });

  it("does not mount the tour for an anonymous visitor", async () => {
    currentUserId = null;
    await renderPage();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("no longer lists subject quizzes, signed in or anonymous", async () => {
    const signedIn = await renderPage();
    expect(signedIn.container.querySelector('[data-tour="resources-quiz"]')).toBeNull();
    expect(screen.queryByText(/quiz yourself/i)).not.toBeInTheDocument();
    signedIn.unmount();

    currentUserId = null;
    const anon = await renderPage();
    expect(anon.container.querySelector('[data-tour="resources-quiz"]')).toBeNull();
    expect(screen.queryByText(/sign in to quiz yourself/i)).not.toBeInTheDocument();
  });
});
