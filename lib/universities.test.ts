import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";
import { UNIVERSITIES, matchUniversity, universityImagePath } from "./universities";

describe("UNIVERSITIES catalog", () => {
  it("has exactly 25 entries", () => {
    expect(UNIVERSITIES).toHaveLength(25);
  });

  it("every entry has a unique slug", () => {
    const slugs = UNIVERSITIES.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every entry's image file exists in public/university-landmarks", () => {
    for (const u of UNIVERSITIES) {
      const file = path.join(process.cwd(), "public", "university-landmarks", `${u.slug}.png`);
      expect(existsSync(file), `missing image for ${u.slug}`).toBe(true);
    }
  });

  it("the default fallback image exists", () => {
    const file = path.join(process.cwd(), "public", "university-landmarks", "default.png");
    expect(existsSync(file)).toBe(true);
  });
});

describe("matchUniversity", () => {
  it("matches exact canonical name", () => {
    const result = matchUniversity("University of Santo Tomas");
    expect(result?.slug).toBe("ust");
  });

  it("matches case-insensitively", () => {
    const result = matchUniversity("university of santo tomas");
    expect(result?.slug).toBe("ust");
  });

  it("matches with surrounding whitespace trimmed", () => {
    const result = matchUniversity("  University of Santo Tomas  ");
    expect(result?.slug).toBe("ust");
  });

  it("matches a known alias in any casing", () => {
    const result = matchUniversity("ust");
    expect(result?.slug).toBe("ust");
  });

  it("matches De La Salle University via alias 'La Salle'", () => {
    const result = matchUniversity("la salle");
    expect(result?.slug).toBe("dlsu");
  });

  it("returns null for an unmatched free-text school", () => {
    expect(matchUniversity("Cavite State University")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(matchUniversity("")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(matchUniversity(null)).toBeNull();
  });

  it("returns null for whitespace-only input", () => {
    expect(matchUniversity("   ")).toBeNull();
  });
});

describe("universityImagePath", () => {
  it("returns the matched school's image path", () => {
    expect(universityImagePath("University of Santo Tomas")).toBe(
      "/university-landmarks/ust.png"
    );
  });

  it("returns the default image path for unmatched input", () => {
    expect(universityImagePath("Cavite State University")).toBe(
      "/university-landmarks/default.png"
    );
  });

  it("returns the default image path for null input", () => {
    expect(universityImagePath(null)).toBe("/university-landmarks/default.png");
  });
});
