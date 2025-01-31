// @vitest-environment jsdom
// CP2 Lessons 1-3 (Arrays in Depth, Strings and Character Arrays, Pointers):
// the section structure of each lesson, checked in the seeds (the repo source
// of truth), every body rendered through the reader's own markdown component
// and the content linter, and the production migration cross-checked against
// the seeds row by row.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMarkdown } from "@/components/BodyMarkdown";
import { lintBody } from "@/scripts/content/lintMath";
import { pickFreeActivities } from "@/lib/freeSample";

const ROOT = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const SEED_L1 = read("supabase/seeds/cp2_modules_sections.sql");
const SEED_L23 = read("supabase/seeds/cp2_units_2_3.sql");
const EXAM_SEED = read("supabase/seeds/cp2_exam_prep_module.sql");
const MIGRATION = read("supabase/migrations/20261101001000_cp2_units_1_3.sql");

const moduleId = (n: number) => `a3000001-0001-0002-0001-00000000000${n}`;
const EXAM_ID = "a3000001-0001-0002-0001-0000000000e1";
const TITLES: Record<number, string> = {
  1: "Lesson 1: Arrays in Depth",
  2: "Lesson 2: Strings and Character Arrays",
  3: "Lesson 3: Pointers",
};

// The production ids of the 11 rows Unit 1 had before this change. Lesson 1
// rewrites them in place, so every one must still be there.
const UNIT1_PROD_IDS = [
  "9138ee20-21db-47bc-8f0f-aa5e7d5ad6ba",
  "cab8b50f-c709-4359-9013-39d4c619bf0a",
  "826655d5-2deb-44cd-b24c-55a97aea9601",
  "97673d3f-e063-4cc7-96a2-7f9a279f8526",
  "954aac16-2cbf-4c3c-b5f2-1e8162ba9bdc",
  "6594930a-f6ff-400f-a6a4-c7628f8c4d91",
  "01addedc-aa4b-4409-b99b-c00f5cbb7a8e",
  "80a6339b-05cf-42e6-a646-97619cb9f199",
  "036925f9-aa99-4af0-88a4-50ece0c44f5a",
  "39acd3e1-e416-4201-98d8-0853b81398af",
  "2c4624c1-ee88-4f58-a442-106626c76ac8",
];

interface Row {
  id: string;
  module: string;
  kind: "content" | "activity";
  heading: string;
  body: string;
  sort: number;
  ide: string | null;
  starter: string | null;
}

// Matches both row styles: the seed's ('id','module',...) and the
// migration's ('id', 'module', ...).
const ROW =
  /\('([0-9a-f-]{36})',\s?'(a3000001-0001-0002-0001-00000000000[123])',\s?'(content|activity)',\s?'((?:[^']|'')*)',\s?\$md\$([\s\S]*?)\$md\$, (\d+), (?:NULL|null|'([a-z]+)'), (?:NULL|null|\$code\$([\s\S]*?)\$code\$)\)/g;
function parse(sql: string): Row[] {
  return [...sql.matchAll(ROW)].map((m) => ({
    id: m[1],
    module: m[2],
    kind: m[3] as Row["kind"],
    heading: m[4].replace(/''/g, "'"),
    body: m[5],
    sort: Number(m[6]),
    ide: m[7] ?? null,
    starter: m[8] ?? null,
  }));
}
const seedRows = [...parse(SEED_L1), ...parse(SEED_L23)];
const migRows = parse(MIGRATION);
const lesson = (n: number) =>
  seedRows.filter((r) => r.module === moduleId(n)).sort((a, b) => a.sort - b.sort);

const DIAGRAM_SECTION: Record<number, string> = {
  1: "Two-Dimensional Arrays",
  2: "Strings in C: Character Arrays with a Null Terminator",
  3: "Pointer Variables and the * Operator",
};

const role = (r: Row) =>
  r.heading === "Key Takeaways"
    ? "takeaways"
    : r.heading.startsWith("Try It:")
      ? "try"
      : r.kind === "activity"
        ? "reviewer"
        : "notes";

describe("CP2 modules", () => {
  it("titles Lessons 1-3 'Lesson N: Topic' with N equal to sort_order, in the seeds and the migration", () => {
    for (const n of [1, 2, 3]) {
      const seed = n === 1 ? SEED_L1 : SEED_L23;
      expect(seed).toMatch(new RegExp(`'${moduleId(n)}',\\s?'10000000-0001-0002-0001-000000000001',\\s?'${TITLES[n]}',\\s?'lesson-${n}-[a-z-]+',\\s?${n}\\)`));
      expect(MIGRATION).toMatch(new RegExp(`'${moduleId(n)}', '10000000-0001-0002-0001-000000000001', '${TITLES[n]}', 'lesson-${n}-[a-z-]+', ${n}\\)`));
    }
    expect(SEED_L1).not.toContain("Unit 1: Arrays");
  });

  it("keeps Exam Prep last at sort_order 99", () => {
    expect(EXAM_SEED).toContain("'Exam Prep: Prelims & Finals','exam-prep-prelims-finals',99);");
    expect(MIGRATION).toMatch(new RegExp(`set sort_order = 99\\s+where id = '${EXAM_ID}'`));
  });

  it("keeps Lesson 1's reviewers as the free sample and locks Lessons 2-3", () => {
    const activities = seedRows
      .filter((r) => r.kind === "activity")
      .map((r) => ({ id: r.id, module_id: r.module, sort_order: r.sort }));
    const free = pickFreeActivities([moduleId(1), moduleId(2), moduleId(3), EXAM_ID], activities);
    expect(free.sort()).toEqual(lesson(1).filter((r) => r.kind === "activity").map((r) => r.id).sort());
    expect(free).toHaveLength(4);
  });
});

describe.each([1, 2, 3])("CP2 Lesson %i", (n) => {
  const sections = lesson(n);

  it("has fixed ids: Unit 1's production ids kept, new rows on the a3000002 pattern", () => {
    const ids = sections.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    if (n === 1) {
      expect(ids.filter((id) => UNIT1_PROD_IDS.includes(id)).sort()).toEqual([...UNIT1_PROD_IDS].sort());
      const added = sections.filter((r) => !UNIT1_PROD_IDS.includes(r.id));
      expect(added.map((r) => [r.id, r.heading])).toEqual([["a3000002-0001-0002-0001-000000000001", "Key Takeaways"]]);
    } else {
      for (const r of sections) {
        expect(r.id).toBe(`a3000002-0001-0002-000${n}-${String(r.sort).padStart(12, "0")}`);
      }
    }
  });

  it("orders notes, Key Takeaways, Try It, then the reviewers, like CP1", () => {
    const order = sections.map(role);
    const notes = order.filter((o) => o === "notes").length;
    expect(notes).toBeGreaterThanOrEqual(4);
    expect(notes).toBeLessThanOrEqual(6);
    const reviewers = n === 1 ? 4 : 3;
    expect(order).toEqual([
      ...Array(notes).fill("notes"),
      "takeaways",
      "try",
      ...Array(reviewers).fill("reviewer"),
    ]);
    expect(sections.map((r) => r.sort)).toEqual(sections.map((_, i) => i + 1));
  });

  it("gates by kind: notes, Key Takeaways and Try It are free content, reviewers are activity", () => {
    for (const r of sections) {
      expect(r.kind).toBe(role(r) === "reviewer" ? "activity" : "content");
    }
  });

  it("names the reviewers exactly as CP1 does", () => {
    const reviewers = sections.filter((r) => r.kind === "activity").map((r) => r.heading);
    expect(reviewers[0]).toBe(`Practice Exercises, Lesson ${n}`);
    expect(reviewers[1]).toBe(`Worked Exam Solutions + How-to-Pass Tips, Lesson ${n}`);
    expect(reviewers[2]).toMatch(new RegExp(`^Code Lab, Lesson ${n}: \\S`));
    if (n === 1) expect(reviewers[3]).toBe("Output Tracing Drills, Lesson 1");
  });

  it("gives Try It and Code Lab a C playground with starter code, and nothing else", () => {
    for (const r of sections) {
      const playground = r.heading.startsWith("Try It:") || r.heading.startsWith("Code Lab,");
      expect(r.ide).toBe(playground ? "c" : null);
      if (playground) expect(r.starter).toMatch(/int main\(void\)/);
      else expect(r.starter).toBeNull();
    }
  });

  it("renders every body through the reader with no broken markup and no em dashes", () => {
    for (const r of sections) {
      expect(lintBody(r.body), r.heading).toEqual([]);
      expect(r.body, r.heading).not.toContain("—");
      const { container, unmount } = render(<BodyMarkdown body={r.body} />);
      expect(container.textContent!.length).toBeGreaterThan(40);
      unmount();
    }
  });

  it("closes the notes with a Key Takeaways list of exactly 5 points", () => {
    const takeaways = sections.find((r) => r.heading === "Key Takeaways")!;
    const { container } = render(<BodyMarkdown body={takeaways.body} />);
    const lists = container.querySelectorAll("ul");
    expect(lists).toHaveLength(1);
    expect(lists[0].querySelectorAll("li")).toHaveLength(5);
  });

  it("shows its diagram as an image with alt text, in the section it explains", () => {
    const withImage = sections.filter((r) => r.body.includes("/diagrams/cp2/"));
    expect(withImage.map((r) => r.heading)).toEqual([DIAGRAM_SECTION[n]]);
    const { container } = render(<BodyMarkdown body={withImage[0].body} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    const src = imgs[0].getAttribute("src")!;
    expect(src).toMatch(new RegExp(`^/diagrams/cp2/lesson-${n}-[a-z0-9-]+\\.svg$`));
    expect(existsSync(join(ROOT, "public", src))).toBe(true);
    expect(imgs[0].getAttribute("alt")!.length).toBeGreaterThan(80);
  });

  it("matches the migration row for row: same ids, kinds, headings, bodies, order and playgrounds", () => {
    const mig = migRows.filter((r) => r.module === moduleId(n)).sort((a, b) => a.sort - b.sort);
    expect(mig).toEqual(sections);
  });
});

describe("CP2 Lessons 1-3 migration", () => {
  it("only upserts: no deletes, every section insert resolves conflicts by id", () => {
    expect(MIGRATION).not.toMatch(/^\s*delete\b/im);
    expect(MIGRATION).not.toMatch(/\btruncate\b/i);
    const inserts = MIGRATION.match(/insert into public\.sections/g) ?? [];
    const conflicts = MIGRATION.match(/on conflict \(id\) do update set/g) ?? [];
    expect(inserts).toHaveLength(3);
    expect(conflicts).toHaveLength(4); // three section upserts + the modules upsert
  });

  it("touches no rows outside Lessons 1-3 and Exam Prep's sort order", () => {
    expect(migRows).toHaveLength(seedRows.length);
    const ids = MIGRATION.match(/a3000001-0001-0002-0001-[0-9a-f]{12}/g) ?? [];
    expect(new Set(ids)).toEqual(new Set([moduleId(1), moduleId(2), moduleId(3), EXAM_ID]));
  });
});
