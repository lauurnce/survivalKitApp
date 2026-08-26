// Row <-> Profile mapping for the `profiles` table (pure — no IO), kept out of
// profileStore so the shape can be tested without a database.
//
// The read path deliberately does NOT pin a column list. A hardcoded
// `select("first_name,...,school_type,...")` fails the WHOLE query with a 400
// when any one column is missing, so a migration that has not been applied
// yet takes the student's name, major and campus art down with the column
// that is actually absent. Selecting * and mapping defensively costs a few
// unused bytes and turns that outage into one missing field.
//
// Tolerant reads are a safety net, not a licence to deploy ahead of a
// migration: writes cannot degrade the same way (you cannot upsert into a
// column that does not exist), which is what scripts/db/schema-check.ts is
// for.

import type {
  Background,
  Device,
  Gender,
  Language,
  Pathway,
  Profile,
} from "./profile";
import type { Sector } from "./universities";

/**
 * The columns this code needs `profiles` to have. Not used to build the
 * select — it is the contract the schema preflight checks before a deploy.
 */
export const REQUIRED_PROFILE_COLUMNS = [
  "first_name",
  "last_name",
  "age",
  "gender",
  "university",
  "school_type",
  "major",
  "pathways",
  "devices",
  "languages",
  "background",
  "it_reason",
  "career_goal",
  "github_url",
  "portfolio_url",
  "created_at",
] as const;

/** Every field optional: a lagging schema simply omits the key. */
export interface ProfileRow {
  first_name?: string | null;
  last_name?: string | null;
  age?: number | null;
  gender?: string | null;
  university?: string | null;
  school_type?: string | null;
  major?: string | null;
  pathways?: string[] | null;
  devices?: string[] | null;
  languages?: string[] | null;
  background?: string | null;
  it_reason?: string | null;
  career_goal?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  created_at?: string | null;
}

export function profileFromRow(row: ProfileRow): Profile {
  return {
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    age: row.age ?? null,
    gender: (row.gender ?? null) as Gender | null,
    university: row.university ?? null,
    schoolType: (row.school_type ?? null) as Sector | null,
    major: row.major ?? null,
    pathways: (row.pathways ?? []) as Pathway[],
    devices: (row.devices ?? []) as Device[],
    languages: (row.languages ?? []) as Language[],
    background: (row.background ?? null) as Background | null,
    itReason: row.it_reason ?? null,
    careerGoal: row.career_goal ?? null,
    githubUrl: row.github_url ?? null,
    portfolioUrl: row.portfolio_url ?? null,
    createdAt: row.created_at ?? null,
  };
}

export interface SignupSchoolRow {
  user_id: string;
  university: string;
  school_type: Sector;
}

/**
 * The row signup writes: the school answers and nothing else. Deliberately
 * omits first_name/last_name rather than sending empty strings — a name we
 * have not asked for yet is absent, not blank.
 */
export function signupSchoolRow(
  userId: string,
  school: { university: string; schoolType: Sector },
): SignupSchoolRow {
  return {
    user_id: userId,
    university: school.university,
    school_type: school.schoolType,
  };
}
