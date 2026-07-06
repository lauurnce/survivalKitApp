"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { validateProfile } from "@/lib/profile";
import { saveProfile } from "@/lib/profileStore";

// Signature matches React 19's useActionState: (prevState, formData).
// savedAt lets the modal detect a fresh success and close itself.
export type ProfileFormState = { error?: string; savedAt?: number };

export async function saveProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "You must be logged in to save your profile." };

  const result = validateProfile({
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    age: String(formData.get("age") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    university: String(formData.get("university") ?? ""),
    major: String(formData.get("major") ?? ""),
    pathways: formData.getAll("pathways").map(String),
  });
  if (!result.ok) return { error: result.error };

  try {
    await saveProfile(userId, result.profile);
  } catch {
    return { error: "Couldn't save your profile. Please try again." };
  }

  revalidatePath("/account");
  return { savedAt: Date.now() };
}
