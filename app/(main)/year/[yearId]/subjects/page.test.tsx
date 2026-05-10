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

import SubjectsPage from "./page";

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
