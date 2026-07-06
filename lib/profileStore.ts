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
import type { Profile } from "./profile";

const FILE_STORE = path.join(process.cwd(), ".dev", "profile-store.json");

function useFileStore(): boolean {
  return process.env.PROFILE_STORE === "file";
}

async function readFileStore(): Promise<Record<string, Profile>> {
  try {
    return JSON.parse(await fs.readFile(FILE_STORE, "utf8"));
  } catch {
    return {};
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (useFileStore()) {
    return (await readFileStore())[userId] ?? null;
  }

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("first_name,last_name,age,gender,university,major,pathways")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    age: data.age,
    gender: data.gender,
    university: data.university,
    major: data.major,
    pathways: data.pathways ?? [],
  };
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  if (useFileStore()) {
    const store = await readFileStore();
    store[userId] = profile;
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
    major: profile.major,
    pathways: profile.pathways,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`saveProfile failed: ${error.message}`);
}
