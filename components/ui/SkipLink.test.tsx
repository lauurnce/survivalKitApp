// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SkipLink } from "./SkipLink";

afterEach(cleanup);

// QA PF-05: #content wrapped the whole page, TopBar included, so after the
// skip link the next Tab landed on "Toggle dark mode" — the very controls it
// was meant to skip. It now moves focus into the page's <main>.
describe("SkipLink", () => {
  function page(withMain: boolean) {
    return render(
      <>
        <SkipLink />
        <div id="content">
          <div>
            <button type="button">Toggle dark mode</button>
          </div>
          {withMain ? (
            <main>
              <a href="/year">First link in main</a>
            </main>
          ) : (
            <p>No main here</p>
          )}
        </div>
      </>
    );
  }

  it("is the first stop and points at #content without JavaScript", () => {
    page(true);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#content");
  });

  it("moves focus to <main>, past the top bar", () => {
    page(true);
    fireEvent.click(screen.getByRole("link", { name: "Skip to content" }));
    const main = screen.getByRole("main");
    expect(document.activeElement).toBe(main);
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("falls back to #content when a page has no <main>", () => {
    page(false);
    fireEvent.click(screen.getByRole("link", { name: "Skip to content" }));
    expect(document.activeElement).toBe(document.getElementById("content"));
  });
});
