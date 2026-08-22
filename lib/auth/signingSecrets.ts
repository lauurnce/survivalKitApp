// Shared resolution of HMAC signing secrets, consumed by the device cookie
// (lib/auth/deviceCookie.ts), admin sessions (lib/auth/adminSession.ts), and
// the Edge middleware guard (middleware.ts). Must stay import-safe in the Edge
// runtime: no Node built-ins here.

/**
 * Minimum length enforced on a PRIMARY secret once a rotation window is open.
 * PREVIOUS values are exempt — they exist precisely because old secrets were
 * allowed to be short.
 */
export const MIN_PRIMARY_SECRET_LENGTH = 32;

/**
 * Secrets to try when verifying an HMAC signature, most recent first: the
 * primary (which also signs everything new) followed by the optional
 * previous secret read from `<primaryName>_PREVIOUS`.
 *
 * Rotation runbook (rotating DEVICE_COOKIE_SECRET / ADMIN_SESSION_SECRET
 * without stranding existing holders):
 *   1. Deploy code reading these vars while the current (possibly
 *      legacy-short) primary is still set and no *_PREVIOUS var exists —
 *      behavior is exactly what shipped before this helper existed.
 *   2. Open the rotation window: set *_PREVIOUS to the old secret and point
 *      the primary itself at a fresh value of >= MIN_PRIMARY_SECRET_LENGTH
 *      characters. Existing cookies/tokens keep verifying against *_PREVIOUS;
 *      everything newly issued signs with the rotated primary.
 *   3. After a grace window covering the longest-lived credential (device
 *      cookies live 1 year, admin sessions 8 hours), delete *_PREVIOUS.
 *
 * The length floor applies to the primary only, and only once the window is
 * open (*_PREVIOUS set): a legacy short primary keeps working untouched until
 * you rotate, but from the moment you do, signing refuses to mint new
 * credentials with anything below the floor. An empty *_PREVIOUS counts as
 * unset, so the window can be closed by clearing the value rather than
 * deleting the variable.
 */
export function signingSecretCandidates(
  primaryName: string,
  previousName: string,
): string[] {
  const primary = process.env[primaryName];
  if (!primary) throw new Error(`${primaryName} env var is not set`);

  const previous = process.env[previousName];
  if (!previous) return [primary];

  if (primary.length < MIN_PRIMARY_SECRET_LENGTH) {
    throw new Error(
      `${primaryName} must be at least ${MIN_PRIMARY_SECRET_LENGTH} characters`,
    );
  }
  return [primary, previous];
}
