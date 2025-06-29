// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";

let session = { ready: false, signedIn: false, userId: null as string | null, overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({ useSession: () => session }));

// Keyed like the real store: a year plan answers true for every subject of its
// year, a subject plan only for its own subject.
let entitled: (yearId: string, subjectId: string) => boolean | null = () => null;
vi.mock("@/hooks/useSubscriptionStatus", () => ({
  useSubscriptionStatus: (yearId: string, subjectId: string) => ({
    subscribed: entitled(yearId, subjectId),
    polling: false,
    unlocked: false,
    pollTimedOut: false,
  }),
}));

import { PrintGateRoot, PRINT_SIGNED_OUT_NOTICE, printUnpaidNotice } from "./PrintGateRoot";

const YEAR = "11111111-1111-1111-1111-111111111111";
const CP1 = "22222222-2222-2222-2222-222222222222";
const OTHER = "44444444-4444-4444-4444-444444444444";
const TITLE = "Computer Programming 1";

function Gate({ subjectId = CP1, children = "lesson" }: { subjectId?: string; children?: React.ReactNode }) {
  return (
    <PrintGateRoot yearId={YEAR} subjectId={subjectId} subjectTitle={TITLE}>
      {children}
    </PrintGateRoot>
  );
}

function root(container: HTMLElement) {
  return container.querySelector(".print-gate-root")!;
}

function signedIn() {
  session = { ...session, ready: true, signedIn: true, userId: "u1" };
}

beforeEach(() => {
  session = { ready: false, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };
  entitled = () => null;
});

describe("PrintGateRoot", () => {
  it("is locked in the static HTML every visitor gets", () => {
    const html = renderToStaticMarkup(<Gate>{<p>lesson</p>}</Gate>);
    expect(html).toContain('data-print-gate="locked"');
    expect(html).toContain(PRINT_SIGNED_OUT_NOTICE);
  });

  it("stays locked for a signed-out reader", () => {
    session = { ...session, ready: true, signedIn: false };
    const { container } = render(<Gate />);
    expect(root(container)).toHaveAttribute("data-print-gate", "locked");
    expect(root(container)).toHaveTextContent(PRINT_SIGNED_OUT_NOTICE);
  });

  it("stays locked while a signed-in reader's entitlement is loading", () => {
    signedIn();
    const { container } = render(<Gate />);
    expect(root(container)).toHaveAttribute("data-print-gate", "locked");
    expect(root(container)).toHaveAttribute("data-print-access", "loading");
  });

  it("stays locked for a signed-in reader without the subject, with the unlock notice", async () => {
    signedIn();
    entitled = () => false;
    const { container } = render(<Gate />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-print-access", "unpaid"));
    expect(root(container)).toHaveAttribute("data-print-gate", "locked");
    expect(root(container)).toHaveTextContent(printUnpaidNotice(TITLE));
    expect(printUnpaidNotice(TITLE)).toBe(
      "Download this lesson by unlocking Computer Programming 1 at tryi2i.com",
    );
  });

  it("opens for a reader with this subject's plan", async () => {
    signedIn();
    entitled = (y, s) => y === YEAR && s === CP1;
    const { container } = render(<Gate />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-print-gate", "open"));
  });

  it("opens on another subject of the same year for a year-plan reader", async () => {
    signedIn();
    entitled = (y) => y === YEAR;
    const { container } = render(<Gate subjectId={OTHER} />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-print-gate", "open"));
  });

  it("stays locked on another subject for a reader with only one subject's plan", async () => {
    signedIn();
    entitled = (y, s) => y === YEAR && s === CP1;
    const { container } = render(<Gate subjectId={OTHER} />);
    await waitFor(() => expect(root(container)).toHaveAttribute("data-print-access", "unpaid"));
    expect(root(container)).toHaveAttribute("data-print-gate", "locked");
  });

  it("still renders the lesson on screen either way", () => {
    render(<Gate>lesson body</Gate>);
    expect(screen.getByText("lesson body")).toBeInTheDocument();
  });

  it("has print rules that swap the lesson for the notice while locked", () => {
    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    const print = css.slice(css.indexOf("@media print"));
    expect(print).toMatch(/\[data-print-gate="locked"\]\s*>\s*\.print-gate-content\s*\{[^}]*display:\s*none\s*!important/);
    expect(print).toMatch(/\[data-print-gate="locked"\]\s*>\s*\.print-gate-notice\s*\{[^}]*display:\s*flex\s*!important/);
    expect(print).toMatch(/body:has\(\[data-print-gate="locked"\]\)\s*>\s*footer\s*\{[^}]*display:\s*none/);
    // Hidden on screen by default, outside any media query.
    expect(css).toMatch(/\.print-gate-notice\s*\{\s*display:\s*none;?\s*\}/);
    // Nothing un-hides the lesson in print except the open state.
    expect(print).not.toMatch(/\[data-print-gate="locked"\]\s*>\s*\.print-gate-content\s*\{[^}]*display:\s*(block|flex)/);
  });
});
