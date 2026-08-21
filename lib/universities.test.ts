import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";
import {
  UNIVERSITIES,
  matchUniversity,
  searchUniversities,
  universityImagePath,
  landmarkLabel,
} from "./universities";

describe("UNIVERSITIES catalog", () => {
  it("has exactly 25 entries", () => {
    expect(UNIVERSITIES).toHaveLength(50);
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

describe("UNIVERSITIES catalog — expansion", () => {
  it("has exactly 50 entries after the expansion", () => {
    expect(UNIVERSITIES).toHaveLength(50);
  });

  it("still has all unique slugs", () => {
    const slugs = UNIVERSITIES.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("tca has a distinct canonical name from usjr (no collision)", () => {
    const usjr = UNIVERSITIES.find((u) => u.slug === "usjr");
    const tca = UNIVERSITIES.find((u) => u.slug === "tca");
    expect(usjr?.name).toBe("University of San Jose–Recoletos");
    expect(tca?.name).toBe("University of San Jose–Recoletos – Talavera Campus");
    expect(usjr?.name).not.toBe(tca?.name);
  });

  it("every new entry's image file exists in public/university-landmarks", () => {
    const newSlugs = [
      "bisu", "norsu", "asu", "ssu", "isatu", "evsu", "uc", "hnu", "lnu", "vsu",
      "siascc", "tca", "uep", "ndu", "fsuu", "jrmsu", "zppsu", "usm", "ldcu",
      "xu", "addu", "adzu", "cmu", "sksu", "msugensan",
    ];
    for (const slug of newSlugs) {
      const file = path.join(process.cwd(), "public", "university-landmarks", `${slug}.png`);
      expect(existsSync(file), `missing image for ${slug}`).toBe(true);
    }
  });
});

describe("matchUniversity — expansion", () => {
  it("matches a new school by exact canonical name", () => {
    expect(matchUniversity("Bohol Island State University")?.slug).toBe("bisu");
  });

  it("matches tca specifically, not usjr, for its distinct name", () => {
    expect(matchUniversity("University of San Jose–Recoletos – Talavera Campus")?.slug).toBe("tca");
  });

  it("matching the plain USJR name still resolves to usjr, not tca", () => {
    expect(matchUniversity("University of San Jose–Recoletos")?.slug).toBe("usjr");
  });
});

describe("landmarkLabel", () => {
  it("returns the specific landmark name when present", () => {
    const bisu = UNIVERSITIES.find((u) => u.slug === "bisu")!;
    expect(landmarkLabel(bisu)).toBe("BISU Main Admin Building");
  });

  it("falls back to the school name when no landmark is set (original 25 entries)", () => {
    const ust = UNIVERSITIES.find((u) => u.slug === "ust")!;
    expect(landmarkLabel(ust)).toBe("University of Santo Tomas");
  });

  it("returns a generic label when given null", () => {
    expect(landmarkLabel(null)).toBe("Campus building");
  });
});

describe("UNIVERSITIES catalog — sector", () => {
  it("every entry declares a sector", () => {
    for (const u of UNIVERSITIES) {
      expect(["Public", "Private"], `bad sector for ${u.slug}`).toContain(u.sector);
    }
  });

  it("classifies state universities as Public", () => {
    const bySlug = (slug: string) => UNIVERSITIES.find((u) => u.slug === slug)?.sector;
    expect(bySlug("pup")).toBe("Public");
    expect(bySlug("up")).toBe("Public");
    expect(bySlug("msuiit")).toBe("Public");
  });

  it("classifies a city-funded local university as Public", () => {
    expect(UNIVERSITIES.find((u) => u.slug === "plm")?.sector).toBe("Public");
  });

  it("classifies sectarian and family-owned schools as Private", () => {
    const bySlug = (slug: string) => UNIVERSITIES.find((u) => u.slug === slug)?.sector;
    expect(bySlug("ust")).toBe("Private");
    expect(bySlug("dlsu")).toBe("Private");
    expect(bySlug("uc")).toBe("Private");
  });
});

describe("searchUniversities", () => {
  it("returns the whole catalog for an empty query", () => {
    expect(searchUniversities("")).toHaveLength(50);
  });

  it("returns the whole catalog for a whitespace-only query", () => {
    expect(searchUniversities("   ")).toHaveLength(50);
  });

  it("matches on a substring of the canonical name, case-insensitively", () => {
    const hits = searchUniversities("santo tomas");
    expect(hits.map((u) => u.slug)).toEqual(["ust"]);
  });

  it("matches on an acronym alias the canonical name does not contain", () => {
    expect(searchUniversities("PUP").map((u) => u.slug)).toContain("pup");
  });

  it("matches a hyphenated alias", () => {
    expect(searchUniversities("MSU-IIT").map((u) => u.slug)).toContain("msuiit");
  });

  it("returns each school at most once when name and alias both match", () => {
    const hits = searchUniversities("Adamson");
    expect(hits.filter((u) => u.slug === "adamson")).toHaveLength(1);
  });

  it("returns nothing for a school outside the catalog", () => {
    expect(searchUniversities("Cavite State University")).toEqual([]);
  });

  it("preserves catalog order", () => {
    const hits = searchUniversities("university");
    const order = UNIVERSITIES.filter((u) => hits.includes(u));
    expect(hits).toEqual(order);
  });
});
