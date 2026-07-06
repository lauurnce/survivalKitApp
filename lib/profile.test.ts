import { describe, expect, it } from "vitest";
import { validateProfile, type RawProfileInput } from "./profile";

function raw(overrides: Partial<RawProfileInput> = {}): RawProfileInput {
  return {
    firstName: "Juan",
    lastName: "Dela Cruz",
    age: "",
    gender: "",
    university: "",
    major: "",
    pathways: [],
    ...overrides,
  };
}

describe("validateProfile", () => {
  it("accepts a minimal profile (names only) and nulls the optionals", () => {
    const result = validateProfile(raw());
    expect(result).toEqual({
      ok: true,
      profile: {
        firstName: "Juan",
        lastName: "Dela Cruz",
        age: null,
        gender: null,
        university: null,
        major: null,
        pathways: [],
      },
    });
  });

  it("accepts a fully filled profile", () => {
    const result = validateProfile(
      raw({
        age: "19",
        gender: "Male",
        university: "Cavite State University",
        major: "BSIT",
        pathways: ["Frontend", "Cybersecurity"],
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.age).toBe(19);
      expect(result.profile.gender).toBe("Male");
      expect(result.profile.pathways).toEqual(["Frontend", "Cybersecurity"]);
    }
  });

  it("trims whitespace on all text fields", () => {
    const result = validateProfile(
      raw({ firstName: "  Juan ", lastName: " Dela Cruz ", university: "  CvSU  " })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.firstName).toBe("Juan");
      expect(result.profile.lastName).toBe("Dela Cruz");
      expect(result.profile.university).toBe("CvSU");
    }
  });

  it("requires both names", () => {
    expect(validateProfile(raw({ firstName: "" })).ok).toBe(false);
    expect(validateProfile(raw({ lastName: "   " })).ok).toBe(false);
  });

  it("rejects names over 60 characters", () => {
    expect(validateProfile(raw({ firstName: "x".repeat(61) })).ok).toBe(false);
  });

  it("enforces age bounds and integer-ness", () => {
    expect(validateProfile(raw({ age: "12" })).ok).toBe(false);
    expect(validateProfile(raw({ age: "101" })).ok).toBe(false);
    expect(validateProfile(raw({ age: "19.5" })).ok).toBe(false);
    expect(validateProfile(raw({ age: "abc" })).ok).toBe(false);
    expect(validateProfile(raw({ age: "13" })).ok).toBe(true);
    expect(validateProfile(raw({ age: "100" })).ok).toBe(true);
  });

  it("rejects gender values outside the fixed list", () => {
    expect(validateProfile(raw({ gender: "Robot" })).ok).toBe(false);
    expect(validateProfile(raw({ gender: "Prefer not to say" })).ok).toBe(true);
  });

  it("rejects unknown pathways", () => {
    expect(validateProfile(raw({ pathways: ["Blockchain"] })).ok).toBe(false);
  });

  it("dedupes repeated pathways", () => {
    const result = validateProfile(raw({ pathways: ["Data", "Data"] }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profile.pathways).toEqual(["Data"]);
  });

  it("rejects university/major over 120 characters", () => {
    expect(validateProfile(raw({ university: "x".repeat(121) })).ok).toBe(false);
    expect(validateProfile(raw({ major: "x".repeat(121) })).ok).toBe(false);
  });
});
