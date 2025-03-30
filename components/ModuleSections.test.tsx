// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/year/y/subjects/s/modules/m",
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn(), logSectionView: vi.fn() }));

let subscribed: boolean | null = false;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: () => ({ subscribed, polling: false, unlocked: false, pollTimedOut: false }),
}));

import { ModuleSections, type ReaderSection } from "./ModuleSections";

const YEAR = "11111111-1111-1111-1111-111111111111";
const SUBJECT = "22222222-2222-2222-2222-222222222222";
const MODULE = "33333333-3333-3333-3333-333333333333";

const LOCKED: ReaderSection[] = [
  { id: "c1", kind: "content", heading: "Intro", body_md: "Lesson text", sort_order: 1 },
  { id: "a1", kind: "activity", heading: "Drill one", body_md: "", sort_order: 2 },
];
const FULL_ACTIVITY: ReaderSection[] = [
  { id: "a1", kind: "activity", heading: "Drill one", body_md: "PAID ANSWER KEY", sort_order: 2 },
];

const fetchMock = vi.fn();

function renderSections(overrides: Partial<React.ComponentProps<typeof ModuleSections>> = {}) {
  return render(
    <ModuleSections
      yearId={YEAR}
      subjectId={SUBJECT}
      moduleId={MODULE}
      subjectTitle="CP1"
      sections={LOCKED}
      unlockAll={false}
      freeSectionIds={[]}
      reviewerCount={3}
      teaser={<p>TEASER</p>}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  subscribed = false;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ subscribed: true, sections: FULL_ACTIVITY }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ModuleSections", () => {
  it("renders the locked view with the teaser and never asks for paid bodies", async () => {
    renderSections();
    expect(await screen.findByText("Lesson text")).toBeInTheDocument();
    expect(screen.getByText("Drill one")).toBeInTheDocument();
    expect(screen.getByText("TEASER")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText("PAID ANSWER KEY")).not.toBeInTheDocument();
  });

  it("does not ask while the subscription check is still in flight", async () => {
    subscribed = null;
    renderSections();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swaps in the full bodies and drops the teaser for a subscriber", async () => {
    subscribed = true;
    renderSections();
    expect(await screen.findByText("PAID ANSWER KEY")).toBeInTheDocument();
    expect(screen.queryByText("TEASER")).not.toBeInTheDocument();
    expect(screen.getByText("Lesson text")).toBeInTheDocument();
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/subscription-status?");
    expect(url).toContain(`moduleId=${MODULE}`);
  });

  it("stays locked when the server refuses", async () => {
    subscribed = true;
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ subscribed: false }), { status: 200 }));
    renderSections();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByText("TEASER")).toBeInTheDocument();
    expect(screen.queryByText("PAID ANSWER KEY")).not.toBeInTheDocument();
  });

  it("skips the request when every activity is already free sample", async () => {
    subscribed = true;
    renderSections({ freeSectionIds: ["a1"] });
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("ModuleSections — print-ready marker", () => {
  const pending = () => document.querySelector('[data-reader-unlock="pending"]');

  it("marks the page pending while the subscription check is in flight", () => {
    subscribed = null;
    renderSections();
    expect(pending()).not.toBeNull();
  });

  it("clears it for a reader who is not subscribed", () => {
    subscribed = false;
    renderSections();
    expect(pending()).toBeNull();
  });

  it("clears it once a subscriber's bodies are in", async () => {
    subscribed = true;
    renderSections();
    await waitFor(() => expect(screen.getByText("PAID ANSWER KEY")).toBeInTheDocument());
    expect(pending()).toBeNull();
  });
});

describe("ModuleSections — afterContent slot", () => {
  it("sits between the notes and the first reviewer", () => {
    renderSections({ afterContent: <p>QUICK CHECK</p> });
    const text = document.body.textContent ?? "";
    expect(text.indexOf("Lesson text")).toBeLessThan(text.indexOf("QUICK CHECK"));
    expect(text.indexOf("QUICK CHECK")).toBeLessThan(text.indexOf("Drill one"));
  });

  it("goes last when the lesson has no reviewers", () => {
    renderSections({ sections: [LOCKED[0]], afterContent: <p>QUICK CHECK</p> });
    const text = document.body.textContent ?? "";
    expect(text.indexOf("Lesson text")).toBeLessThan(text.indexOf("QUICK CHECK"));
    expect(screen.getAllByText("QUICK CHECK")).toHaveLength(1);
  });
});

describe("ModuleSections — runs of locked reviewers (QA DS-14)", () => {
  const EXAM_PREP: ReaderSection[] = [
    { id: "c1", kind: "content", heading: "Intro", body_md: "Lesson text", sort_order: 1 },
    ...["A", "B", "C", "D"].map((x, i) => ({
      id: `l${i}`, kind: "activity", heading: `Prelim Mock Exam ${x}`, body_md: "", sort_order: 3 + i,
    })),
  ];

  it("collapses consecutive locked reviewers into one card with one CTA", () => {
    renderSections({ sections: EXAM_PREP, freeSectionIds: ["elsewhere"] });
    expect(screen.getByText(/4 reviewers locked/i)).toBeInTheDocument();
    for (const x of ["A", "B", "C", "D"]) {
      expect(screen.getByText(`Prelim Mock Exam ${x}`)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link", { name: /^unlock/i })).toHaveLength(1);
    expect(screen.queryByText(/reviewer — locked/i)).toBeNull();
    // LessonOverview's topic links still have somewhere to land.
    expect(document.getElementById("sec-l2")).toHaveTextContent("Prelim Mock Exam C");
  });

  it("keeps a lone locked reviewer as its own strip", () => {
    renderSections();
    expect(screen.getByText(/reviewer — locked/i)).toBeInTheDocument();
    expect(screen.queryByText(/reviewers locked/i)).toBeNull();
  });

  it("drops the card once a subscriber's bodies arrive", async () => {
    subscribed = true;
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ subscribed: true, sections: EXAM_PREP.slice(1).map((s) => ({ ...s, body_md: `Body ${s.id}` })) }), { status: 200 }),
    );
    renderSections({ sections: EXAM_PREP, freeSectionIds: ["elsewhere"] });
    expect(await screen.findByText("Body l3")).toBeInTheDocument();
    expect(screen.queryByText(/reviewers locked/i)).toBeNull();
  });
});
