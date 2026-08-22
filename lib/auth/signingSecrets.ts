// Shared resolution of HMAC signing secrets, consumed by the device cookie
// (lib/auth/deviceCookie.ts), admin sessions (lib/auth/adminSession.ts), and
// the Edge middleware guard (middleware.ts). Must stay import-safe in the Edge
// runtime: no Node built-ins here.

/**
 * Minimum length enforced on a PRIMARY secret. PREVIOUS values are exempt —
 * they exist precisely because old secrets were allowed to be short.
 */
export const MIN_PRIMARY_SECRET_LENGTH = 32;

/**
 * Secrets to try when verifying an HMAC signature, most recent first: the
 * primary (which also signs everything new) followed by the optional
 * previous secret read from `<primaryName>_PREVIOUS`.
 *
 * Rotation runbook (rotating DEVICE_COOKIE_SECRET / ADMIN_SESSION_SECRET
 * without stranding existing holders):
 *   1. BEFORE deploying this code, set both vars on the target environment:
 *      point *_PREVIOUS at the current (legacy, possibly short) secret, and
 *      point the primary at a fresh value of >= MIN_PRIMARY_SECRET_LENGTH
 *      characters. The floor below is unconditional, so deploying while the
 *      primary is still the short legacy value fails closed.
 *   2. Deploy. Existing cookies/tokens keep verifying against *_PREVIOUS;
 *      everything newly issued signs with the rotated primary.
 *   3. After a grace window covering the longest-lived credential (device
 *      cookies live 1 year, admin sessions 8 hours), delete *_PREVIOUS.
 *
 * The floor applies to the primary only and applies unconditionally — it is
 * NOT contingent on a rotation window being open. Gating it on *_PREVIOUS
 * would mean deleting *_PREVIOUS in step 3 silently switched enforcement back
 * off, exactly when the operator believes the rotation is finished. An empty
 * *_PREVIOUS counts as unset, so the window can be closed by clearing the
 * value rather than deleting the variable.
 */
export function signingSecretCandidates(
  primaryName: string,
  previousName: string,
): string[] {
  const primary = process.env[primaryName];
  if (!primary) throw new Error(`${primaryName} env var is not set`);
  if (primary.length < MIN_PRIMARY_SECRET_LENGTH) {
    throw new Error(
      `${primaryName} must be at least ${MIN_PRIMARY_SECRET_LENGTH} characters`,
    );
  }

  const previous = process.env[previousName];
  return previous ? [primary, previous] : [primary];
}
