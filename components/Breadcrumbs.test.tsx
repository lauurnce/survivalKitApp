// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Breadcrumbs } from "./Breadcrumbs";

const TRAIL = [
  { label: "Year", href: "/year" },
  { label: "1st Year", href: "/year/first-year/subjects" },
  { label: "Computer Programming 1", href: "/year/first-year/subjects/cp1/modules" },
  { label: "Variables and Types" },
];

describe("Breadcrumbs", () => {
  it("renders a labeled navigation landmark with an ordered list", () => {
    render(<Breadcrumbs items={TRAIL} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav.querySelector("ol")).not.toBeNull();
  });

  it("links every ancestor level to its own href", () => {
    render(<Breadcrumbs items={TRAIL} />);

    expect(screen.getByRole("link", { name: "Year" })).toHaveAttribute("href", "/year");
    expect(screen.getByRole("link", { name: "1st Year" })).toHaveAttribute(
      "href",
      "/year/first-year/subjects"
    );
    expect(screen.getByRole("link", { name: "Computer Programming 1" })).toHaveAttribute(
      "href",
      "/year/first-year/subjects/cp1/modules"
    );
  });

  it("renders the current page as plain text, not a link, marked aria-current", () => {
    render(<Breadcrumbs items={TRAIL} />);

    expect(screen.queryByRole("link", { name: "Variables and Types" })).toBeNull();
    const current = screen.getByText("Variables and Types");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("still renders a final item that has no href of its own as the current page", () => {
    render(<Breadcrumbs items={[{ label: "Year", href: "/year" }, { label: "1st Year" }]} />);

    expect(screen.getByText("1st Year")).toHaveAttribute("aria-current", "page");
  });

  it("emits matching BreadcrumbList JSON-LD with absolute URLs, in trail order", () => {
    const { container } = render(<Breadcrumbs items={TRAIL} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script!.textContent ?? "{}");

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Year",
        item: "https://survival-kit-app.vercel.app/year",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "1st Year",
        item: "https://survival-kit-app.vercel.app/year/first-year/subjects",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Computer Programming 1",
        item: "https://survival-kit-app.vercel.app/year/first-year/subjects/cp1/modules",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Variables and Types",
      },
    ]);
  });
});
