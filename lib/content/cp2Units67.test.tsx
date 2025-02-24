// @vitest-environment jsdom
// CP2 Lesson 6 (Recursion) and Lesson 7 (Searching and Sorting): the module
// rows, the section order and gating, every body rendered through the
// reader's own markdown component and the content linter, the diagrams, and
// the migration that carries the same rows to production.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMarkdown } from "@/components/BodyMarkdown";
import { lintBody } from "@/scripts/content/lintMath";

const ROOT = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const SEED = read("supabase/seeds/cp2_units_6_7.sql");
const MIGRATION = read("supabase/migrations/20261101001200_cp2_units_6_7.sql");
const GUIDE = read("content/modules/1st year/2nd sem/Computer_Programming_2_units_6-7.md");

const SUBJECT = "10000000-0001-0002-0001-000000000001";
const moduleId = (n: number) => `a3000001-0001-0002-0001-00000000000${n}`;
const sectionId = (n: number, ss: number) =>
  `a3000002-0001-0002-00${String(n).padStart(2, "0")}-0000000000${String(ss).padStart(2, "0")}`;

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
  /\('(a3000002-[0-9a-f-]{27})','(a3000001-[0-9a-f-]{27})','(content|activity)','((?:[^']|'')*)',\$md\$([\s\S]*?)\$md\$, (\d+), (?:'(\w+)', \$code\$([\s\S]*?)\$code\$|null, null)\)/g;
const parseRows = (sql: string): Row[] =>
  [...sql.matchAll(ROW)].map((m) => ({
    id: m[1],
    module: m[2],
    kind: m[3] as Row["kind"],
    heading: m[4],
    body: m[5],
    sort: Number(m[6]),
    ide: m[7],
    starter: m[8],
  }));
const MODULE_ROW = /\('(a3000001-[0-9a-f-]{27})','([0-9a-f-]{36})','([^']+)','([a-z0-9-]+)',(\d+)\)/g;
const parseModules = (sql: string) =>
  [...sql.matchAll(MODULE_ROW)].map((m) => ({ id: m[1], subject: m[2], title: m[3], slug: m[4], sort: Number(m[5]) }));

const rows = parseRows(SEED);
const lesson = (n: number) => rows.filter((r) => r.module === moduleId(n)).sort((a, b) => a.sort - b.sort);

const LESSONS = [
  { n: 6, title: "Lesson 6: Recursion", slug: "lesson-6-recursion", diagram: "Tracing the Call Stack" },
  {
    n: 7,
    title: "Lesson 7: Searching and Sorting",
    slug: "lesson-7-searching-and-sorting",
    diagram: "Bubble Sort",
  },
];

describe("CP2 Lessons 6-7 modules", () => {
  it("declares both modules under CP2 with fixed ids, Lesson titles and sort orders 6 and 7", () => {
    expect(parseModules(SEED)).toEqual(
      LESSONS.map((l) => ({ id: moduleId(l.n), subject: SUBJECT, title: l.title, slug: l.slug, sort: l.n })),
    );
  });

  it("parses every section row in the seed", () => {
    expect(rows.length).toBe((SEED.match(/'a3000002-/g) ?? []).length);
    expect(rows.length).toBe(21);
  });
});

describe.each(LESSONS)("CP2 $title", ({ n, diagram }) => {
  const sections = lesson(n);

  it("uses fixed section ids numbered by sort order", () => {
    sections.forEach((r, i) => {
      expect(r.id).toBe(sectionId(n, i + 1));
      expect(r.sort).toBe(i + 1);
    });
  });

  it("orders 4 to 6 notes, then Key Takeaways, then Try It, then the three reviewers", () => {
    const notes = sections.filter((r) => r.kind === "content" && r.heading !== "Key Takeaways" && !r.heading.startsWith("Try It:"));
    expect(notes.length).toBeGreaterThanOrEqual(4);
    expect(notes.length).toBeLessThanOrEqual(6);
    const tail = sections.slice(notes.length).map((r) => [r.kind, r.heading.replace(/: .*$/, "")]);
    expect(tail).toEqual([
      ["content", "Key Takeaways"],
      ["content", "Try It"],
      ["activity", `Practice Exercises, Lesson ${n}`],
      ["activity", `Worked Exam Solutions + How-to-Pass Tips, Lesson ${n}`],
      ["activity", `Code Lab, Lesson ${n}`],
    ]);
    expect(sections.slice(0, notes.length)).toEqual(notes);
  });

  it("gives Try It and Code Lab a C playground that has a main()", () => {
    const ide = sections.filter((r) => r.ide);
    expect(ide.map((r) => r.heading.split(/[,:]/)[0])).toEqual(["Try It", "Code Lab"]);
    for (const r of ide) {
      expect(r.ide).toBe("c");
      expect(r.starter).toContain("#include <stdio.h>");
      expect(r.starter).toContain("int main(void)");
    }
  });

  it("renders every body with no lint issues and no em dashes", () => {
    for (const r of sections) {
      expect(lintBody(r.body), r.heading).toEqual([]);
      const { container } = render(<BodyMarkdown body={r.body} />);
      expect(container.textContent!.length, r.heading).toBeGreaterThan(80);
      expect(r.body, r.heading).not.toContain("—");
      expect(r.heading).not.toContain("—");
    }
  });

  it("closes the notes with one list of five takeaways", () => {
    const body = sections.find((r) => r.heading === "Key Takeaways")!.body;
    const { container } = render(<BodyMarkdown body={body} />);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(1);
    expect(lists[0].querySelectorAll("li")).toHaveLength(5);
  });

  it("shows one diagram, with alt text, in the section it explains", () => {
    const withImage = sections.filter((r) => r.body.includes("/diagrams/cp2/"));
    expect(withImage.map((r) => r.heading)).toEqual([diagram]);
    const { container } = render(<BodyMarkdown body={withImage[0].body} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    const src = imgs[0].getAttribute("src")!;
    expect(src).toMatch(new RegExp(`^/diagrams/cp2/lesson-${n}-[a-z0-9-]+\\.svg$`));
    const svg = readFileSync(join(ROOT, "public", src), "utf8");
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<title id="title">[^<]+<\/title>/);
    expect(svg).toMatch(/<desc id="desc">[^<]{80,}<\/desc>/);
    expect(svg).toContain('viewBox="-2 -2 364 ');
    expect(imgs[0].getAttribute("alt")!.length).toBeGreaterThan(80);
  });

  it("is in the study guide, heading by heading", () => {
    for (const r of sections) expect(GUIDE).toContain(`## ${r.heading}\n${r.body}`);
  });
});

describe("migration 20261101001200_cp2_units_6_7", () => {
  it("upserts exactly the seed's modules and sections, byte for byte", () => {
    expect(parseModules(MIGRATION)).toEqual(parseModules(SEED));
    expect(parseRows(MIGRATION)).toEqual(rows);
  });

  it("is idempotent and deletes nothing", () => {
    const sql = MIGRATION.replace(/^--.*$/gm, "");
    expect(sql).not.toMatch(/\bdelete\b/i);
    expect(sql).not.toMatch(/\btruncate\b/i);
    expect(sql.match(/on conflict \(id\) do update/gi)).toHaveLength(3);
    expect(MIGRATION).toContain("INSERT INTO public.modules");
    expect(MIGRATION).toContain("INSERT INTO public.sections");
  });

  it("references only diagrams that ship in public/", () => {
    for (const m of MIGRATION.matchAll(/\]\((\/diagrams\/[^)]+)\)/g)) {
      expect(existsSync(join(ROOT, "public", m[1]))).toBe(true);
    }
  });
});
