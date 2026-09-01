// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";

let pathname = "/";
const searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useSearchParams: () => searchParams,
}));

import { GoogleAnalytics } from "./GoogleAnalytics";

beforeEach(() => {
  pathname = "/";
  searchParams.forEach((_v, k) => searchParams.delete(k));
  window.dataLayer = [];
  cleanup();
});

describe("GoogleAnalytics", () => {
  it("renders nothing when no measurement ID is configured", () => {
    const { container } = render(<GoogleAnalytics gaId="" nonce="test-nonce" />);
    expect(container).toBeEmptyDOMElement();
    expect(document.querySelector("script[src*='googletagmanager.com']")).toBeNull();
  });

  it("loads the gtag.js script with the CSP nonce and the measurement ID", () => {
    render(<GoogleAnalytics gaId="G-TEST123" nonce="test-nonce" />);
    const script = document.querySelector(
      "script[src*='googletagmanager.com/gtag/js']",
    ) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script?.src).toContain("id=G-TEST123");
    expect(script?.nonce).toBe("test-nonce");
  });

  it("queues an initial page_view on mount without waiting for gtag.js to load", () => {
    pathname = "/year/1/subjects/data-structures";
    render(<GoogleAnalytics gaId="G-TEST123" nonce="test-nonce" />);
    const events = window.dataLayer.filter(
      (entry) => Array.isArray(entry) && entry[0] === "event" && entry[1] === "page_view",
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual([
      "event",
      "page_view",
      { page_path: "/year/1/subjects/data-structures", send_to: "G-TEST123" },
    ]);
  });

  it("queues a fresh page_view on client-side route changes", () => {
    const { rerender } = render(<GoogleAnalytics gaId="G-TEST123" nonce="test-nonce" />);
    pathname = "/year/2/subjects/algorithms";
    searchParams.set("tab", "reviewer");
    rerender(<GoogleAnalytics gaId="G-TEST123" nonce="test-nonce" />);

    const events = window.dataLayer.filter(
      (entry) => Array.isArray(entry) && entry[0] === "event" && entry[1] === "page_view",
    );
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual([
      "event",
      "page_view",
      { page_path: "/year/2/subjects/algorithms?tab=reviewer", send_to: "G-TEST123" },
    ]);
  });
});
