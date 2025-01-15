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
let modules: { id: string; title: string; sort_order?: number }[] = [];
let activities: { id: string; module_id: string }[] = [];
const OTHER_YEAR_ID = "44444444-4444-4444-4444-444444444444";
const MISSING_SUBJECT_ID = "55555555-5555-5555-5555-555555555555";
const subjectMock = vi.fn((subjectId: string) =>
  Promise.resolve(
    subjectId === SUBJECT_ID
      ? { id: SUBJECT_ID, title: "Computer Programming 1", year_id: YEAR_ID, years: subjectYears }
      : null,
  ),
);
let contentCounts: Record<string, number> | null = null;
let yearSubjects: { id: string; title: string; sort_order: number; semester: number }[] = [];
let allModules: { id: string; title: string; sort_order: number; subject_id: string }[] = [];
vi.mock("@/lib/cache/queries", () => ({
  getSubjectWithYear: (subjectId: string) => subjectMock(subjectId),
  getModulesBySubject: () => Promise.resolve(modules),
  getModuleCounters: () => Promise.resolve([]),
  getActivitySectionsForModules: () => Promise.resolve(activities),
  getSubjectsByYear: () => Promise.resolve(yearSubjects),
  getAllModules: () => Promise.resolve(allModules),
}));
vi.mock("@/lib/subjectHub/queries", () => ({
  getContentSectionCounts: () => Promise.resolve(contentCounts),
}));
vi.mock("@/lib/progress", () => ({ fetchCompletedModules: () => Promise.resolve(new Set()) }));

import ModulesPage, { generateMetadata } from "./page";

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
  contentCounts = null;
  yearSubjects = [];
  allModules = [];
  subjectMock.mockClear();
});

/** The digest Next reads off a thrown notFound()/permanentRedirect(). */
async function failureOf(yearId: string, subjectId: string): Promise<string> {
  try {
    await ModulesPage({ params: Promise.resolve({ yearId, subjectId }) });
  } catch (e) {
    return String((e as { digest?: string }).digest);
  }
  throw new Error("expected the page to 404 or redirect");
}

describe("ModulesPage — one subject, one URL", () => {
  it("renders at the subject's canonical URL", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Modules" })).toBeInTheDocument();
  });

  it("308s a wrong year to the subject's real URL", async () => {
    expect(await failureOf(OTHER_YEAR_ID, SUBJECT_ID)).toBe(
      `NEXT_REDIRECT;replace;/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules;308;`,
    );
  });

  it("404s a subject that does not exist", async () => {
    expect(await failureOf(YEAR_ID, MISSING_SUBJECT_ID)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("404s malformed ids without querying", async () => {
    expect(await failureOf("garbage", SUBJECT_ID)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(await failureOf(YEAR_ID, "garbage")).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(subjectMock).not.toHaveBeenCalled();
  });
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

  // On a phone the teaser was ~1000px of copy above the first module (QA
  // PF-01 follow-up): it is ordered after the list below md, above from md up.
  it("orders the teaser after the module list on mobile only", async () => {
    modules = [
      { id: "m1", title: "Lesson 1" },
      { id: "m2", title: "Lesson 2" },
    ];
    activities = [
      { id: "a1", module_id: "m1" },
      { id: "a2", module_id: "m2" },
    ];
    await renderPage();
    const slot = screen.getByTestId("paywall-teaser-slot");
    expect(slot).toHaveClass("order-last", "md:order-none");
    expect(slot.parentElement).toHaveClass("flex", "flex-col");
  });
});

describe("generateMetadata — the module list's canonical", () => {
  const at = (yearId: string, subjectId: string) =>
    generateMetadata({ params: Promise.resolve({ yearId, subjectId }) });

  it("reads the cached subject row and points the canonical at the validated path", async () => {
    subjectYears = { label: "1st Year", sort_order: 1 };
    const meta = await at(YEAR_ID, SUBJECT_ID);
    expect(meta.title).toBe("Computer Programming 1");
    expect(meta.description).toBe("Modules and reviewers for Computer Programming 1 (1st Year).");
    expect(meta.alternates?.canonical).toBe(`/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules`);
  });

  it("describes nothing for a URL the page would redirect or 404", async () => {
    expect(await at(OTHER_YEAR_ID, SUBJECT_ID)).toEqual({});
    expect(await at(YEAR_ID, MISSING_SUBJECT_ID)).toEqual({});
    expect(await at("garbage", SUBJECT_ID)).toEqual({});
  });
});

// 2026-11-01 second-year conversion: Computer Programming 2 converted 43% of
// subject openers to a lesson open against 80% for Computer Programming 1.
// The page's first call to action was the paid offer, not a lesson.
describe("ModulesPage — subject hub", () => {
  const cp2 = () => {
    modules = [
      { id: "u1", title: "Unit 1: Arrays", sort_order: 1 },
      { id: "exam", title: "Exam Prep: Prelims & Finals", sort_order: 2 },
    ];
    activities = [
      { id: "a1", module_id: "u1" },
      { id: "a2", module_id: "exam" },
    ];
  };

  it("puts a Start here card for the first lesson ahead of the paid offer", async () => {
    cp2();
    await renderPage();
    const card = screen.getByTestId("start-here-card");
    expect(screen.getByRole("link", { name: /Start lesson/ })).toHaveAttribute(
      "href",
      `/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules/u1`,
    );
    const slot = screen.getByTestId("paywall-teaser-slot");
    expect(card.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("names lessons, reviewers and the free module under the heading", async () => {
    cp2();
    await renderPage();
    expect(screen.getByTestId("subject-hub-summary")).toHaveTextContent("1 lesson · 2 reviewers · exam prep included");
    expect(
      screen.getByText("Every lesson is free to read. The 1 reviewer in Unit 1: Arrays is free too."),
    ).toBeInTheDocument();
  });

  it("starts past a module with no content", async () => {
    cp2();
    modules = [{ id: "u0", title: "Unit 0: Setup", sort_order: 0 }, ...modules];
    contentCounts = { u0: 0, u1: 7, exam: 2 };
    await renderPage();
    expect(screen.getByRole("link", { name: /Start lesson/ })).toHaveAttribute(
      "href",
      `/year/${YEAR_ID}/subjects/${SUBJECT_ID}/modules/u1`,
    );
  });

  it("points a subject with no modules at a sibling subject's first lesson", async () => {
    yearSubjects = [
      { id: SUBJECT_ID, title: "Computer Programming 1", sort_order: 1, semester: 1 },
      { id: "dsa", title: "Data Structures and Algorithms", sort_order: 2, semester: 1 },
    ];
    allModules = [{ id: "d1", title: "Introduction to Data Structures", sort_order: 1, subject_id: "dsa" }];
    await renderPage();
    expect(screen.queryByTestId("start-here-card")).toBeNull();
    expect(screen.getByTestId("next-available-lesson")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start lesson/ })).toHaveAttribute(
      "href",
      `/year/${YEAR_ID}/subjects/dsa/modules/d1`,
    );
  });
});

describe("ModulesPage — metadata", () => {
  it("describes the subject by its lesson counts and free lessons", async () => {
    subjectYears = { label: "1st Year", sort_order: 1 };
    modules = [
      { id: "l1", title: "Lesson 1: Programming Concepts", sort_order: 1 },
      { id: "l2", title: "Lesson 2: Introduction to C", sort_order: 2 },
    ];
    activities = [{ id: "a1", module_id: "l1" }];
    const meta = await generateMetadata({
      params: Promise.resolve({ yearId: YEAR_ID, subjectId: SUBJECT_ID }),
    });
    expect(meta.title).toBe("Computer Programming 1");
    expect(meta.description).toBe(
      "Computer Programming 1 (1st Year): 2 lessons, 1 reviewer. Every lesson is free to read.",
    );
  });
});
