"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { claimDeviceRows } from "@/lib/auth/claim";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { validateCredentials } from "@/lib/auth/validateCredentials";

async function claimForUser(userId: string) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (deviceId) await claimDeviceRows(userId, deviceId);
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
  const next = String(formData.get("next") ?? "/account");
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid };

  const supabase = await createSSRServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (data.user) await claimForUser(data.user.id);
  redirect(next);
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");
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
