// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";

let session = { ready: false, signedIn: false, userId: null as string | null, overallDone: 0, overallTotal: 0 };
vi.mock("@/hooks/useSession", () => ({ useSession: () => session }));

import { PrintGateRoot, PRINT_SIGNED_OUT_NOTICE } from "./PrintGateRoot";

function root(container: HTMLElement) {
  return container.querySelector(".print-gate-root")!;
}

beforeEach(() => {
  session = { ready: false, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };
});

describe("PrintGateRoot", () => {
  it("is locked in the static HTML every visitor gets", () => {
    const html = renderToStaticMarkup(
      <PrintGateRoot>
        <p>lesson</p>
      </PrintGateRoot>,
    );
    expect(html).toContain('data-print-gate="locked"');
    expect(html).toContain(PRINT_SIGNED_OUT_NOTICE);
  });

  it("stays locked for a signed-out reader", () => {
    session = { ...session, ready: true, signedIn: false };
    const { container } = render(<PrintGateRoot>lesson</PrintGateRoot>);
    expect(root(container)).toHaveAttribute("data-print-gate", "locked");
  });

  it("opens for a signed-in reader", () => {
    session = { ...session, ready: true, signedIn: true, userId: "u1" };
    const { container } = render(<PrintGateRoot>lesson</PrintGateRoot>);
    expect(root(container)).toHaveAttribute("data-print-gate", "open");
  });

  it("still renders the lesson on screen either way", () => {
    render(<PrintGateRoot>lesson body</PrintGateRoot>);
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
  });
});
