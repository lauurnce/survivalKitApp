import { describe, expect, it } from "vitest";
import { fullTitle, pageMetadata, subjectsDescription } from "./pageMetadata";

describe("pageMetadata", () => {
  const meta = pageMetadata({ title: "Search", description: "Find it.", path: "/search" });

  it("points og:url at the page, not the home page", () => {
    expect(meta.openGraph).toMatchObject({ url: "/search", type: "website", siteName: "BSIT Survival Kit" });
  });

  it("gives link previews the page's own title, with the site suffix", () => {
    expect(meta.title).toBe("Search");
    expect(meta.openGraph?.title).toBe("Search — BSIT Survival Kit");
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "Search — BSIT Survival Kit" });
  });

  it("keeps the default share card, which a child openGraph would otherwise drop", () => {
    expect(meta.openGraph?.images).toEqual([expect.objectContaining({ url: "/opengraph-image", width: 1200, height: 630 })]);
    expect(meta.twitter?.images).toEqual(meta.openGraph?.images);
  });

  it("supports an absolute title that skips the template", () => {
    const home = pageMetadata({ title: "Home title", description: "d", path: "/", absoluteTitle: true });
    expect(home.title).toEqual({ absolute: "Home title" });
    expect(home.openGraph?.title).toBe("Home title");
  });
});

describe("fullTitle", () => {
  it("does not double the site name", () => {
    expect(fullTitle("BSIT Survival Kit")).toBe("BSIT Survival Kit");
  });
});

describe("subjectsDescription", () => {
  const s = (title: string, semester: number, sort_order: number) => ({ title, semester, sort_order });

  it("names the first four subjects in semester order and counts the rest", () => {
    const text = subjectsDescription("1st Year", [
      s("Purcom", 2, 1), s("CP1", 1, 1), s("ITC", 1, 2), s("MMW", 1, 3), s("CP2", 2, 2), s("STS", 2, 3),
    ]);
    expect(text).toBe(
      "1st Year BSIT subjects: CP1, ITC, MMW, Purcom and 2 more. Free lesson notes and reviewers for every module.",
    );
  });

  it("falls back to a generic line when the year has no subjects", () => {
    expect(subjectsDescription("4th Year", [])).toBe("Browse all 4th Year BSIT subjects, modules, and reviewers.");
  });
});
