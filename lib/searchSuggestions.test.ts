import { describe, it, expect } from "vitest";
import { popularKeywords } from "./searchSuggestions";

describe("popularKeywords", () => {
  const titles = [
    { title: "Data Structures and Algorithms" },
    { title: "Advanced Data Structures" },
    { title: "Data Structures Lab" },
    { title: "Networking Fundamentals" },
    { title: "Object-Oriented Programming" },
    { title: "Programming Logic and Design" },
  ];

  it("ranks keywords by how many distinct titles contain them", () => {
    const result = popularKeywords(titles, 3);
    expect(result[0]).toBe("Data");
    expect(result[1]).toBe("Structures");
    expect(result).toHaveLength(3);
  });

  it("counts a keyword once per title even if repeated", () => {
    const result = popularKeywords(
      [{ title: "Data Data Data Management" }, { title: "Big Data" }],
      5,
    );
    expect(result.filter((k) => k.toLowerCase() === "data")).toHaveLength(1);
  });

  it("filters stopwords, noise words, and short tokens", () => {
    const result = popularKeywords(
      [
        { title: "The Module 1: Introduction to Computing" },
        { title: "Unit III — Discrete Mathematics" },
      ],
      10,
    );
    const lower = result.map((k) => k.toLowerCase());
    expect(lower).not.toContain("the");
    expect(lower).not.toContain("module");
    expect(lower).not.toContain("unit");
    expect(lower).toContain("discrete");
    expect(lower).toContain("mathematics");
  });

  it("returns at most limit suggestions", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      title: `Topic${i} Studies`,
    }));
    expect(popularKeywords(many, 8)).toHaveLength(8);
  });

  it("returns empty for no titles", () => {
    expect(popularKeywords([])).toEqual([]);
  });
});
