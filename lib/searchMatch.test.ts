import { describe, expect, it } from "vitest";
import { MAX_RESULTS, scoreItem, searchItems, tokenize, type Searchable } from "./searchMatch";

const subject = (title: string, context = "1st Year"): Searchable => ({ type: "subject", title, context });
const mod = (title: string, context: string): Searchable => ({ type: "module", title, context });

describe("tokenize", () => {
  it("lowercases, splits on whitespace and trims punctuation", () => {
    expect(tokenize("  SQL,   Join! ")).toEqual(["sql", "join"]);
  });

  it("keeps language names like C++ and C#", () => {
    expect(tokenize("c++ c#")).toEqual(["c++", "c#"]);
  });

  it("expands known abbreviations", () => {
    expect(tokenize("CP1 loops")).toEqual(["computer", "programming", "1", "loops"]);
  });

  it("returns nothing for an all-space query", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("scoreItem", () => {
  it("is 0 when any word is missing", () => {
    expect(scoreItem(mod("SQL Joins", "Databases"), ["sql", "trigger"])).toBe(0);
  });

  it("ranks a title hit above a context hit", () => {
    const inTitle = scoreItem(mod("Arrays", "CP1"), ["arrays"]);
    const inContext = scoreItem(mod("Lesson 4", "Arrays unit"), ["arrays"]);
    expect(inTitle).toBeGreaterThan(inContext);
  });
});

describe("searchItems", () => {
  const items = [
    mod("Lesson 2: Introduction to C", "1st Year · Computer Programming 1"),
    subject("Computer Programming 1"),
    mod("SQL Joins", "2nd Year · Database Systems"),
  ];

  it("finds a module by words split across title and context", () => {
    expect(searchItems(items, "programming introduction").map((i) => i.title)).toEqual([
      "Lesson 2: Introduction to C",
    ]);
  });

  it("puts the subject before its modules on an equal match", () => {
    expect(searchItems(items, "cp1").map((i) => i.title)).toEqual([
      "Computer Programming 1",
      "Lesson 2: Introduction to C",
    ]);
  });

  it("caps the result list", () => {
    const many = Array.from({ length: MAX_RESULTS + 10 }, (_, i) => mod(`Topic ${i}`, "x"));
    expect(searchItems(many, "topic")).toHaveLength(MAX_RESULTS);
  });
});
