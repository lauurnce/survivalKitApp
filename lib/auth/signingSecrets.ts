// Shared resolution of HMAC signing secrets, consumed by the device cookie
// (lib/auth/deviceCookie.ts), admin sessions (lib/auth/adminSession.ts), and
// the Edge proxy guard (proxy.ts). Must stay import-safe in the Edge
// runtime: no Node built-ins here.

/**
 * Minimum length enforced on EVERY signing secret — the primary and any
 * previous secret alike. Reconciled with PR #14: a below-floor secret must
 * never be usable to sign or verify anything, so a rotation window is not an
 * exemption from the floor.
 */
export const MIN_SECRET_LENGTH = 32;

/**
 * Secrets to try when verifying an HMAC signature, most recent first: the
 * primary (which also signs everything new) followed by the optional
 * previous secret read from `<primaryName>_PREVIOUS`.
 *
 * Rotation runbook (rotating DEVICE_COOKIE_SECRET / ADMIN_SESSION_SECRET
 * without stranding existing holders):
 *   1. BEFORE deploying this code, set both vars on the target environment:
 *      point *_PREVIOUS at the current secret and point the primary at a
 *      fresh value. BOTH values must be >= MIN_SECRET_LENGTH characters —
 *      the original design exempted *_PREVIOUS so a short legacy secret could
 *      bridge a rotation, but PR #14 closed that door: a weak key that can
 *      verify signatures is as dangerous as one that can create them, so no
 *      credential signed under a short legacy secret survives a rotation.
 *      Deploying while either var is short fails closed.
 *   2. Deploy. Existing cookies/tokens keep verifying against *_PREVIOUS;
 *      everything newly issued signs with the rotated primary.
 *   3. After a grace window covering the longest-lived credential (device
 *      cookies live 1 year, admin sessions 8 hours), delete *_PREVIOUS.
 *
 * The floor applies unconditionally to both secrets — it is NOT contingent on
 * a rotation window being open. Gating it on *_PREVIOUS would mean deleting
 * *_PREVIOUS in step 3 silently switched enforcement back off, exactly when
 * the operator believes the rotation is finished. An empty *_PREVIOUS counts
 * as unset, so the window can be closed by clearing the value rather than
 * deleting the variable.
 */
export function signingSecretCandidates(
  primaryName: string,
  previousName: string,
): string[] {
  const primary = process.env[primaryName];
  if (!primary) throw new Error(`${primaryName} env var is not set`);
  if (primary.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `${primaryName} must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }

  const previous = process.env[previousName];
  if (!previous) return [primary];
  if (previous.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `${previousName} must be at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
  return [primary, previous];
}
