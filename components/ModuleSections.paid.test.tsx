// @vitest-environment jsdom
// The reported bug: a subject's first module has only free-sample reviewers,
// so nothing on it asked for the subscription status and a paying reader kept
// seeing "That was the free sample … Unlock all reviewers".
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { SubscriptionStatus } from "@/hooks/useSubscriptionStatus";

vi.mock("next/navigation", () => ({
  usePathname: () => "/year/y/subjects/s/modules/m",
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ logEvent: vi.fn(), logSectionView: vi.fn() }));

let status: SubscriptionStatus;
vi.mock("@/hooks/useSubscriptionStatus", () => ({ useSubscriptionStatus: () => status }));

import { ModuleSections, type ReaderSection } from "./ModuleSections";

const base: SubscriptionStatus = { subscribed: false, polling: false, unlocked: false, pollTimedOut: false };

// Module 1 of a subject: both reviewers are the free sample, in full.
const FREE_MODULE: ReaderSection[] = [
  { id: "c1", kind: "content", heading: "Intro", body_md: "Lesson text", sort_order: 1 },
  { id: "a1", kind: "activity", heading: "Drill one", body_md: "Free drill one", sort_order: 2 },
  { id: "a2", kind: "activity", heading: "Drill two", body_md: "Free drill two", sort_order: 3 },
];

const CARD = /that was the free sample/i;
const LABEL = /^free sample$/i;

function renderFreeModule() {
  return render(
    <ModuleSections
      yearId="y"
      subjectId="s"
      moduleId="m"
      subjectTitle="Computer Programming 1"
      sections={FREE_MODULE}
      unlockAll={false}
      freeSectionIds={["a1", "a2"]}
      reviewerCount={29}
    />,
  );
}

function clearAuthCookie() {
  document.cookie = "sb-ref-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

beforeEach(() => {
  status = { ...base };
  window.history.replaceState({}, "", "/year/y/subjects/s/modules/m");
  clearAuthCookie();
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  clearAuthCookie();
});

describe("ModuleSections — free sample upsell vs paid status", () => {
  it("shows the free-sample card and labels to a reader without access", () => {
    renderFreeModule();
    expect(screen.getByText(CARD)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /unlock all reviewers/i })).toBeInTheDocument();
    expect(screen.getAllByText(LABEL).length).toBeGreaterThan(0);
  });

  it("drops the card and labels for a subject-plan subscriber", () => {
    status = { ...base, subscribed: true, plan: { scope: "subject", until: "2026-12-01T00:00:00Z" } };
    renderFreeModule();
    expect(screen.queryByText(CARD)).toBeNull();
    expect(screen.queryByText(LABEL)).toBeNull();
    expect(screen.queryByRole("link", { name: /unlock/i })).toBeNull();
    // The reviewers themselves stay.
    expect(screen.getByText("Free drill two")).toBeInTheDocument();
  });

  it("drops them for a year-pass subscriber", () => {
    status = { ...base, subscribed: true, plan: { scope: "year", until: "2027-01-31T00:00:00Z" } };
    renderFreeModule();
    expect(screen.queryByText(CARD)).toBeNull();
  });

  it("drops them while a just-paid reader's payment is polling, and after it times out", () => {
    status = { ...base, polling: true };
    const { unmount } = renderFreeModule();
    expect(screen.queryByText(CARD)).toBeNull();
    unmount();
    status = { ...base, pollTimedOut: true };
    renderFreeModule();
    expect(screen.queryByText(CARD)).toBeNull();
  });

  it("does not flash the card at a signed-in reader while the status loads", () => {
    status = { ...base, subscribed: null };
    document.cookie = "sb-ref-auth-token=x; path=/";
    renderFreeModule();
    expect(screen.queryByText(CARD)).toBeNull();
  });

  it("keeps the static locked view for a signed-out reader while the status loads", () => {
    status = { ...base, subscribed: null };
    renderFreeModule();
    expect(screen.getByText(CARD)).toBeInTheDocument();
  });
});
