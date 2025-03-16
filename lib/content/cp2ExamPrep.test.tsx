// @vitest-environment jsdom
// CP2 Exam Prep: Prelims & Finals, rewritten for Lessons 1-7. The seed rows
// (the repo source of truth) checked for shape and gating, every body
// rendered through the reader's own markdown component and the content
// linter, and the migration cross-checked against the seed byte for byte.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMarkdown } from "@/components/BodyMarkdown";
import { lintBody } from "@/scripts/content/lintMath";

const ROOT = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const SEED = read("supabase/seeds/cp2_exam_prep_module.sql");
const MIGRATION = read("supabase/migrations/20261101001300_cp2_exam_prep.sql");
const MODULE = "a3000001-0001-0002-0001-0000000000e1";

interface Row {
  id: string;
  kind: string;
  heading: string;
  body: string;
  sort: number;
  starter: string | null;
}

const ROW =
  /values \('([0-9a-f-]{36})', 'a3000001-0001-0002-0001-0000000000e1', '(content|activity)', '((?:[^']|'')*)', \$md\$\n([\s\S]*?)\n\$md\$, (\d+), (?:null, null|'c', \$code\$([\s\S]*?)\$code\$)\)\non conflict \(id\) do update set/g;

const parse = (sql: string): Row[] =>
  [...sql.matchAll(ROW)].map((m) => ({
    id: m[1],
    kind: m[2],
    heading: m[3].replace(/''/g, "'"),
    body: m[4],
    sort: Number(m[5]),
    starter: m[6] ?? null,
  }));

const rows = parse(SEED);

describe("CP2 exam prep seed", () => {
  it("parses every section statement, ten in order", () => {
    expect(rows).toHaveLength((SEED.match(/insert into public\.sections/g) ?? []).length);
    expect(rows.map((r) => r.sort)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("keeps the module last and never deletes", () => {
    expect(SEED).toContain(`values ('${MODULE}', '10000000-0001-0002-0001-000000000001', 'Exam Prep: Prelims & Finals', 'exam-prep-prelims-finals', 99)`);
    for (const sql of [SEED, MIGRATION]) {
      const statements = sql.replace(/\$(md|code)\$[\s\S]*?\$\1\$/g, "").replace(/^--.*$/gm, "");
      expect(statements).not.toMatch(/\b(delete|truncate|drop)\b/i);
    }
  });

  it("gives away the blueprint and practice set, and gates the rest", () => {
    expect(rows.filter((r) => r.kind === "content").map((r) => r.sort)).toEqual([1, 2]);
  });

  it("has prelim and final mocks with an answer key for each term", () => {
    expect(rows.map((r) => r.heading)).toEqual([
      "Prelim Exam Blueprint & Study Plan",
      "Free Practice Set, 15 Items with Answer Key",
      "Prelim Mock Exam A, 25 Items",
      "Prelim Mock Exam B, 25 Items",
      "Prelim Mock Exams, Answer Key with Explanations",
      "Common CP2 Traps & How to Avoid Them",
      "Final Exam Blueprint & Rapid Review Sheet",
      "Final Mock Exam A, 25 Items",
      "Final Mock Exam B, 25 Items",
      "Final Mock Exams, Answer Key with Explanations",
    ]);
  });

  it("covers the seven lessons, not the retired Unit 1", () => {
    const all = rows.map((r) => r.body).join("\n");
    expect(all).not.toMatch(/\bUnit \d/);
    expect(all).not.toMatch(/will expand/i);
    for (const n of [1, 2, 3, 4, 5, 6, 7]) expect(all).toContain(`Lesson ${n}`);
  });

  it("gives the traps section a full C program", () => {
    const withIde = rows.filter((r) => r.starter !== null);
    expect(withIde.map((r) => r.sort)).toEqual([6]);
    expect(withIde[0].starter).toMatch(/#include <stdio\.h>/);
    expect(withIde[0].starter).toMatch(/int main\(void\)/);
  });

  it("renders every body through the reader with no lint issues and no em dashes", () => {
    for (const r of rows) {
      expect(lintBody(r.body), r.heading).toEqual([]);
      expect(r.body + r.heading, r.heading).not.toMatch(/[—–]/);
      expect(r.body, r.heading).not.toMatch(/conio\.h|getch\(/);
      const { container, unmount } = render(<BodyMarkdown body={r.body} />);
      expect(container.textContent?.length ?? 0).toBeGreaterThan(500);
      expect(container.innerHTML).not.toContain("**");
      unmount();
    }
  });
});

describe("migration 20261101001300_cp2_exam_prep", () => {
  it("upserts exactly the seed's rows under the production ids", () => {
    expect(parse(MIGRATION)).toEqual(rows);
    expect(new Set(rows.map((r) => r.id)).size).toBe(10);
  });
});
