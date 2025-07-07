import { createHash, timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison for secrets (bearer tokens, shared keys).
 *
 * `a === b` returns at the first differing character, so response timing
 * leaks how much of a guessed secret was right. crypto.timingSafeEqual fixes
 * that but throws on unequal lengths, and a length check in front of it leaks
 * the secret's length instead. Hashing both sides to a fixed 32 bytes first
 * removes both leaks: the comparison is always 32 bytes against 32 bytes.
 *
 * Returns false for a missing value on either side, so a caller can pass an
 * unset env var or an absent header straight through and still fail closed.
 */
export function timingSafeEqualStrings(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (typeof a !== "string" || typeof b !== "string" || a.length === 0 || b.length === 0) {
    return false;
  }
  const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(digest(a), digest(b));
}
