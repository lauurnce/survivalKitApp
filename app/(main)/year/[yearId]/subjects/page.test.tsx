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

vi.mock("@/lib/cache/queries", () => ({
  getYears: () =>
    Promise.resolve([{ id: YEAR_ID, label: "1st Year", sort_order: 1, coming_soon: false }]),
  getSubjectsByYear: () =>
    Promise.resolve([
      { id: "s1", title: "Subject One", slug: "subject-one", semester: 1, kind: "major", sort_order: 1 },
    ]),
  getSubjectCounters: () => Promise.resolve([{ resource_id: "s1", read_count: 0 }]),
  getModulesBySubject: () => Promise.resolve([]),
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
