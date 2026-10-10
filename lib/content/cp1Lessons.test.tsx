// @vitest-environment jsdom
// CP1 Lessons 1-6: the Key Takeaways rows, the diagram references and the
// section order, checked in the seed (the repo source of truth), rendered
// through the reader's own markdown component, and cross-checked against the
// migration that carries the same change to production.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMarkdown } from "@/components/BodyMarkdown";
import { lintBody } from "@/scripts/content/lintMath";

const ROOT = join(__dirname, "..", "..");
const SEED = readFileSync(join(ROOT, "supabase/seeds/cp1_modules_sections.sql"), "utf8");
const MIGRATION = readFileSync(
  join(ROOT, "supabase/migrations/20261101000800_cp1_takeaways_diagrams.sql"),
  "utf8",
);
const moduleId = (n: number) => `a1000001-0001-0001-0001-00000000000${n}`;
const takeawayId = (n: number) => `a1000001-0001-0001-0002-00000000000${n}`;

interface Row {
  id?: string;
  module: string;
  kind: "content" | "activity";
  heading: string;
  body: string;
  sort: number;
}

const ROW =
  /\((?:'([0-9a-f-]{36})',)?'(a1000001-0001-0001-0001-[0-9a-f]{12})','(content|activity)','((?:[^']|'')*)',\$md\$([\s\S]*?)\$md\$, (\d+)/g;
const rows: Row[] = [...SEED.matchAll(ROW)].map((m) => ({
  id: m[1],
  module: m[2],
  kind: m[3] as Row["kind"],
  heading: m[4],
  body: m[5],
  sort: Number(m[6]),
}));
const lesson = (n: number) =>
  rows.filter((r) => r.module === moduleId(n)).sort((a, b) => a.sort - b.sort);

const DIAGRAM_SECTION: Record<number, string> = {
  1: "Program Logic Formulation",
  2: "The Compilation Process",
  3: "Standard Input: scanf()",
  4: "Loop Structures",
  5: "What Is an Array?",
  6: "Call by Value vs. Call by Reference",
};

describe.each([1, 2, 3, 4, 5, 6])("CP1 Lesson %i", (n) => {
  const sections = lesson(n);
  const takeaways = sections.find((r) => r.heading === "Key Takeaways");

  it("has one free Key Takeaways section with a fixed id", () => {
    expect(sections.filter((r) => r.heading === "Key Takeaways")).toHaveLength(1);
    expect(takeaways?.id).toBe(takeawayId(n));
    expect(takeaways?.kind).toBe("content");
  });

  it("renders the takeaways as one list of 3 to 5 points with no broken markup", () => {
    const body = takeaways!.body;
    expect(lintBody(body)).toEqual([]);
    const { container } = render(<BodyMarkdown body={body} />);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(1);
    const items = lists[0].querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items.length).toBeLessThanOrEqual(5);
    // House style: commas and colons, not em dashes.
    expect(body).not.toContain("—");
  });

  it("orders notes, then Key Takeaways, then Try It, then the reviewers", () => {
    const order = sections.map((r) =>
      r.heading === "Key Takeaways"
        ? "takeaways"
        : r.heading.startsWith("Try It:")
          ? "try"
          : r.kind === "activity"
            ? "reviewer"
            : "notes",
    );
    const expected = [
      ...order.filter((o) => o === "notes"),
      "takeaways",
      ...(n >= 2 ? ["try"] : []),
      "reviewer",
      "reviewer",
      "reviewer",
    ];
    expect(order).toEqual(expected);
    // No two rows share a slot, so the reader's sort is unambiguous.
    expect(new Set(sections.map((r) => r.sort)).size).toBe(sections.length);
    // Try It stays a free content row.
    for (const r of sections.filter((s) => s.heading.startsWith("Try It:"))) {
      expect(r.kind).toBe("content");
    }
  });

  it("shows its diagram as an image with alt text, in the section it explains", () => {
    const withImage = sections.filter((r) => r.body.includes("/diagrams/cp1/"));
    expect(withImage.map((r) => r.heading)).toEqual([DIAGRAM_SECTION[n]]);
    const body = withImage[0].body;
    expect(lintBody(body)).toEqual([]);
    const { container } = render(<BodyMarkdown body={body} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    const src = imgs[0].getAttribute("src")!;
    expect(src).toMatch(new RegExp(`^/diagrams/cp1/lesson-${n}-[a-z0-9-]+\\.svg$`));
    expect(existsSync(join(ROOT, "public", src))).toBe(true);
    expect(imgs[0].getAttribute("alt")!.length).toBeGreaterThan(80);
  });

  it("matches the migration: same takeaways text, same image, same order", () => {
    // Takeaways: the migration's row for this lesson carries the seed body verbatim.
    const row = new RegExp(
      `\\('${takeawayId(n)}', '${moduleId(n)}', 'content', 'Key Takeaways', \\$md\\$([\\s\\S]*?)\\$md\\$, (\\d+)\\)`,
    ).exec(MIGRATION);
    expect(row?.[1]).toBe(takeaways!.body);
    expect(Number(row?.[2])).toBe(takeaways!.sort);

    // Image: the markdown appended in production is the markdown in the seed.
    const image = sections.find((r) => r.body.includes("/diagrams/cp1/"))!.body.match(/!\[[^\n]*\)/)![0];
    expect(MIGRATION).toContain(image);

    // Order: the sort orders the migration assigns in this module are exactly
    // the seed's for the rows that move (reviewers, and Try It from Lesson 2).
    const assigned = [...MIGRATION.matchAll(/\('[0-9a-f-]{36}', '([0-9a-f-]{36})', '(content|activity)',\s*(\d+)\)/g)]
      .filter((m) => m[1] === moduleId(n))
      .map((m) => `${m[2]}:${m[3]}`)
      .sort();
    const moved = sections
      .filter((r) => r.kind === "activity" || r.heading.startsWith("Try It:"))
      .map((r) => `${r.kind}:${r.sort}`)
      .sort();
    expect(assigned).toEqual(moved);
  });
});

describe("CP1 Lesson 7", () => {
  it("is untouched: no takeaways, no diagram, Try It still last", () => {
    const sections = lesson(7);
    expect(sections.some((r) => r.heading === "Key Takeaways")).toBe(false);
    expect(sections.some((r) => r.body.includes("/diagrams/"))).toBe(false);
    expect(sections.at(-1)?.heading.startsWith("Try It:")).toBe(true);
    expect(MIGRATION).not.toContain(moduleId(7));
  });
});
