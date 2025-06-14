// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const YEAR_ID = "11111111-1111-1111-1111-111111111111";
const SUBJECT_ID = "22222222-2222-2222-2222-222222222222";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  usePathname: () => "/year/x/subjects/y/modules",
  useSearchParams: () => new URLSearchParams(),
}));

// The client-side subscriber treatment is not under test here.
vi.mock("@/components/SubscriberState", () => ({
  SubscriberModuleList: () => null,
  SubscriberProBanner: () => null,
}));
vi.mock("@/components/PaywallTeaser", () => ({ PaywallTeaser: () => <div data-testid="paywall-teaser" /> }));
vi.mock("@/components/share/ShareProgressButton", () => ({ ShareProgressButton: () => null }));
vi.mock("@/components/PageTracker", () => ({ PageTracker: () => null }));
vi.mock("@/components/SubjectComingSoon", () => ({ SubjectComingSoon: () => null }));

let subjectYears: unknown;
let modules: { id: string; title: string }[] = [];
let activities: { id: string; module_id: string }[] = [];
vi.mock("@/lib/cache/queries", () => ({
  getSubjectWithYear: () =>
    Promise.resolve({ id: SUBJECT_ID, title: "Computer Programming 1", year_id: YEAR_ID, years: subjectYears }),
  getModulesBySubject: () => Promise.resolve(modules),
  getModuleCounters: () => Promise.resolve([]),
  getActivitySectionsForModules: () => Promise.resolve(activities),
}));

import ModulesPage from "./page";

async function renderPage() {
  const ui = await ModulesPage({
    params: Promise.resolve({ yearId: YEAR_ID, subjectId: SUBJECT_ID }),
  });
  return render(ui);
}

beforeEach(() => {
  subjectYears = undefined;
  modules = [];
  activities = [];
});

describe("ModulesPage — year context in the header", () => {

  // PostgREST returns the many-to-one years(...) embed as an object, not an
  // array; reading it as `[0]` dropped the year from every modules page.
  it("reads the year from the object-shaped years embed", async () => {
    subjectYears = { label: "1st Year", sort_order: 1 };
    await renderPage();

    expect(screen.getByRole("link", { name: "1st Year" })).toHaveAttribute(
      "href",
      `/year/${YEAR_ID}/subjects`,
    );
    expect(screen.getByText("§ 01 — Computer Programming 1")).toBeInTheDocument();
  });

  it("still reads an array-shaped years embed", async () => {
    subjectYears = [{ label: "2nd Year", sort_order: 2 }];
    await renderPage();

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("2nd Year");
    expect(screen.getByText("§ 02 — Computer Programming 1")).toBeInTheDocument();
  });

  it("falls back to placeholders when the year is missing", async () => {
    subjectYears = null;
    await renderPage();

    expect(screen.getByText("§ — — Computer Programming 1")).toBeInTheDocument();
  });
});

describe("ModulesPage — paywall teaser", () => {
  // Operating Systems: one module whose 3 reviewers are all the free sample.
  // The page sold "every reviewer … from ₱49" for nothing (QA CT-07).
  it("hides the teaser when the free sample is every reviewer in the subject", async () => {
    modules = [{ id: "m1", title: "Module 1: Introduction to Operating Systems" }];
    activities = [
      { id: "a1", module_id: "m1" },
      { id: "a2", module_id: "m1" },
      { id: "a3", module_id: "m1" },
    ];
    await renderPage();
    expect(screen.queryByTestId("paywall-teaser")).toBeNull();
  });

  it("shows the teaser while reviewers remain past the free sample", async () => {
    modules = [
      { id: "m1", title: "Lesson 1" },
      { id: "m2", title: "Lesson 2" },
    ];
    activities = [
      { id: "a1", module_id: "m1" },
      { id: "a2", module_id: "m2" },
    ];
    await renderPage();
    expect(screen.getByTestId("paywall-teaser")).toBeInTheDocument();
  });
});
