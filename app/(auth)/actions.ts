"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { claimDeviceRows } from "@/lib/auth/claim";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { normalizeEmail, validateCredentials } from "@/lib/auth/validateCredentials";
import { CHECK_EMAIL, signInErrorMessage, signUpErrorMessage } from "@/lib/auth/authErrors";
import { canonicalUrl } from "@/lib/appOrigin";
import { safeNextPath } from "@/lib/auth/safeNext";
import { validateSignupSchool } from "@/lib/profile";
import type { Sector } from "@/lib/universities";
import { saveSignupSchool } from "@/lib/profileStore";

async function claimForUser(userId: string) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (deviceId) await claimDeviceRows(userId, deviceId);
}

// Signature matches React 19's useActionState: (prevState, formData).
// On success these call redirect(), which throws NEXT_REDIRECT (normal control
// flow). On failure they return { error } so the form can render the message;
// `notice` is a non-error outcome the form shows instead (confirm your email).
type AuthState = { error?: string; notice?: string };

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Only used if email confirmation is ever switched on (it is off today:
    // mailer_autoconfirm, so signUp returns a session). The link confirms the
    // address server-side, then lands on the canonical login page with the
    // same return path, so the student logs in and carries on where they were.
    options: { emailRedirectTo: canonicalUrl(`/login?next=${encodeURIComponent(next)}`) },
  });
  if (error) {
    console.error("Sign-up failed:", error.code ?? error.status, error.message);
    return { error: signUpErrorMessage(error) };
  }

  // No session means confirmation is required. With confirmation on, Supabase
  // also answers a duplicate email this way, with a placeholder user that has
  // no identities — so neither case claims the device or writes a profile,
  // and both get the same message (no account-existence oracle).
  if (!data.session) {
    const real = (data.user?.identities?.length ?? 0) > 0;
    if (data.user && real) await saveSchoolBestEffort(data.user.id, school);
    return { notice: CHECK_EMAIL };
  }

  if (data.user) {
    await claimForUser(data.user.id);
    await saveSchoolBestEffort(data.user.id, school);
  }
  redirect(next);
}

async function saveSchoolBestEffort(
  userId: string,
  school: { university: string; schoolType: Sector },
): Promise<void> {
  try {
    await saveSignupSchool(userId, {
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

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: signInErrorMessage(error) };
  if (data.user) await claimForUser(data.user.id);
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSSRServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
