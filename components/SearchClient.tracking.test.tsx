import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const logEvent = vi.fn((..._args: unknown[]) => Promise.resolve());
vi.mock("@/lib/analytics", () => ({
  logEvent: (...args: unknown[]) => logEvent(...args),
}));

import { SearchClient, type SearchItem } from "./SearchClient";
import { SEARCH_SETTLE_MS } from "@/lib/analyticsSearch";

const catalogue: SearchItem[] = [
  { type: "subject", id: "cp1", title: "Computer Programming 1", href: "/cp1", context: "1st Year" },
  { type: "module", id: "sql", title: "SQL Joins and Subqueries", href: "/sql", context: "2nd Year · Database Systems" },
  { type: "module", id: "ll", title: "Linked List", href: "/ll", context: "2nd Year · Data Structures and Algorithms" },
];

function type(value: string) {
  fireEvent.change(screen.getByLabelText("Search subjects and modules"), { target: { value } });
}

function eventsOf(type: string) {
  return logEvent.mock.calls.filter(([t]) => t === type).map(([, meta]) => meta);
}

beforeEach(() => {
  vi.useFakeTimers();
  logEvent.mockClear();
  push.mockClear();
  window.history.replaceState(null, "", "/search");
});

afterEach(() => {
  vi.useRealTimers();
  window.history.replaceState(null, "", "/");
});

describe("SearchClient — settled search tracking", () => {
  it("logs nothing while the student is still typing", () => {
    render(<SearchClient items={catalogue} />);
    type("s");
    act(() => vi.advanceTimersByTime(300));
    type("sq");
    act(() => vi.advanceTimersByTime(300));
    type("sql");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS - 1));
    expect(logEvent).not.toHaveBeenCalled();
  });

  it(`logs one search_query ${SEARCH_SETTLE_MS} ms after typing stops, with the result count`, () => {
    render(<SearchClient items={catalogue} />);
    type("s");
    type("sql");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS));
    expect(eventsOf("search_query")).toEqual([{ search_query: "sql", result_count: 1 }]);
    expect(eventsOf("search_no_results")).toEqual([]);
  });

  it("sends the normalized query, not the raw text", () => {
    render(<SearchClient items={catalogue} />);
    type("  Linked    LIST ");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS));
    expect(eventsOf("search_query")).toEqual([{ search_query: "linked list", result_count: 1 }]);
  });

  it("also logs search_no_results when a settled query finds nothing", () => {
    render(<SearchClient items={catalogue} />);
    type("kubernetes");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS));
    expect(eventsOf("search_query")).toEqual([{ search_query: "kubernetes", result_count: 0 }]);
    expect(eventsOf("search_no_results")).toEqual([{ search_query: "kubernetes", result_count: 0 }]);
  });

  it("logs a ?q= link immediately", () => {
    window.history.replaceState(null, "", "/search?q=linked");
    render(<SearchClient items={catalogue} />);
    expect(eventsOf("search_query")).toEqual([{ search_query: "linked", result_count: 1 }]);
  });

  it("settles on Enter without waiting, and does not log the same search twice", () => {
    render(<SearchClient items={catalogue} />);
    type("zzz");
    fireEvent.keyDown(screen.getByLabelText("Search subjects and modules"), { key: "Enter" });
    expect(eventsOf("search_query")).toEqual([{ search_query: "zzz", result_count: 0 }]);
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS * 2));
    expect(eventsOf("search_query")).toHaveLength(1);
  });

  it("never logs an empty box", () => {
    render(<SearchClient items={catalogue} />);
    type("   ");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS * 2));
    expect(logEvent).not.toHaveBeenCalled();
  });

  it("counts the same words typed again after clearing as a new search", () => {
    render(<SearchClient items={catalogue} />);
    type("sql");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS));
    type("");
    type("sql");
    act(() => vi.advanceTimersByTime(SEARCH_SETTLE_MS));
    expect(eventsOf("search_query")).toHaveLength(2);
  });
});
