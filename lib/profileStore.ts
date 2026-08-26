// Profile persistence. Two backends behind one interface:
//
//   PROFILE_STORE=file  → gitignored .dev/profile-store.json (local preview,
//                         never touches the live database)
//   default             → Supabase `profiles` table via the session-scoped SSR
//                         client, so RLS applies (requires migration
//                         20260706000000_profiles.sql to be applied)

import { promises as fs } from "fs";
import path from "path";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "./profile";
import type { Sector } from "./universities";
import { profileFromRow, signupSchoolRow } from "./profileRow";

const FILE_STORE = path.join(process.cwd(), ".dev", "profile-store.json");

function isFileStore(): boolean {
  return process.env.PROFILE_STORE === "file";
}

async function readFileStore(): Promise<Record<string, Profile>> {
  try {
    const raw = await fs.readFile(FILE_STORE, "utf8");
    return JSON.parse(raw) as Record<string, Profile>;
  } catch {
    return {};
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (isFileStore()) {
    return (await readFileStore())[userId] ?? null;
  }

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase
    .from("profiles")
    // select("*") rather than a pinned column list: one column missing from
    // the live schema would otherwise 400 the whole query and blank the
    // profile. See the note at the top of profileRow.ts.
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return profileFromRow(data);
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  if (isFileStore()) {
    const store = await readFileStore();
    const existing = store[userId];
    // createdAt is owned by the row, not the form — validateProfile emits
    // null for it, so keep whatever a previous save recorded.
    store[userId] = { ...profile, createdAt: existing?.createdAt ?? null };
    await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
    await fs.writeFile(FILE_STORE, JSON.stringify(store, null, 2));
    return;
  }

  const supabase = await createSSRServerClient();
  const { error } = await supabase.from("profiles").upsert({
    user_id: userId,
    first_name: profile.firstName,
    last_name: profile.lastName,
    age: profile.age,
    gender: profile.gender,
    university: profile.university,
    school_type: profile.schoolType,
    major: profile.major,
    pathways: profile.pathways,
    devices: profile.devices,
    languages: profile.languages,
    background: profile.background,
    it_reason: profile.itReason,
    career_goal: profile.careerGoal,
    github_url: profile.githubUrl,
    portfolio_url: profile.portfolioUrl,
    updated_at: new Date().toISOString(),
    // created_at is deliberately absent: it belongs to the row (column
    // default), and validateProfile hands us null for it. Listing it would
    // overwrite the real timestamp with null and fail the NOT NULL check.
  });
  if (error) throw new Error(`saveProfile failed: ${error.message}`);
}

/**
 * Writes the school answers collected at signup, before the student has given
 * us a name. Uses the service-role client — the same one claimDeviceRows()
 * already uses at signup — because sign-up does not necessarily leave a
 * session behind (with email confirmation on, there is no auth.uid() yet for
 * the RLS insert policy to match).
 *
 * Upserts on user_id so a replayed signup cannot fail on a duplicate key,
 * and so a student who signs up again after deleting their account keeps
 * one row.
 */
export async function saveSignupSchool(
  userId: string,
  school: { university: string; schoolType: Sector },
): Promise<void> {
  if (isFileStore()) {
    const store = await readFileStore();
    const existing = store[userId];
    store[userId] = {
      firstName: existing?.firstName ?? null,
      lastName: existing?.lastName ?? null,
      age: existing?.age ?? null,
      gender: existing?.gender ?? null,
      major: existing?.major ?? null,
      pathways: existing?.pathways ?? [],
      devices: existing?.devices ?? [],
      languages: existing?.languages ?? [],
      background: existing?.background ?? null,
      itReason: existing?.itReason ?? null,
      careerGoal: existing?.careerGoal ?? null,
      githubUrl: existing?.githubUrl ?? null,
      portfolioUrl: existing?.portfolioUrl ?? null,
      createdAt: existing?.createdAt ?? null,
      university: school.university,
      schoolType: school.schoolType,
    };
    await fs.mkdir(path.dirname(FILE_STORE), { recursive: true });
    await fs.writeFile(FILE_STORE, JSON.stringify(store, null, 2));
    return;
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("profiles")
    .upsert(signupSchoolRow(userId, school), { onConflict: "user_id" });
  if (error) throw new Error(`saveSignupSchool failed: ${error.message}`);
}
