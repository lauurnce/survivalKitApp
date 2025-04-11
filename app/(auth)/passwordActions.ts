"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSSRServerClient } from "@/lib/supabase/ssrServer";
import { canonicalUrl } from "@/lib/appOrigin";
import { getClientIp } from "@/lib/rateLimit";
import { isServerRateLimited } from "@/lib/serverRateLimit";
import { normalizeEmail, validateEmail, validatePassword } from "@/lib/auth/validateCredentials";
import {
  RATE_LIMITED,
  RESET_EMAIL_SENT,
  RESET_LINK_EXPIRED,
  updatePasswordErrorMessage,
} from "@/lib/auth/authErrors";

type FormState = { error?: string; notice?: string };

// Where the emailed link lands. The callback exchanges the one-time code for a
// session, then sends the student to the page that sets the new password.
// Canonical origin, like every other link read outside the request (emails).
const RESET_REDIRECT_PATH = "/auth/callback?next=/reset-password";

// Per connection: enough for a student who mistypes a few times, not enough
// to use the form to mail-bomb somebody. Per address: the same inbox gets at
// most three links an hour, whoever asks.
const IP_LIMIT = { max: 5, windowSeconds: 15 * 60 } as const;
const EMAIL_LIMIT = { max: 3, windowSeconds: 60 * 60 } as const;

export async function requestPasswordResetAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const invalid = validateEmail(email);
  if (invalid) return { error: invalid };

  // Fails open: Supabase applies its own email-send limit behind this one, and
  // a limiter outage should not lock students out of their accounts.
  const ip = getClientIp({ headers: await headers() });
  if (await isServerRateLimited(`pwreset:ip:${ip}`, { ...IP_LIMIT, onFailure: "allow" })) {
    return { error: RATE_LIMITED };
  }
  // A capped address gets the same answer as a sent one, so the limit can't
  // be used to tell which addresses were asked about before.
  if (await isServerRateLimited(`pwreset:email:${email}`, { ...EMAIL_LIMIT, onFailure: "allow" })) {
    return { notice: RESET_EMAIL_SENT };
  }

  const supabase = await createSSRServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: canonicalUrl(RESET_REDIRECT_PATH),
  });
  if (error) {
    // Logged, never shown: whatever went wrong, the student sees the same
    // sentence as a success, so the form never confirms that an account exists.
    console.error("Password reset request failed:", error.code ?? error.status, error.message);
  }
  return { notice: RESET_EMAIL_SENT };
}

export async function updatePasswordAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const invalid = validatePassword(password);
  if (invalid) return { error: invalid };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createSSRServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: RESET_LINK_EXPIRED };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error("Password update failed:", error.code ?? error.status, error.message);
    return { error: updatePasswordErrorMessage(error) };
  }
  redirect("/account");
}
