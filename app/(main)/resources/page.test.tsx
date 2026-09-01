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

vi.mock("@/components/resources/SubjectQuizList", () => ({
  SubjectQuizList: () => <div data-testid="subject-quiz-list" />,
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
  it("marks the playground and search cards, and the quiz section, for the tour to anchor to", async () => {
    const { container } = await renderPage();

    expect(screen.getByRole("link", { name: /code playground/i })).toHaveAttribute(
      "data-tour",
      "resources-playground"
    );
    expect(screen.getByRole("link", { name: /search the kit/i })).toHaveAttribute(
      "data-tour",
      "resources-search"
    );
    expect(container.querySelector('[data-tour="resources-quiz"]')).not.toBeNull();
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

  it("keeps the resources-quiz anchor on the section even for the anon sign-in prompt", async () => {
    currentUserId = null;
    const { container } = await renderPage();

    const quizSection = container.querySelector('[data-tour="resources-quiz"]');
    expect(quizSection).not.toBeNull();
    expect(screen.getByText(/sign in to quiz yourself/i)).toBeInTheDocument();
  });
});
