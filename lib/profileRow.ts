// Row <-> Profile mapping for the `profiles` table (pure — no IO), kept out of
// profileStore so the shape can be tested without a database. The column list
// is shared with the select so the two cannot drift apart silently.

import type { Gender, Pathway, Profile } from "./profile";
import type { Sector } from "./universities";

export const PROFILE_COLUMNS =
  "first_name,last_name,age,gender,university,school_type,major,pathways";

export interface ProfileRow {
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  gender: string | null;
  university: string | null;
  school_type: string | null;
  major: string | null;
  pathways: string[] | null;
}

export function profileFromRow(row: ProfileRow): Profile {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    gender: row.gender as Gender | null,
    university: row.university,
    schoolType: row.school_type as Sector | null,
    major: row.major,
    pathways: (row.pathways ?? []) as Pathway[],
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
