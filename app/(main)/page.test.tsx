// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

interface QueryCall {
  table: string;
  filters: Array<{ op: string; column: string; value: unknown }>;
}

let counterRows: Array<{ resource_id: string; read_count: number }>;
let queries: QueryCall[];

const MODULE_ID = "33333333-3333-3333-3333-333333333333";
const SUBJECT_ID = "22222222-2222-2222-2222-222222222222";
const YEAR_ID = "11111111-1111-1111-1111-111111111111";

function resultFor(call: QueryCall): Record<string, unknown> {
  if (call.table === "counters") return { data: counterRows };
  if (call.table === "modules") {
    return { data: [{ id: MODULE_ID, title: "Arrays and Loops", subject_id: SUBJECT_ID }] };
  }
  if (call.table === "subjects") {
    return { data: [{ id: SUBJECT_ID, title: "Computer Programming 1", year_id: YEAR_ID }] };
  }
  if (call.table === "years") {
    return { data: [{ id: YEAR_ID, label: "1st Year", coming_soon: false }] };
  }
  return { data: null };
}

function makeQuery(table: string) {
  const call: QueryCall = { table, filters: [] };
  queries.push(call);
  const settle = () => Promise.resolve(resultFor(call));
  const builder = {
    select() {
      return builder;
    },
    eq(column: string, value: unknown) {
      call.filters.push({ op: "eq", column, value });
      return builder;
    },
    gt(column: string, value: unknown) {
      call.filters.push({ op: "gt", column, value });
      return builder;
    },
    in(column: string, value: unknown) {
      call.filters.push({ op: "in", column, value });
      return builder;
    },
    order() {
      return builder;
    },
    limit: settle,
    then: (
      onFulfilled?: (value: Record<string, unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => settle().then(onFulfilled, onRejected),
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({ from: (table: string) => makeQuery(table) }),
}));

let startPath: { href: string; subjectTitle: string; moduleTitle: string } | null;
vi.mock("@/lib/landing", () => ({
  getCp1StartPath: () => Promise.resolve(startPath),
}));

const CP1_PATH = `/year/${YEAR_ID}/subjects/cp1/modules/lesson-1`;

import LandingPage, { metadata as landingMetadata } from "./page";
import { cheapestSubjectPrice } from "@/lib/pricing";

beforeEach(() => {
  queries = [];
  counterRows = [];
  startPath = {
    href: CP1_PATH,
    subjectTitle: "Computer Programming 1",
    moduleTitle: "Lesson 1: Programming Concepts",
  };
});

async function renderPage() {
  const ui = await LandingPage();
  return render(ui);
}

describe("LandingPage — tour anchors", () => {
  it("marks the start, subjects, and search links for the tour to anchor to", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: /start lesson 1/i })).toHaveAttribute(
      "data-tour",
      "landing-start"
    );
    expect(screen.getByRole("link", { name: /browse all subjects/i })).toHaveAttribute(
      "data-tour",
      "landing-subjects"
    );
    expect(screen.getByRole("link", { name: /search modules/i })).toHaveAttribute(
      "data-tour",
      "landing-search"
    );
  });

  it("marks the popular-modules section for the tour when it renders", async () => {
    counterRows = [{ resource_id: MODULE_ID, read_count: 42 }];
    const { container } = await renderPage();

    expect(container.querySelector('[data-tour="landing-popular"]')).not.toBeNull();
    expect(screen.getByText("Arrays and Loops")).toBeInTheDocument();
  });

  it("renders no landing-popular element at all when there are no reads yet", async () => {
    counterRows = [];
    const { container } = await renderPage();

    expect(container.querySelector('[data-tour="landing-popular"]')).toBeNull();
  });
});

describe("LandingPage — CP1 path", () => {
  it("leads with one primary CTA straight into CP1 Lesson 1", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: /start lesson 1/i })).toHaveAttribute("href", CP1_PATH);
    expect(
      screen.getByText(/first year\? begin with computer programming 1 — lesson 1 and its reviewers are free\./i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start here/i })).toBeNull();
  });

  it("keeps every other subject one tap away", async () => {
    await renderPage();
    expect(screen.getByRole("link", { name: /browse all subjects/i })).toHaveAttribute("href", "/year");
  });

  it("falls back to the all-subjects entry when CP1 cannot be found", async () => {
    startPath = null;
    await renderPage();

    const start = screen.getByRole("link", { name: /start here/i });
    expect(start).toHaveAttribute("href", "/year");
    expect(start).toHaveAttribute("data-tour", "landing-subjects");
    expect(screen.queryByRole("link", { name: /start lesson 1/i })).toBeNull();
    expect(screen.queryByText(/first year\?/i)).toBeNull();
  });
});

describe("LandingPage — footer claims", () => {
  it("says lessons are free and quotes the reviewer price from PLANS (QA CT-05)", async () => {
    const { container } = await renderPage();
    expect(
      screen.getByText(`Lessons free · Reviewers from ${cheapestSubjectPrice().amountLabel}`)
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/^free to read$/im);
  });

  it("promises only what is true about data: never sold, not never shared (QA CT-06)", async () => {
    const { container } = await renderPage();
    expect(screen.getByText(/we never sell your data\./i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/sell or share/i);
  });
});

describe("LandingPage — metadata", () => {
  it("shares a descriptive title", () => {
    expect(landingMetadata.openGraph).toMatchObject({ url: "/" });
    expect(String(landingMetadata.openGraph?.title)).toMatch(/BSIT Survival Kit — Free lessons/);
  });
});
