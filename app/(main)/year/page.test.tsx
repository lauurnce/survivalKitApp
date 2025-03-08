// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

let search = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => "/year",
  useSearchParams: () => search,
}));

vi.mock("@/app/(auth)/actions", () => ({ signOutAction: vi.fn() }));

vi.mock("@/lib/account", () => ({
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

import YearPage, { metadata as yearMetadata } from "./page";
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


let signedIn = false;

// Let the /api/me round-trip settle before asserting something stayed absent.
async function waitForSession() {
  await waitFor(() => expect(fetch).toHaveBeenCalled());
  await new Promise((r) => setTimeout(r, 0));
}

async function renderPage(query: Record<string, string> = {}) {
  search = new URLSearchParams(query);
  stubSession(signedIn);
  const ui = await YearPage();
  return render(ui);
}

beforeEach(() => {
  signedIn = false;
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("YearPage — tour anchors", () => {
  it("marks the years grid, per-year stats, and search link for the tour to anchor to", async () => {
    signedIn = true;
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
    signedIn = true;
    await renderPage();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("mounts the tour for a signed-out visitor arriving via the dashboard referrer", async () => {
    signedIn = false;
    await renderPage({ from: "dashboard" });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("does not mount the tour for an anon visitor browsing from the public landing page", async () => {
    signedIn = false;
    await renderPage();
    await waitForSession();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not run again once bsit:tour:subjects is already set", async () => {
    signedIn = true;
    localStorage.setItem("bsit:tour:subjects", "1");
    await renderPage();
    await waitForSession();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("YearPage — static shell", () => {
  it("shows no nav rail to an anonymous visitor from the landing page", async () => {
    await renderPage();
    await waitForSession();
    expect(screen.queryByRole("navigation", { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("adds log out once the session resolves as signed in", async () => {
    signedIn = true;
    await renderPage();
    expect(await screen.findByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  // QA DS-10: the log-out bar's bordered wrapper rendered for everyone, so
  // signed-out visitors saw an empty 24px strip above the header band.
  it("renders nothing above <main> for a signed-out visitor", async () => {
    const { container } = await renderPage();
    await waitForSession();
    expect(container.querySelector("main")?.previousElementSibling).toBeNull();
  });

  // QA DS-20: the grid was capped at max-w-2xl inside the max-w-wide column,
  // so its right edge stopped short of the header's.
  it("lets the year grid fill the header's column", async () => {
    await renderPage();
    const grid = screen.getByRole("link", { name: /1st Year/ }).parentElement!;
    expect(grid.className).not.toMatch(/max-w-/);
  });
});

describe("YearPage — metadata", () => {
  it("has its own og:url and share title", () => {
    expect(yearMetadata.openGraph).toMatchObject({ url: "/year", title: "BSIT Subjects by Year — BSIT Survival Kit" });
  });
});
