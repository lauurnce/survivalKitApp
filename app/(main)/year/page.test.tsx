// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/year",
}));

let currentUserId: string | null = null;

vi.mock("@/lib/auth/currentUser", () => ({
  getCurrentUserId: () => Promise.resolve(currentUserId),
}));

vi.mock("@/lib/account", () => ({
  getAccountOverview: () => Promise.resolve({ overallDone: 0, overallTotal: 0 }),
  completionPercentage: () => 0,
}));

const YEAR_ID = "11111111-1111-1111-1111-111111111111";

vi.mock("@/lib/cache/queries", () => ({
  getYears: () => Promise.resolve([{ id: YEAR_ID, label: "1st Year", coming_soon: false }]),
  getAllSubjects: () =>
    Promise.resolve([
      { id: "s1", year_id: YEAR_ID, semester: 1, kind: "major" },
      { id: "s2", year_id: YEAR_ID, semester: 2, kind: "minor" },
    ]),
  getYearCounters: () => Promise.resolve([{ resource_id: YEAR_ID, reader_count: 5 }]),
}));

import YearPage from "./page";

async function renderPage(search: Record<string, string> = {}) {
  const ui = await YearPage({ searchParams: Promise.resolve(search) });
  return render(ui);
}

beforeEach(() => {
  currentUserId = null;
  localStorage.clear();
});

describe("YearPage — tour anchors", () => {
  it("marks the years grid, per-year stats, and search link for the tour to anchor to", async () => {
    currentUserId = "user-1";
    const { container } = await renderPage();

    expect(container.querySelector('[data-tour="subjects-years"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="subjects-stats"]')).not.toBeNull();
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute(
      "data-tour",
      "subjects-search"
    );
  });
});

describe("YearPage — subjects tour gating", () => {
  it("mounts the tour when signed in (dashboard shell shown)", async () => {
    currentUserId = "user-1";
    await renderPage();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("mounts the tour for a signed-out visitor arriving via the dashboard referrer", async () => {
    currentUserId = null;
    await renderPage({ from: "dashboard" });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not mount the tour for an anon visitor browsing from the public landing page", async () => {
    currentUserId = null;
    await renderPage();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not run again once bsit:tour:subjects is already set", async () => {
    currentUserId = "user-1";
    localStorage.setItem("bsit:tour:subjects", "1");
    await renderPage();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
