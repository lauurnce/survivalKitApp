import { describe, expect, it } from "vitest";
import { validateProfile, validateSignupSchool, type RawProfileInput } from "./profile";

function raw(overrides: Partial<RawProfileInput> = {}): RawProfileInput {
  return {
    firstName: "Juan",
    lastName: "Dela Cruz",
    age: "",
    gender: "",
    university: "",
    schoolType: "",
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
        schoolType: null,
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

describe("validateSignupSchool", () => {
  it("accepts a catalog school and its sector", () => {
    expect(
      validateSignupSchool({ university: "University of Santo Tomas", schoolType: "Private" })
    ).toEqual({ ok: true, university: "University of Santo Tomas", schoolType: "Private" });
  });

  it("canonicalises an acronym to the catalog name", () => {
    const result = validateSignupSchool({ university: "PUP", schoolType: "Public" });
    expect(result).toEqual({
      ok: true,
      university: "Polytechnic University of the Philippines",
      schoolType: "Public",
    });
  });

  it("keeps a school outside the catalog exactly as typed, trimmed", () => {
    const result = validateSignupSchool({
      university: "  Cavite State University  ",
      schoolType: "Public",
    });
    expect(result).toEqual({
      ok: true,
      university: "Cavite State University",
      schoolType: "Public",
    });
  });

  it("does not take the student's word for a sector that contradicts the catalog", () => {
    // We store what they said; the catalog is a default, not an override.
    const result = validateSignupSchool({ university: "UST", schoolType: "Public" });
    expect(result).toEqual({
      ok: true,
      university: "University of Santo Tomas",
      schoolType: "Public",
    });
  });

  it("rejects a missing school", () => {
    const result = validateSignupSchool({ university: "", schoolType: "Public" });
    expect(result).toEqual({
      ok: false,
      error: "Choose your school so we can set up your campus.",
    });
  });

  it("rejects a whitespace-only school", () => {
    const result = validateSignupSchool({ university: "   ", schoolType: "Public" });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing sector", () => {
    const result = validateSignupSchool({ university: "PUP", schoolType: "" });
    expect(result).toEqual({
      ok: false,
      error: "Tell us whether your school is public or private.",
    });
  });

  it("rejects a sector outside the two we store", () => {
    const result = validateSignupSchool({ university: "PUP", schoolType: "State" });
    expect(result.ok).toBe(false);
  });

  it("rejects a sector in the wrong case, rather than quietly fixing it", () => {
    // The database CHECK is case-sensitive; accepting 'public' here would
    // push the failure down to a constraint violation on insert.
    const result = validateSignupSchool({ university: "PUP", schoolType: "public" });
    expect(result.ok).toBe(false);
  });

  it("rejects a school name too long for the column", () => {
    const result = validateSignupSchool({
      university: "x".repeat(121),
      schoolType: "Public",
    });
    expect(result.ok).toBe(false);
  });

  it("complains about the missing school before the missing sector", () => {
    const result = validateSignupSchool({ university: "", schoolType: "" });
    expect(result).toEqual({
      ok: false,
      error: "Choose your school so we can set up your campus.",
    });
  });
});

describe("validateProfile — school type", () => {
  it("nulls the school type when it is not given", () => {
    const result = validateProfile(raw());
    expect(result.ok && result.profile.schoolType).toBe(null);
  });

  it("keeps a valid school type", () => {
    const result = validateProfile(raw({ university: "PUP", schoolType: "Public" }));
    expect(result.ok && result.profile.schoolType).toBe("Public");
  });

  it("rejects an unknown school type", () => {
    const result = validateProfile(raw({ schoolType: "State" }));
    expect(result).toEqual({ ok: false, error: "Invalid school type option." });
  });
});
