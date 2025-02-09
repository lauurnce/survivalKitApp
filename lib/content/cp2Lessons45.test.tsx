// @vitest-environment jsdom
// CP2 Lesson 4 (Structures) and Lesson 5 (File Handling): the seed rows (the
// repo source of truth) checked for the CP1 lesson shape, every body rendered
// through the reader's own markdown component and the content linter, the
// diagrams checked like CP1's, and the migration cross-checked row by row.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMarkdown } from "@/components/BodyMarkdown";
import { lintBody } from "@/scripts/content/lintMath";

const ROOT = join(__dirname, "..", "..");
const SEED = readFileSync(join(ROOT, "supabase/seeds/cp2_units_4_5.sql"), "utf8");
const MIGRATION = readFileSync(
  join(ROOT, "supabase/migrations/20261101001100_cp2_units_4_5.sql"),
  "utf8",
);
const SUBJECT = "10000000-0001-0002-0001-000000000001";
const moduleId = (n: number) => `a3000001-0001-0002-0001-00000000000${n}`;
const sectionId = (n: number, s: number) =>
  `a3000002-0001-0002-${String(n).padStart(4, "0")}-${String(s).padStart(12, "0")}`;

interface Row {
  id: string;
  module: string;
  kind: "content" | "activity";
  heading: string;
  body: string;
  sort: number;
  ide?: string;
  starter?: string;
}

const ROW =
  /insert into public\.sections \(id, module_id, kind, heading, body_md, sort_order(?:, ide_language, starter_code)?\)\nvalues \('([0-9a-f-]{36})', '([0-9a-f-]{36})', '(content|activity)', '((?:[^']|'')*)', \$md\$\n([\s\S]*?)\n\$md\$, (\d+)(?:, '(\w+)', \$code\$([\s\S]*?)\$code\$)?\)\non conflict \(id\) do update set/g;

function parse(sql: string): Row[] {
  return [...sql.matchAll(ROW)].map((m) => ({
    id: m[1],
    module: m[2],
    kind: m[3] as Row["kind"],
    heading: m[4].replace(/''/g, "'"),
    body: m[5],
    sort: Number(m[6]),
    ide: m[7],
    starter: m[8],
  }));
}

const MODULE =
  /\('(a3000001-0001-0002-0001-[0-9a-f]{12})', '([0-9a-f-]{36})', '((?:[^']|'')*)', '([a-z0-9-]+)', (\d+)\)/g;
const modules = (sql: string) => [...sql.matchAll(MODULE)].map((m) => m.slice(1, 6).join("|")).sort();

const rows = parse(SEED);
const migrationRows = parse(MIGRATION);
const lesson = (n: number) =>
  rows.filter((r) => r.module === moduleId(n)).sort((a, b) => a.sort - b.sort);

const TITLES: Record<number, string> = { 4: "Lesson 4: Structures", 5: "Lesson 5: File Handling" };
const DIAGRAM: Record<number, { section: string; file: string }> = {
  4: { section: "Pointers to Structures: The Arrow Operator", file: "lesson-4-struct-pointer.svg" },
  5: { section: "Opening and Closing Files", file: "lesson-5-fopen-modes.svg" },
};

describe("CP2 Lessons 4-5 seed", () => {
  it("parses every section statement in the seed", () => {
    const statements = SEED.match(/insert into public\.sections/g) ?? [];
    expect(rows).toHaveLength(statements.length);
    expect(rows).toHaveLength(22);
  });

  it("upserts both modules into the CP2 subject with Lesson N titles", () => {
    expect(modules(SEED)).toEqual([
      `${moduleId(4)}|${SUBJECT}|${TITLES[4]}|lesson-4-structures|4`,
      `${moduleId(5)}|${SUBJECT}|${TITLES[5]}|lesson-5-file-handling|5`,
    ]);
  });

  it("never deletes, so re-running it cannot remove other lessons", () => {
    for (const sql of [SEED, MIGRATION]) {
      expect(sql).not.toMatch(/\bdelete\s+from\b/i);
      expect(sql).not.toMatch(/\btruncate\b/i);
      expect(sql.match(/on conflict \(id\) do update/g)?.length).toBeGreaterThanOrEqual(23);
    }
  });
});

describe.each([4, 5])("CP2 Lesson %i", (n) => {
  const sections = lesson(n);

  it("uses the fixed section ids, numbered by position", () => {
    expect(sections.map((r) => r.id)).toEqual(sections.map((r) => sectionId(n, r.sort)));
    expect(sections.map((r) => r.sort)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("follows the CP1 shape: notes, Key Takeaways, Try It, then three reviewers", () => {
    const shape = sections.map((r) =>
      r.heading === "Key Takeaways"
        ? "takeaways"
        : r.heading.startsWith("Try It:")
          ? "try"
          : r.kind === "activity"
            ? "reviewer"
            : "notes",
    );
    expect(shape).toEqual([
      "notes", "notes", "notes", "notes", "notes", "notes",
      "takeaways", "try", "reviewer", "reviewer", "reviewer",
    ]);
    for (const r of sections.slice(0, 8)) expect(r.kind).toBe("content");
    const reviewers = sections.slice(8).map((r) => r.heading);
    expect(reviewers[0]).toBe(`Practice Exercises, Lesson ${n}`);
    expect(reviewers[1]).toBe(`Worked Exam Solutions + How-to-Pass Tips, Lesson ${n}`);
    expect(reviewers[2]).toMatch(new RegExp(`^Code Lab, Lesson ${n}: `));
  });

  it("gives Try It and Code Lab a C playground with a full program", () => {
    const withIde = sections.filter((r) => r.ide);
    expect(withIde.map((r) => r.heading)).toEqual([
      sections[7].heading,
      sections[10].heading,
    ]);
    for (const r of withIde) {
      expect(r.ide).toBe("c");
      expect(r.starter).toMatch(/#include <stdio\.h>/);
      expect(r.starter).toMatch(/int main\(void\)/);
      expect(r.starter).not.toMatch(/\n$/);
    }
  });

  it("renders every body through the reader with no lint issues and no em dashes", () => {
    for (const r of sections) {
      expect(lintBody(r.body), r.heading).toEqual([]);
      expect(r.body, r.heading).not.toContain("—");
      const { container, unmount } = render(<BodyMarkdown body={r.body} />);
      expect(container.textContent?.length ?? 0).toBeGreaterThan(50);
      expect(container.innerHTML).not.toContain("**");
      unmount();
    }
  });

  it("closes the notes with five takeaways in one list", () => {
    const takeaways = sections.find((r) => r.heading === "Key Takeaways")!;
    const { container } = render(<BodyMarkdown body={takeaways.body} />);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(1);
    expect(lists[0].querySelectorAll("li")).toHaveLength(5);
  });

  it("shows its diagram as an image with alt text, in the section it explains", () => {
    const withImage = sections.filter((r) => r.body.includes("/diagrams/"));
    expect(withImage.map((r) => r.heading)).toEqual([DIAGRAM[n].section]);
    const { container } = render(<BodyMarkdown body={withImage[0].body} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    const src = imgs[0].getAttribute("src")!;
    expect(src).toBe(`/diagrams/cp2/${DIAGRAM[n].file}`);
    expect(existsSync(join(ROOT, "public", src))).toBe(true);
    expect(imgs[0].getAttribute("alt")!.length).toBeGreaterThan(80);
  });

  it("matches the migration row for row: same id, kind, heading, order, body and code", () => {
    const fromMigration = migrationRows.filter((r) => r.module === moduleId(n));
    expect(fromMigration).toEqual(sections);
  });
});

describe("CP2 Lessons 4-5 migration", () => {
  it("carries exactly the seed's modules and sections", () => {
    expect(modules(MIGRATION)).toEqual(modules(SEED));
    expect(migrationRows.map((r) => r.id).sort()).toEqual(rows.map((r) => r.id).sort());
  });
});

// The diagrams are static SVGs shown as <img>, like CP1's: no page CSS or
// theme reaches inside, so the same rules keep them usable for every reader.
describe.each(["lesson-4-struct-pointer.svg", "lesson-5-fopen-modes.svg"])("diagram %s", (file) => {
  const source = readFileSync(join(ROOT, "public", "diagrams", "cp2", file), "utf8");
  const svg = new DOMParser().parseFromString(source, "image/svg+xml")
    .documentElement as unknown as SVGSVGElement;

  it("parses and has a title and description as its accessible name", () => {
    expect(svg.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-labelledby")).toBe("title desc");
    expect(svg.querySelector("title")?.textContent?.trim().length).toBeGreaterThan(10);
    expect(svg.querySelector("desc")?.textContent?.trim().length).toBeGreaterThan(80);
  });

  it("is drawn for a phone column, with every font at 12px or more", () => {
    const [, , w, h] = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
    expect(w).toBeLessThanOrEqual(400);
    expect(Number(svg.getAttribute("width"))).toBe(w);
    expect(Number(svg.getAttribute("height"))).toBe(h);
    const sizes = [...source.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) expect(size).toBeGreaterThanOrEqual(12);
  });

  it("puts every label on a filled shape, never on the page background", () => {
    // White text on a transparent canvas vanishes in the light theme. Every
    // <text> must sit inside some <rect>.
    const rects = Array.from(svg.querySelectorAll("rect")).map((r) => ({
      x: Number(r.getAttribute("x")),
      y: Number(r.getAttribute("y")),
      w: Number(r.getAttribute("width")),
      h: Number(r.getAttribute("height")),
    }));
    for (const t of Array.from(svg.querySelectorAll("text"))) {
      const x = Number(t.getAttribute("x"));
      const y = Number(t.getAttribute("y"));
      const inside = rects.some((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
      expect(inside, t.textContent ?? "").toBe(true);
    }
  });

  it("has no full-canvas backdrop, no currentColor, and nothing executable", () => {
    const [, , w, h] = (svg.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number);
    for (const r of Array.from(svg.querySelectorAll("rect"))) {
      const covers = Number(r.getAttribute("width")) >= w - 4 && Number(r.getAttribute("height")) >= h - 4;
      expect(covers).toBe(false);
    }
    expect(source).not.toMatch(/currentColor/i);
    expect(svg.querySelectorAll("script, foreignObject, image, a")).toHaveLength(0);
    for (const el of Array.from(svg.querySelectorAll("*"))) {
      for (const attr of Array.from(el.attributes)) {
        expect(attr.name.startsWith("on")).toBe(false);
        expect(attr.value).not.toMatch(/^(https?:|javascript:|data:)/i);
      }
    }
  });
});
