"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { claimDeviceRows } from "@/lib/auth/claim";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { validateCredentials } from "@/lib/auth/validateCredentials";
import { validateSignupSchool } from "@/lib/profile";
import { saveSignupSchool } from "@/lib/profileStore";

async function claimForUser(userId: string) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (deviceId) await claimDeviceRows(userId, deviceId);
}

// Only allow redirects to an internal path. Rejects "null"/"undefined" strings
// (which break new URL()) and absolute URLs / protocol-relative paths (open
// redirect). Falls back to the dashboard.
function safeNext(raw: FormDataEntryValue | null): string {
  const v = typeof raw === "string" ? raw : "";
  if (!v || v === "null" || v === "undefined") return "/account";
  // must be a single-leading-slash internal path, not "//host" or "/\evil"
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return "/account";
  return v;
}

// Signature matches React 19's useActionState: (prevState, formData).
// On success these call redirect(), which throws NEXT_REDIRECT (normal control
// flow). On failure they return { error } so the form can render the message.
type AuthState = { error?: string };

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  // Validated before the account is created, so a missing school can never
  // leave behind an account the student then can't sign up with again.
  const school = validateSignupSchool({
    university: String(formData.get("university") ?? ""),
    schoolType: String(formData.get("schoolType") ?? ""),
  });
  if (!school.ok) return { error: school.error };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error("Sign-up failed:", error.message);
    return { error: "Unable to create account. Please try again." };
  }
  if (data.user) {
    await claimForUser(data.user.id);
    try {
      await saveSignupSchool(data.user.id, {
        university: school.university,
        schoolType: school.schoolType,
      });
    } catch (e) {
      // The account exists by this point. Failing the signup here would strand
      // the student on an error page for an account they already own and would
      // send them back to a form that now rejects their email as taken. Log it
      // and let them through — the profile page still asks for the school, so
      // the answer is recoverable; the account is not.
      console.error("signUpAction: could not save school answers", e);
    }
  }
  redirect(next);
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid email or password." };
  if (data.user) await claimForUser(data.user.id);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSSRServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
