import { describe, it, expect } from "vitest";
import { extractFacts, buildQuiz, type SectionInput } from "./generate";
import type {
  CodeBlankQuestion,
  FillBlankQuestion,
  MultiChoiceQuestion,
} from "./types";

// Representative seed-data markdown (mirrors sections.body_md in Supabase).
const SAMPLE_MD = [
  "Before writing code, plan the logic. Two common tools: **flowcharts** and **pseudocode**.",
  "",
  "### Flowcharts",
  "",
  "A flowchart is a visual representation of a solution using standardized shapes connected by arrows.",
  "",
  "| Symbol | Name | Purpose |",
  "|---|---|---|",
  "| **Oval** | Terminal | Marks start or stop |",
  "",
  "**Three fundamental control structures:**",
  "",
  "**1. Sequential** — steps execute one after another in order.",
  "",
  "**Syntax errors** — violations of the grammar rules of the language.",
  "",
  "```c",
  "#include <stdio.h>",
  "int main(void) {",
  '    printf("Hello, world!\\n");',
  "    return 0;",
  "}",
  "```",
].join("\n");

const section = (
  bodyMd: string,
  moduleTitle = "Module A",
  subjectTitle = "Subject A",
): SectionInput => ({ bodyMd, subjectTitle, moduleTitle });

describe("extractFacts — bold-term facts", () => {
  const facts = extractFacts(SAMPLE_MD);
  const terms = facts.terms.map((t) => t.term);

  it("captures bold terms with their containing sentence", () => {
    expect(terms).toContain("flowcharts");
    expect(terms).toContain("pseudocode");
    const flow = facts.terms.find((t) => t.term === "flowcharts")!;
    expect(flow.sentence).toContain("Two common tools");
    // The stored sentence is cleaned of bold markers.
    expect(flow.sentence).not.toContain("**");
  });

  it("captures em-dash definitional lines", () => {
    const syn = facts.terms.find((t) => t.term === "Syntax errors");
    expect(syn).toBeDefined();
    expect(syn!.sentence).toContain("violations of the grammar rules");
  });

  it("strips leading numbering from bold terms", () => {
    expect(terms).toContain("Sequential");
    expect(terms).not.toContain("1. Sequential");
  });

  it("skips header-like bold terms ending in a colon", () => {
    expect(
      terms.find((t) => t.includes("Three fundamental control structures")),
    ).toBeUndefined();
  });

  it("skips bold terms inside markdown tables", () => {
    expect(terms).not.toContain("Oval");
  });

  it("skips bold terms in headings and blockquotes", () => {
    const md = [
      "## **Heading Term** is here",
      "> **Quoted term** — should be ignored.",
      "A normal sentence defines **recursion** as a function calling itself.",
    ].join("\n");
    const got = extractFacts(md).terms.map((t) => t.term);
    expect(got).toEqual(["recursion"]);
  });

  it("skips terms that are too short, purely numeric, or too long", () => {
    const md = [
      "The value **42** is skipped and so is **ab** here.",
      "A very long bold span like **this entire bolded phrase is far too long to be a term at all** is skipped.",
      "But **CPU** counts because it has three characters.",
    ].join("\n");
    const got = extractFacts(md).terms.map((t) => t.term);
    expect(got).toEqual(["CPU"]);
  });

  it("returns nothing for empty or fact-free markdown", () => {
    expect(extractFacts("").terms).toEqual([]);
    expect(extractFacts("Just a plain sentence.").terms).toEqual([]);
  });
});

describe("extractFacts — code facts", () => {
  it("captures fenced blocks that have a language tag", () => {
    const { codeBlocks } = extractFacts(SAMPLE_MD);
    expect(codeBlocks).toHaveLength(1);
    expect(codeBlocks[0].language).toBe("c");
    expect(codeBlocks[0].code).toContain("printf");
    expect(codeBlocks[0].code).not.toContain("```");
  });

  it("ignores plain ``` blocks (pseudocode diagrams)", () => {
    const md = ["```", "START", "  read x", "END", "```"].join("\n");
    expect(extractFacts(md).codeBlocks).toEqual([]);
  });

  it("does not treat code content as sentence material", () => {
    const md = ["```python", "x = 1  # **bold** in code", "y = 2", "```"].join(
      "\n",
    );
    const facts = extractFacts(md);
    expect(facts.terms).toEqual([]);
    expect(facts.codeBlocks).toHaveLength(1);
  });

  it("skips blocks shorter than 2 lines or longer than 15 lines", () => {
    const oneLiner = ["```c", "int x = 0;", "```"].join("\n");
    expect(extractFacts(oneLiner).codeBlocks).toEqual([]);

    const long = [
      "```c",
      ...Array.from({ length: 16 }, (_, i) => `int v${i} = ${i};`),
      "```",
    ].join("\n");
    expect(extractFacts(long).codeBlocks).toEqual([]);
  });
});

describe("buildQuiz", () => {
  const sections = [section(SAMPLE_MD)];

  it("is deterministic for the same seed and input", () => {
    const a = buildQuiz(sections, { count: 10, seed: 42 });
    const b = buildQuiz(sections, { count: 10, seed: 42 });
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("produces a different arrangement for a different seed", () => {
    const a = buildQuiz(sections, { count: 10, seed: 1 });
    const b = buildQuiz(sections, { count: 10, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it("caps the number of questions at opts.count", () => {
    expect(buildQuiz(sections, { count: 2, seed: 7 })).toHaveLength(2);
  });

  it("never repeats an answer across questions", () => {
    const qs = buildQuiz(sections, { count: 10, seed: 3 });
    const answers = qs.map((q) =>
      q.kind === "multi-choice"
        ? q.options[q.answerIndex].toLowerCase()
        : q.answer.toLowerCase(),
    );
    expect(new Set(answers).size).toBe(answers.length);
  });

  it("attaches the source context to every question", () => {
    const qs = buildQuiz(
      [section(SAMPLE_MD, "Programming Basics", "Intro to Computing")],
      { count: 10, seed: 5 },
    );
    for (const q of qs) {
      expect(q.context).toEqual({
        subjectTitle: "Intro to Computing",
        moduleTitle: "Programming Basics",
      });
    }
  });

  it("returns an empty array when there is no material", () => {
    expect(buildQuiz([], { count: 10, seed: 1 })).toEqual([]);
    expect(buildQuiz([section("No facts here.")], { count: 10, seed: 1 })).toEqual(
      [],
    );
  });

  describe("fill-blank questions", () => {
    it("never asks the student to type a term containing symbols", () => {
      // "true = any non-zero value" is a valid bold term but untypeable.
      const md = "In C, **true = any non-zero value**, false = 0.";
      for (const seed of [1, 2, 3, 4, 5]) {
        const qs = buildQuiz([section(md)], { count: 5, seed });
        expect(qs.some((q) => q.kind === "fill-blank")).toBe(false);
      }
    });

    it("strips leading list markers from prompts", () => {
      const md = "- **Source code** — the human-readable text of a program.";
      const qs = buildQuiz([section(md)], { count: 5, seed: 1 });
      expect(qs.length).toBeGreaterThan(0);
      for (const q of qs) {
        if (q.kind !== "code-blank") {
          expect(q.prompt.startsWith("- ")).toBe(false);
          expect(q.prompt).toContain("_____");
        }
      }
    });

    it("blanks every occurrence of the answer and leaves no markers", () => {
      const qs = buildQuiz(sections, { count: 10, seed: 11 });
      const fills = qs.filter(
        (q): q is FillBlankQuestion => q.kind === "fill-blank",
      );
      expect(fills.length).toBeGreaterThan(0);
      for (const q of fills) {
        expect(q.prompt).toContain("_____");
        expect(q.prompt.toLowerCase()).not.toContain(q.answer.toLowerCase());
        expect(q.prompt).not.toContain("**");
      }
    });
  });

  describe("multi-choice questions", () => {
    it("has 4 distinct options with a correct answerIndex", () => {
      // Force multi-choice by seeding a pool with many terms.
      const md = [
        "A **compiler** translates the whole program at once.",
        "An **interpreter** executes code line by line.",
        "An **assembler** converts assembly into machine code.",
        "A **linker** combines object files into an executable.",
        "A **debugger** helps find and fix defects.",
        "A **loader** places programs into memory.",
      ].join("\n\n");
      const qs = buildQuiz([section(md)], { count: 12, seed: 9 });
      const mcs = qs.filter(
        (q): q is MultiChoiceQuestion => q.kind === "multi-choice",
      );
      expect(mcs.length).toBeGreaterThan(0);
      for (const q of mcs) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map((o) => o.toLowerCase())).size).toBe(4);
        expect(q.answerIndex).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex).toBeLessThan(4);
        // The prompt must not leak the answer.
        expect(q.prompt.toLowerCase()).not.toContain(
          q.options[q.answerIndex].toLowerCase(),
        );
      }
    });

    it("is not generated when fewer than 4 unique terms exist", () => {
      const md = [
        "A **stack** is last-in first-out.",
        "A **queue** is first-in first-out.",
        "A **deque** allows both ends.",
      ].join("\n\n");
      const qs = buildQuiz([section(md)], { count: 10, seed: 4 });
      expect(qs.some((q) => q.kind === "multi-choice")).toBe(false);
      expect(qs.length).toBeGreaterThan(0);
    });
  });

  describe("code-blank questions", () => {
    it("blanks one meaningful token of length >= 3", () => {
      const qs = buildQuiz(sections, { count: 10, seed: 21 });
      const codes = qs.filter(
        (q): q is CodeBlankQuestion => q.kind === "code-blank",
      );
      expect(codes.length).toBeGreaterThan(0);
      for (const q of codes) {
        expect(q.language).toBe("c");
        expect(q.promptCode).toContain("_____");
        expect(q.answer.length).toBeGreaterThanOrEqual(3);
        expect(q.answer).toMatch(/^[A-Za-z_][A-Za-z0-9_]*$/);
        // Restoring the answer at the blank reproduces the original block.
        const restored = q.promptCode.replace("_____", q.answer);
        expect(extractFacts(SAMPLE_MD).codeBlocks[0].code).toBe(restored);
      }
    });

    it("never blanks words inside trailing comments", () => {
      const md = [
        "```c",
        "int total = 0;",
        "total = total + 1; // then we print the total value",
        "```",
      ].join("\n");
      for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
        const qs = buildQuiz([section(md)], { count: 5, seed });
        for (const q of qs.filter(
          (x): x is CodeBlankQuestion => x.kind === "code-blank",
        )) {
          expect(["int", "total"]).toContain(q.answer);
        }
      }
    });

    it("skips blocks whose only candidates are one-off arbitrary identifiers", () => {
      // "ch1" appears once and is not a keyword — an unguessable blank.
      const md = ["```c", "x = -1;", "ch1 = 'A';", "```"].join("\n");
      const qs = buildQuiz([section(md)], { count: 5, seed: 3 });
      expect(qs.some((q) => q.kind === "code-blank")).toBe(false);
    });

    it("never blanks tokens on comment lines", () => {
      const md = [
        "```python",
        "# initialize the counter variable",
        "count = 0",
        "count = count + 1",
        "```",
      ].join("\n");
      const qs = buildQuiz([section(md)], { count: 5, seed: 2 });
      const codes = qs.filter(
        (q): q is CodeBlankQuestion => q.kind === "code-blank",
      );
      expect(codes.length).toBeGreaterThan(0);
      for (const q of codes) {
        expect(["count"]).toContain(q.answer);
      }
    });
  });

  it("mixes question kinds when material for each exists", () => {
    const qs = buildQuiz(sections, { count: 10, seed: 8 });
    const kinds = new Set(qs.map((q) => q.kind));
    expect(kinds.has("code-blank")).toBe(true);
    expect(kinds.has("fill-blank")).toBe(true);
  });
});
