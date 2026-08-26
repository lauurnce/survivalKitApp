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
    devices: [],
    languages: [],
    background: "",
    itReason: "",
    careerGoal: "",
    githubUrl: "",
    portfolioUrl: "",
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
        devices: [],
        languages: [],
        background: null,
        itReason: null,
        careerGoal: null,
        githubUrl: null,
        portfolioUrl: null,
        createdAt: null,
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

describe("validateProfile — who they really are", () => {
  it("accepts a fully filled profile with every context field set", () => {
    const result = validateProfile(
      raw({
        devices: ["Laptop", "Smartphone"],
        languages: ["Python", "C"],
        background: "TVL / ICT strand",
        itReason: "I want to build things people use.",
        careerGoal: "Backend developer",
        githubUrl: "https://github.com/juandelacruz",
        portfolioUrl: "https://juandelacruz.dev",
      })
    );
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
        devices: ["Laptop", "Smartphone"],
        languages: ["Python", "C"],
        background: "TVL / ICT strand",
        itReason: "I want to build things people use.",
        careerGoal: "Backend developer",
        githubUrl: "https://github.com/juandelacruz",
        portfolioUrl: "https://juandelacruz.dev",
        createdAt: null,
      },
    });
  });

  it("rejects a device outside the fixed list", () => {
    expect(validateProfile(raw({ devices: ["Mainframe"] }))).toEqual({
      ok: false,
      error: "Invalid device selection.",
    });
  });

  it("rejects a language outside the fixed list", () => {
    expect(validateProfile(raw({ languages: ["Brainfuck"] }))).toEqual({
      ok: false,
      error: "Invalid language selection.",
    });
  });

  it("rejects a background outside the fixed list", () => {
    expect(validateProfile(raw({ background: "Trust fund" }))).toEqual({
      ok: false,
      error: "Invalid background option.",
    });
  });

  it("dedupes repeated devices and languages, preserving order", () => {
    const result = validateProfile(
      raw({ devices: ["Laptop", "Tablet", "Laptop"], languages: ["Python", "Go", "Python"] })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.devices).toEqual(["Laptop", "Tablet"]);
      expect(result.profile.languages).toEqual(["Python", "Go"]);
    }
  });

  it("nulls whitespace-only text fields instead of storing blank answers", () => {
    const result = validateProfile(
      raw({
        background: "   ",
        itReason: "   ",
        careerGoal: "\t\n",
        githubUrl: "",
        portfolioUrl: "   ",
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.background).toBeNull();
      expect(result.profile.itReason).toBeNull();
      expect(result.profile.careerGoal).toBeNull();
      expect(result.profile.githubUrl).toBeNull();
      expect(result.profile.portfolioUrl).toBeNull();
    }
  });

  it("trims the context text fields it keeps", () => {
    const result = validateProfile(
      raw({
        background: "  Career shifter  ",
        itReason: "  Curiosity.  ",
        careerGoal: "  Ship real software.  ",
        githubUrl: "  https://github.com/juan  ",
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.profile.background).toBe("Career shifter");
      expect(result.profile.itReason).toBe("Curiosity.");
      expect(result.profile.careerGoal).toBe("Ship real software.");
      expect(result.profile.githubUrl).toBe("https://github.com/juan");
    }
  });

  it("rejects links that do not start with https://", () => {
    expect(validateProfile(raw({ githubUrl: "http://github.com/juan" }))).toEqual({
      ok: false,
      error: "GitHub link must start with https:// and be 200 characters or fewer.",
    });
    expect(validateProfile(raw({ portfolioUrl: "github.com/juan" }))).toEqual({
      ok: false,
      error: "Portfolio link must start with https:// and be 200 characters or fewer.",
    });
  });

  it("rejects links and text over their length caps", () => {
    // 201 chars total, still one over the cap even though it starts https://
    const longLink = `https://${"x".repeat(193)}`;
    expect(longLink.length).toBe(201);
    expect(validateProfile(raw({ githubUrl: longLink })).ok).toBe(false);
    expect(validateProfile(raw({ portfolioUrl: longLink })).ok).toBe(false);
    expect(validateProfile(raw({ itReason: "x".repeat(281) })).ok).toBe(false);
    expect(validateProfile(raw({ careerGoal: "x".repeat(121) })).ok).toBe(false);
  });

  it("accepts values exactly at their length caps", () => {
    const capLink = `https://${"x".repeat(192)}`;
    expect(capLink.length).toBe(200);
    const result = validateProfile(
      raw({
        itReason: "x".repeat(280),
        careerGoal: "x".repeat(120),
        githubUrl: capLink,
        portfolioUrl: capLink,
      })
    );
    expect(result.ok).toBe(true);
  });
});
