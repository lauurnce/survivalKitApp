import { describe, expect, it } from "vitest";
import {
  REQUIRED_PROFILE_COLUMNS,
  profileFromRow,
  signupSchoolRow,
} from "./profileRow";

describe("REQUIRED_PROFILE_COLUMNS", () => {
  it("names every column profileFromRow reads, so the preflight can check them", () => {
    expect(REQUIRED_PROFILE_COLUMNS).toEqual([
      "first_name",
      "last_name",
      "age",
      "gender",
      "university",
      "school_type",
      "major",
      "pathways",
    ]);
  });
});

describe("profileFromRow", () => {
  const row = {
    first_name: "Juan",
    last_name: "Dela Cruz",
    age: 19,
    gender: "Male",
    university: "Polytechnic University of the Philippines",
    school_type: "Public",
    major: "BS Information Technology",
    pathways: ["Backend"],
  };

  it("maps a full row onto the profile shape", () => {
    expect(profileFromRow(row)).toEqual({
      firstName: "Juan",
      lastName: "Dela Cruz",
      age: 19,
      gender: "Male",
      university: "Polytechnic University of the Philippines",
      schoolType: "Public",
      major: "BS Information Technology",
      pathways: ["Backend"],
    });
  });

  it("carries a signup-time row through with the name still unset", () => {
    const profile = profileFromRow({
      ...row,
      first_name: null,
      last_name: null,
      age: null,
      gender: null,
      major: null,
      pathways: [],
    });
    expect(profile.firstName).toBeNull();
    expect(profile.lastName).toBeNull();
    expect(profile.university).toBe("Polytechnic University of the Philippines");
    expect(profile.schoolType).toBe("Public");
  });

  it("reads a row written before school_type existed as unspecified", () => {
    expect(profileFromRow({ ...row, school_type: null }).schoolType).toBeNull();
  });

  it("substitutes an empty pathway list for a null column", () => {
    expect(profileFromRow({ ...row, pathways: null }).pathways).toEqual([]);
  });
});

describe("signupSchoolRow", () => {
  it("writes only the user, the school and the sector", () => {
    const row = signupSchoolRow("11111111-1111-1111-1111-111111111111", {
      university: "University of Santo Tomas",
      schoolType: "Private",
    });
    expect(Object.keys(row).sort()).toEqual([
      "school_type",
      "university",
      "user_id",
    ]);
  });

  it("does not invent a name for a student who has not given one", () => {
    const row = signupSchoolRow("11111111-1111-1111-1111-111111111111", {
      university: "University of Santo Tomas",
      schoolType: "Private",
    });
    expect(row).not.toHaveProperty("first_name");
    expect(row).not.toHaveProperty("last_name");
  });

  it("keeps the values it was given", () => {
    const row = signupSchoolRow("11111111-1111-1111-1111-111111111111", {
      university: "Cavite State University",
      schoolType: "Public",
    });
    expect(row.university).toBe("Cavite State University");
    expect(row.school_type).toBe("Public");
    expect(row.user_id).toBe("11111111-1111-1111-1111-111111111111");
  });
});

describe("profileFromRow — surviving a schema that lags the code", () => {
  // getProfile selects *, so during a deploy window where a migration has not
  // been applied the row simply arrives without the new key. Losing the sector
  // is acceptable; losing the student's name, major and campus art is not.
  const preMigrationRow = {
    first_name: "Juan",
    last_name: "Dela Cruz",
    age: 19,
    gender: "Male",
    university: "Polytechnic University of the Philippines",
    major: "BS Information Technology",
    pathways: ["Backend"],
    // no school_type — the column does not exist yet
  };

  it("still returns the student's name when school_type is absent", () => {
    const profile = profileFromRow(preMigrationRow);
    expect(profile.firstName).toBe("Juan");
    expect(profile.lastName).toBe("Dela Cruz");
  });

  it("still returns the school, so the campus art survives", () => {
    expect(profileFromRow(preMigrationRow).university).toBe(
      "Polytechnic University of the Philippines"
    );
  });

  it("reports an absent school_type as null, never undefined", () => {
    // undefined would leak through Profile and read as a missing key rather
    // than an unanswered question.
    const profile = profileFromRow(preMigrationRow);
    expect(profile.schoolType).toBeNull();
    expect("schoolType" in profile).toBe(true);
  });

  it("does not throw on a row missing every optional column", () => {
    const profile = profileFromRow({ first_name: "Juan", last_name: "Cruz" });
    expect(profile).toEqual({
      firstName: "Juan",
      lastName: "Cruz",
      age: null,
      gender: null,
      university: null,
      schoolType: null,
      major: null,
      pathways: [],
    });
  });

  it("does not throw on a completely empty row", () => {
    expect(() => profileFromRow({})).not.toThrow();
    expect(profileFromRow({}).firstName).toBeNull();
  });
});
