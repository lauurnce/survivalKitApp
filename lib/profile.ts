// Profile types + validation (pure — no IO). Lists must stay in sync with the
// check constraints in supabase/migrations/20260706000000_profiles.sql,
// 20260821010000_profiles_school_type.sql and
// 20260826000000_profiles_context_fields.sql.

import { canonicalProgram, canonicalUniversity } from "./academicPrograms";
import { SECTORS, type Sector } from "./universities";

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

export const DEVICES = ["Laptop", "Desktop PC", "Tablet", "Smartphone", "None yet"] as const;
export type Device = (typeof DEVICES)[number];

export const LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C++",
  "C#",
  "PHP",
  "SQL",
  "HTML/CSS",
  "Kotlin",
  "Swift",
  "Go",
  "Rust",
  "Dart",
  "None yet",
] as const;
export type Language = (typeof LANGUAGES)[number];

export const BACKGROUNDS = [
  "TVL / ICT strand",
  "STEM strand",
  "Other SHS strand",
  "ALS completer",
  "Career shifter",
  "Zero knowledge",
] as const;
export type Background = (typeof BACKGROUNDS)[number];

export interface Profile {
  // Null until the student fills in the profile form. A row can be created at
  // signup, which asks for the school but not the name — see
  // supabase/migrations/20260821010000_profiles_school_type.sql.
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  gender: Gender | null;
  university: string | null;
  schoolType: Sector | null;
  major: string | null;
  pathways: Pathway[];
  devices: Device[];
  languages: Language[];
  background: Background | null;
  itReason: string | null;
  careerGoal: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  // Set by the row (column default now()), never by the form. validateProfile
  // emits null here; the store keeps the value the row already carries.
  createdAt: string | null;
}

export interface RawProfileInput {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  university: string;
  schoolType: string;
  major: string;
  pathways: string[];
  devices: string[];
  languages: string[];
  background: string;
  itReason: string;
  careerGoal: string;
  githubUrl: string;
  portfolioUrl: string;
}

export type ValidateResult =
  | { ok: true; profile: Profile }
  | { ok: false; error: string };

function optionalText(
  raw: string,
  label: string,
  max: number,
  canonicalize?: (value: string) => string,
): { value: string | null } | { error: string } {
  const v = raw.trim();
  if (!v) return { value: null };
  const canonical = canonicalize ? canonicalize(v) : v;
  if (canonical.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  return { value: canonical };
}

function optionalUrl(raw: string, label: string): { value: string | null } | { error: string } {
  const v = raw.trim();
  if (!v) return { value: null };
  if (!v.startsWith("https://") || v.length > 200) {
    return {
      error: `${label} link must start with https:// and be 200 characters or fewer.`,
    };
  }
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

  const university = optionalText(input.university, "University", 120, canonicalUniversity);
  if ("error" in university) return { ok: false, error: university.error };

  let schoolType: Sector | null = null;
  if (input.schoolType) {
    if (!(SECTORS as readonly string[]).includes(input.schoolType)) {
      return { ok: false, error: "Invalid school type option." };
    }
    schoolType = input.schoolType as Sector;
  }

  const major = optionalText(input.major, "Major", 120, canonicalProgram);
  if ("error" in major) return { ok: false, error: major.error };

  const pathways: Pathway[] = [];
  for (const p of input.pathways) {
    if (!(PATHWAYS as readonly string[]).includes(p)) {
      return { ok: false, error: "Invalid pathway selection." };
    }
    if (!pathways.includes(p as Pathway)) pathways.push(p as Pathway);
  }

  const devices: Device[] = [];
  for (const d of input.devices) {
    if (!(DEVICES as readonly string[]).includes(d)) {
      return { ok: false, error: "Invalid device selection." };
    }
    if (!devices.includes(d as Device)) devices.push(d as Device);
  }

  const languages: Language[] = [];
  for (const l of input.languages) {
    if (!(LANGUAGES as readonly string[]).includes(l)) {
      return { ok: false, error: "Invalid language selection." };
    }
    if (!languages.includes(l as Language)) languages.push(l as Language);
  }

  let background: Background | null = null;
  if (input.background.trim()) {
    const b = input.background.trim();
    if (!(BACKGROUNDS as readonly string[]).includes(b)) {
      return { ok: false, error: "Invalid background option." };
    }
    background = b as Background;
  }

  const itReason = optionalText(input.itReason, "IT reason", 280);
  if ("error" in itReason) return { ok: false, error: itReason.error };

  const careerGoal = optionalText(input.careerGoal, "Career goal", 120);
  if ("error" in careerGoal) return { ok: false, error: careerGoal.error };

  const githubUrl = optionalUrl(input.githubUrl, "GitHub");
  if ("error" in githubUrl) return { ok: false, error: githubUrl.error };

  const portfolioUrl = optionalUrl(input.portfolioUrl, "Portfolio");
  if ("error" in portfolioUrl) return { ok: false, error: portfolioUrl.error };

  return {
    ok: true,
    profile: {
      firstName,
      lastName,
      age,
      gender,
      university: university.value,
      schoolType,
      major: major.value,
      pathways,
      devices,
      languages,
      background,
      itReason: itReason.value,
      careerGoal: careerGoal.value,
      githubUrl: githubUrl.value,
      portfolioUrl: portfolioUrl.value,
      createdAt: null,
    },
  };
}

export interface RawSignupSchool {
  university: string;
  schoolType: string;
}

export type SignupSchoolResult =
  | { ok: true; university: string; schoolType: Sector }
  | { ok: false; error: string };

/**
 * Validates the two school answers signup requires. Unlike validateProfile,
 * where both are optional, neither may be blank here.
 *
 * The sector is taken as the student gave it, even when it disagrees with the
 * catalog: the catalog supplies a default in the form, not a correction on
 * submit. Campuses reorganise, and the student is the one standing on theirs.
 */
export function validateSignupSchool(input: RawSignupSchool): SignupSchoolResult {
  const typed = input.university.trim();
  if (!typed) {
    return { ok: false, error: "Choose your school so we can set up your campus." };
  }
  const university = canonicalUniversity(typed);
  if (university.length > 120) {
    return { ok: false, error: "School name must be 120 characters or fewer." };
  }

  if (!input.schoolType) {
    return { ok: false, error: "Tell us whether your school is public or private." };
  }
  if (!(SECTORS as readonly string[]).includes(input.schoolType)) {
    return { ok: false, error: "Choose either Public or Private for your school." };
  }

  return { ok: true, university, schoolType: input.schoolType as Sector };
}
