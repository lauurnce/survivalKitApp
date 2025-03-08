// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, ButtonLink, buttonClasses } from "./Button";

const VARIANTS = ["primary", "secondary", "ghost"] as const;
const SIZES = ["md", "lg"] as const;

describe("buttonClasses", () => {
  it("gives every variant and size the same square radius and a 44px minimum height", () => {
    for (const variant of VARIANTS) {
      for (const size of SIZES) {
        const cls = buttonClasses({ variant, size }).split(" ");
        expect(cls).toContain("rounded-none");
        expect(cls.filter((c) => /^rounded/.test(c))).toEqual(["rounded-none"]);
        // md is exactly 44px; lg is taller, never shorter.
        expect(cls.some((c) => c === "min-h-11" || c === "min-h-[52px]")).toBe(true);
      }
    }
  });

  it("fills primary with the AA accent and white text, not the bright accent", () => {
    const cls = buttonClasses({ variant: "primary" }).split(" ");
    expect(cls).toContain("bg-accent-strong");
    expect(cls).toContain("text-white");
    expect(cls).not.toContain("bg-accent");
  });

  it("draws secondary as a 1px ink outline", () => {
    const cls = buttonClasses({ variant: "secondary" }).split(" ");
    expect(cls).toContain("border-ink");
    expect(cls).toContain("text-ink");
  });

  it("appends caller classes last", () => {
    expect(buttonClasses({ className: "w-full" }).endsWith(" w-full")).toBe(true);
  });
});

describe("Button", () => {
  it("renders a non-submitting button by default", () => {
    render(<Button>Unlock</Button>);
    expect(screen.getByRole("button", { name: "Unlock" })).toHaveAttribute("type", "button");
  });

  it("keeps an explicit submit type", () => {
    render(<Button type="submit">Pay</Button>);
    expect(screen.getByRole("button", { name: "Pay" })).toHaveAttribute("type", "submit");
  });

  it("passes clicks and disabled through", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Button onClick={onClick} disabled>Go</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies the variant and size classes", () => {
    render(<Button variant="secondary" size="lg">More</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-ink");
    expect(btn.className).toContain("min-h-[52px]");
  });
});

describe("ButtonLink", () => {
  it("renders a link with button styling", () => {
    render(<ButtonLink href="/year">Browse subjects →</ButtonLink>);
    const link = screen.getByRole("link", { name: "Browse subjects →" });
    expect(link).toHaveAttribute("href", "/year");
    expect(link.className).toContain("bg-accent-strong");
    expect(link.className).toContain("min-h-11");
  });

  it("supports the ghost variant", () => {
    render(<ButtonLink href="/faq" variant="ghost">FAQ</ButtonLink>);
    expect(screen.getByRole("link").className).not.toContain("bg-accent-strong");
  });
});
