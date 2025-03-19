// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BodyMarkdown } from "./BodyMarkdown";

describe("BodyMarkdown — reading measure and ink (QA DS-12)", () => {
  it("sets body text in the main ink colour at a ~70ch measure", () => {
    render(<BodyMarkdown body={"A paragraph of lesson text.\n\n- a list item\n\n1. a step"} />);
    const p = screen.getByText("A paragraph of lesson text.");
    expect(p).toHaveClass("text-ink", "max-w-prose");
    expect(p).not.toHaveClass("text-ink-muted");
    for (const list of [document.querySelector("ul"), document.querySelector("ol")]) {
      expect(list).toHaveClass("text-ink", "max-w-prose");
    }
  });

  it("lets code blocks run wider than the prose measure", () => {
    const { container } = render(<BodyMarkdown body={"```\nprint('hi')\n```"} />);
    expect(container.querySelector("pre")).not.toHaveClass("max-w-prose");
  });
});

describe("BodyMarkdown — tables (QA DS-13)", () => {
  const table = "| Week | Topic | Notes |\n|---|---|---|\n| 1 | Patterns | classifying frieze patterns |";

  it("wraps tables in a keyboard-scrollable region", () => {
    render(<BodyMarkdown body={table} />);
    const region = screen.getByRole("region", { name: /scrolls sideways/i });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(region.querySelector("table")).not.toBeNull();
  });

  it("sets table headers in ink-muted, not the 2.07:1 ink-faint label", () => {
    render(<BodyMarkdown body={table} />);
    const th = screen.getByRole("columnheader", { name: "Topic" });
    expect(th).toHaveClass("text-ink-muted");
    expect(th).not.toHaveClass("label-sm");
  });
});
