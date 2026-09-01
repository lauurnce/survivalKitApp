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

import LandingPage from "./page";

beforeEach(() => {
  queries = [];
  counterRows = [];
});

async function renderPage() {
  const ui = await LandingPage();
  return render(ui);
}

describe("LandingPage — tour anchors", () => {
  it("marks the subjects and search links for the tour to anchor to", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: /start here/i })).toHaveAttribute(
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
