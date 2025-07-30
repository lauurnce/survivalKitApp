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
    expect(screen.getByText("Lesson text")).toBeInTheDocument();
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
