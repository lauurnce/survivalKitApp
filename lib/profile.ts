// Profile types + validation (pure — no IO). Lists must stay in sync with the
// check constraints in supabase/migrations/20260706000000_profiles.sql.

export const PATHWAYS = [
  "Data",
  "AI / Machine Learning",
  "UI/UX Design",
  "Frontend",
  "Backend",
  "Full Stack",
  "Cybersecurity",
  "Networking",
  "Cloud Computing",
  "DevOps",
  "Mobile Development",
  "Game Development",
  "QA / Testing",
  "Database Administration",
  "IT Support",
  "Tech Entrepreneurship",
] as const;
export type Pathway = (typeof PATHWAYS)[number];

export const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
export type Gender = (typeof GENDERS)[number];

export interface Profile {
  firstName: string;
  lastName: string;
  age: number | null;
  gender: Gender | null;
  university: string | null;
  major: string | null;
  pathways: Pathway[];
}

export interface RawProfileInput {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  university: string;
  major: string;
  pathways: string[];
}

export type ValidateResult =
  | { ok: true; profile: Profile }
  | { ok: false; error: string };

function optionalText(raw: string, label: string, max: number):
  | { value: string | null }
  | { error: string } {
  const v = raw.trim();
  if (!v) return { value: null };
  if (v.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  return { value: v };
}

export function validateProfile(input: RawProfileInput): ValidateResult {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) {
    return { ok: false, error: "First and last name are required." };
  }
  if (firstName.length > 60 || lastName.length > 60) {
    return { ok: false, error: "Names must be 60 characters or fewer." };
  }

  let age: number | null = null;
  if (input.age.trim()) {
    const n = Number(input.age.trim());
    if (!Number.isInteger(n) || n < 13 || n > 100) {
      return { ok: false, error: "Age must be a whole number between 13 and 100." };
    }
    age = n;
  }

  let gender: Gender | null = null;
  if (input.gender) {
    if (!(GENDERS as readonly string[]).includes(input.gender)) {
      return { ok: false, error: "Invalid gender option." };
    }
    gender = input.gender as Gender;
  }

  const university = optionalText(input.university, "University", 120);
  if ("error" in university) return { ok: false, error: university.error };
  const major = optionalText(input.major, "Major", 120);
  if ("error" in major) return { ok: false, error: major.error };

  const pathways: Pathway[] = [];
  for (const p of input.pathways) {
    if (!(PATHWAYS as readonly string[]).includes(p)) {
      return { ok: false, error: "Invalid pathway selection." };
    }
    if (!pathways.includes(p as Pathway)) pathways.push(p as Pathway);
  }

  return {
    ok: true,
    profile: {
      firstName,
      lastName,
      age,
      gender,
      university: university.value,
      major: major.value,
      pathways,
    },
  };
}
