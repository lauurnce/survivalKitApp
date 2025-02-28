// The CP2 study guides in content/modules: the subject map
// (Computer Programming 2.md) and the three lesson guides it points to. Each
// one is checked against the seed rows, the repo source of truth, so the
// guides cannot fall behind the lessons again.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const DIR = "content/modules/1st year/2nd sem";
const MAP = read(`${DIR}/Computer Programming 2.md`);

const moduleId = (n: number) => `a3000001-0001-0002-0001-00000000000${n}`;
const TITLES = [
  "Lesson 1: Arrays in Depth",
  "Lesson 2: Strings and Character Arrays",
  "Lesson 3: Pointers",
  "Lesson 4: Structures",
  "Lesson 5: File Handling",
  "Lesson 6: Recursion",
  "Lesson 7: Searching and Sorting",
];

interface Row {
  module: string;
  heading: string;
  body: string;
}

// Matches both seed spellings: "('id', 'module', ..." and "('id','module',...".
const ROW =
  /\('[0-9a-f-]{36}',\s*'([0-9a-f-]{36})',\s*'(?:content|activity)',\s*'((?:[^']|'')*)',\s*\$md\$\n([\s\S]*?)\n\$md\$/g;
const rows = (seed: string): Row[] =>
  [...read(`supabase/seeds/${seed}`).matchAll(ROW)].map((m) => ({
    module: m[1],
    heading: m[2].replace(/''/g, "'"),
    body: m[3].trim(),
  }));

const GUIDES: { file: string; seeds: string[]; lessons: number[] }[] = [
  { file: "Computer_Programming_2_units_1-3.md", seeds: ["cp2_modules_sections.sql", "cp2_units_2_3.sql"], lessons: [1, 2, 3] },
  { file: "Computer_Programming_2_units_4-5.md", seeds: ["cp2_units_4_5.sql"], lessons: [4, 5] },
  { file: "Computer_Programming_2_units_6-7.md", seeds: ["cp2_units_6_7.sql"], lessons: [6, 7] },
];
const all = GUIDES.flatMap((g) => g.seeds.flatMap(rows));

describe("CP2 subject map (Computer Programming 2.md)", () => {
  it("no longer carries the retired Unit 1 guide", () => {
    expect(MAP).not.toMatch(/\bUnit \d/);
    expect(MAP).not.toContain("conio.h");
  });

  it("names every lesson and every companion guide", () => {
    for (const t of TITLES) expect(MAP).toContain(t);
    for (const g of GUIDES) expect(MAP).toContain(`\`${g.file}\``);
  });

  it("repeats each lesson's Key Takeaways exactly as the lesson has them", () => {
    TITLES.forEach((title, i) => {
      const kt = all.find((r) => r.module === moduleId(i + 1) && r.heading === "Key Takeaways");
      expect(kt, title).toBeDefined();
      expect(MAP).toContain(`## ${title}\n\n${kt!.body}\n`);
    });
  });

  it("lists every note section of every lesson", () => {
    for (const r of all) {
      if (/^(Key Takeaways|Try It|Practice Exercises|Worked Exam|Code Lab|Output Tracing)/.test(r.heading)) continue;
      expect(MAP).toContain(`- ${r.heading}\n`);
    }
  });
});

describe.each(GUIDES)("$file", ({ file, seeds, lessons }) => {
  const guide = read(`${DIR}/${file}`);
  const seedRows = seeds.flatMap(rows);

  it("has every section the site has, word for word", () => {
    expect(seedRows.length).toBeGreaterThan(0);
    for (const r of seedRows) expect(guide).toContain(`## ${r.heading}\n\n${r.body}`);
  });

  it("covers exactly its lessons and points back to the map", () => {
    for (const n of lessons) expect(guide).toContain(`# ${TITLES[n - 1]}\n`);
    expect(guide).toContain("`Computer Programming 2.md` is the map");
  });
});
