// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";


const YEAR_ID = "11111111-1111-1111-1111-111111111111";

vi.mock("next/navigation", async (orig) => ({
  ...(await orig<typeof import("next/navigation")>()),
  usePathname: () => "/year/x/subjects",
  useSearchParams: () => new URLSearchParams(),
}));

vi.stubGlobal(
  "fetch",
  vi.fn(async () => new Response(JSON.stringify({ signedIn: false, firstName: null }), { status: 200 })),
);

const SOON_YEAR_ID = "99999999-9999-9999-9999-999999999999";
const subjectsByYearMock = vi.fn((_yearId: string) =>
  Promise.resolve([
    { id: "s1", title: "Subject One", slug: "subject-one", semester: 1, kind: "major", sort_order: 1 },
  ]),
);
vi.mock("@/lib/cache/queries", () => ({
  getYears: () =>
    Promise.resolve([
      { id: YEAR_ID, label: "1st Year", sort_order: 1, coming_soon: false },
      { id: SOON_YEAR_ID, label: "4th Year", sort_order: 4, coming_soon: true },
    ]),
  getSubjectsByYear: (yearId: string) => subjectsByYearMock(yearId),
  // The subject's own counter is stale by design; the page must not read it.
  getSubjectCounters: () => Promise.resolve([{ resource_id: "s1", read_count: 5 }]),
  getModulesBySubject: () =>
    Promise.resolve([
      { id: "m1", title: "Lesson 1", sort_order: 1 },
      { id: "m2", title: "Lesson 2", sort_order: 2 },
    ]),
  getModuleCounters: () =>
    Promise.resolve([
      { resource_id: "m1", read_count: 6400 },
      { resource_id: "m2", read_count: 3700 },
    ]),
}));

import SubjectsPage, { generateMetadata } from "./page";

async function renderPage(params: { yearId: string } = { yearId: YEAR_ID }) {
  const ui = await SubjectsPage({
    params: Promise.resolve(params),
  });
  return render(ui);
}


describe("SubjectsPage — Select Year back-link", () => {
  it("points back at the top-level year picker, not a non-existent /year/[yearId] route", async () => {
    await renderPage();

    const backLink = screen.getByRole("link", { name: /select year/i });
    expect(backLink).toHaveAttribute("href", "/year");
  });
});

describe("SubjectsPage — the year at the root of the chain", () => {
  async function failureOf(yearId: string): Promise<string> {
    try {
      await SubjectsPage({ params: Promise.resolve({ yearId }) });
    } catch (e) {
      return String((e as { digest?: string }).digest);
    }
    throw new Error("expected the page to 404");
  }

  it("404s an unknown or unreleased year before fetching its subjects", async () => {
    subjectsByYearMock.mockClear();
    expect(await failureOf("22222222-2222-2222-2222-222222222222")).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(await failureOf("garbage")).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(await failureOf(SOON_YEAR_ID)).toBe("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(subjectsByYearMock).not.toHaveBeenCalled();
  });
});

describe("SubjectsPage — metadata", () => {
  it("titles the page by year, through the same cached queries as the page", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ yearId: YEAR_ID }) });
    expect(meta.title).toBe("1st Year BSIT Subjects");
    expect(meta.description).toContain("Subject One");
    expect(meta.openGraph).toMatchObject({ url: `/year/${YEAR_ID}/subjects` });
  });

  it("returns nothing for an unknown year", async () => {
    expect(await generateMetadata({ params: Promise.resolve({ yearId: "nope" }) })).toEqual({});
  });
});

describe("SubjectsPage — subject reads (QA CT-12)", () => {
  it("shows the sum of the subject's lesson reads, never fewer than one lesson", async () => {
    await renderPage();
    expect(screen.getByText("10.1k")).toBeInTheDocument();
  });
});
