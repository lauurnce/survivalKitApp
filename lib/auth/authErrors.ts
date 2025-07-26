// Student-facing messages for Supabase Auth failures.
//
// The provider's own message is never shown (it can carry internals such as
// constraint names — PR #19); only its machine-readable `code`/`status` is
// read, and each maps to a sentence that tells the student what to do next.

export const GENERIC_SIGNUP_ERROR = "Unable to create account. Please try again.";
export const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export const RATE_LIMITED =
  "Too many attempts from this connection. Please wait a few minutes and try again.";

// Email confirmation is OFF on this project (mailer_autoconfirm), so Supabase
// already answers a duplicate signup with `user_already_exists` and the
// sign-in form would reveal the same thing. Saying so plainly sends the
// student to the form that works instead of retrying a dead end; it tells an
// attacker nothing Supabase's own response does not.
export const EMAIL_TAKEN = "An account with this email already exists. Log in instead.";

export const CHECK_EMAIL =
  "Check your inbox to confirm your email, then log in to continue.";

interface AuthErrorLike {
  code?: string;
  status?: number;
}

function isRateLimit(e: AuthErrorLike): boolean {
  return (
    e.status === 429 ||
    e.code === "over_request_rate_limit" ||
    e.code === "over_email_send_rate_limit"
  );
}

export function signUpErrorMessage(e: AuthErrorLike | null | undefined): string {
  if (!e) return GENERIC_SIGNUP_ERROR;
  if (isRateLimit(e)) return RATE_LIMITED;
  switch (e.code) {
    case "user_already_exists":
    case "email_exists":
      return EMAIL_TAKEN;
    case "weak_password":
      return "That password is too easy to guess. Use at least 8 characters with a mix of letters and numbers.";
    case "email_address_invalid":
    case "email_address_not_authorized":
      return "That email address can't be used. Please use a different one.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "New sign-ups are paused right now. Please try again later.";
    default:
      return GENERIC_SIGNUP_ERROR;
  }
}

export function signInErrorMessage(e: AuthErrorLike | null | undefined): string {
  if (!e) return GENERIC_LOGIN_ERROR;
  if (isRateLimit(e)) return RATE_LIMITED;
  if (e.code === "email_not_confirmed") return CHECK_EMAIL;
  return GENERIC_LOGIN_ERROR;
}
