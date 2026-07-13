import { describe, expect, it } from "vitest";
import { findLandmark, landmarkArt, FALLBACK_LANDMARK_IMAGE } from "./landmarks";

describe("findLandmark", () => {
  it("matches the canonical school name exactly", () => {
    expect(findLandmark("Polytechnic University of the Philippines")?.slug).toBe("pup");
  });
  it("is case/whitespace/punctuation insensitive", () => {
    expect(findLandmark("  polytechnic university of the philippines. ")?.slug).toBe("pup");
  });
  it("matches common abbreviations via aliases", () => {
    expect(findLandmark("PUP")?.slug).toBe("pup");
    expect(findLandmark("UP Diliman")?.slug).toBe("up");
    expect(findLandmark("UST")?.slug).toBe("ust");
  });
  it("never resolves PUP's full name to UP despite the substring overlap", () => {
    // "Polytechnic University of the Philippines" CONTAINS "University of the Philippines"
    expect(findLandmark("Polytechnic University of the Philippines - Sta. Mesa")?.slug).toBe("pup");
  });
  it("matches campus-suffixed variants by containment", () => {
    expect(findLandmark("University of Santo Tomas Manila")?.slug).toBe("ust");
  });
  it("returns null for unknown, empty, and null input", () => {
    expect(findLandmark("Westmead International School")?.slug).toBe("westmead");
    expect(findLandmark("Some Unknown College")).toBeNull();
    expect(findLandmark("")).toBeNull();
    expect(findLandmark(null)).toBeNull();
    expect(findLandmark(undefined)).toBeNull();
  });
  it("does not let generic aliases steal unrelated institutions", () => {
    expect(findLandmark("Ateneo de Davao University")).toBeNull();
    expect(findLandmark("La Salle Green Hills")).toBeNull();
  });
});

describe("landmarkArt", () => {
  it("falls back to the generic campus art when no school matched", () => {
    expect(landmarkArt(null)).toEqual({ src: FALLBACK_LANDMARK_IMAGE, label: "Campus building" });
  });
  it("falls back when the school has no uploaded art yet", () => {
    const l = findLandmark("Catanduanes State University");
    expect(landmarkArt(l).src).toBe(FALLBACK_LANDMARK_IMAGE);
  });
  it("uses the school's image once set", () => {
    expect(
      landmarkArt({ slug: "x", school: "X U", landmark: "X Tower", aliases: [], image: "/landmarks/x.png" }),
    ).toEqual({ src: "/landmarks/x.png", label: "X Tower" });
  });
});
