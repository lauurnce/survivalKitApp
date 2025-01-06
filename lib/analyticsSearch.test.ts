import { describe, it, expect } from "vitest";
import { SEARCH_QUERY_MAX, isSearchEventType, normalizeSearchQuery } from "./analyticsSearch";

describe("normalizeSearchQuery", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeSearchQuery("  SQL\t  Joins\n ")).toBe("sql joins");
  });

  it("returns null for blank or non-string input", () => {
    expect(normalizeSearchQuery("   ")).toBeNull();
    expect(normalizeSearchQuery("")).toBeNull();
    expect(normalizeSearchQuery(undefined)).toBeNull();
    expect(normalizeSearchQuery(42)).toBeNull();
    expect(normalizeSearchQuery({ q: "sql" })).toBeNull();
  });

  it(`caps the stored query at ${SEARCH_QUERY_MAX} characters`, () => {
    const result = normalizeSearchQuery("a".repeat(300));
    expect(result).toHaveLength(SEARCH_QUERY_MAX);
  });

  it("does not leave a trailing space where the cap cuts a word gap", () => {
    const result = normalizeSearchQuery(`${"a".repeat(SEARCH_QUERY_MAX - 1)} bcd`);
    expect(result).toBe("a".repeat(SEARCH_QUERY_MAX - 1));
  });

  it("redacts email addresses", () => {
    expect(normalizeSearchQuery("Juan.Dela@School.edu.ph arrays")).toBe("[email] arrays");
  });

  it("redacts long digit runs such as phone and student numbers", () => {
    expect(normalizeSearchQuery("0917 123 4567")).toBe("[number]");
    expect(normalizeSearchQuery("2021-00123-mn-0 grades")).toBe("[number]-mn-0 grades");
  });

  it("keeps short numbers that are part of real topics", () => {
    expect(normalizeSearchQuery("CP1")).toBe("cp1");
    expect(normalizeSearchQuery("ipv4 2024")).toBe("ipv4 2024");
  });

  it("drops control characters and folds full-width text", () => {
    expect(normalizeSearchQuery("ＳＱＬ\u0000join")).toBe("sql join");
  });
});

describe("isSearchEventType", () => {
  it("recognises exactly the three search events", () => {
    expect(isSearchEventType("search_query")).toBe(true);
    expect(isSearchEventType("search_no_results")).toBe(true);
    expect(isSearchEventType("search_result_click")).toBe(true);
    expect(isSearchEventType("module_open")).toBe(false);
  });
});
