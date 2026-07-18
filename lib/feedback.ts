import { randomBytes } from "crypto";

/**
 * Check if feedback passes quality approval.
 * Rules:
 * 1. Length >= 15 chars OR empty string (silent submission)
 * 2. No more than 3 repeated consecutive chars
 * 3. At least one letter (a-z, A-Z)
 */
export function checkFeedbackQuality(text: string): boolean {
  // Empty is OK (silent submission with just ratings)
  if (!text || text.trim().length === 0) {
    return true;
  }

  const trimmed = text.trim();

  // Rule 1: Length check
  if (trimmed.length < 15) {
    return false;
  }

  // Rule 2: No 4+ repeated chars
  if (/(.)\1{3,}/.test(trimmed)) {
    return false;
  }

  // Rule 3: At least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Generate a coupon code: FEEDBACK- + 8 chars from a 32-char alphabet
 * (Crockford-style, no I/L/O/U). crypto-random; 32 = 2^5 so `& 31` is
 * unbiased. 40 bits of entropy.
 */
const COUPON_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateCouponCode(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += COUPON_ALPHABET[bytes[i] & 31];
  return `FEEDBACK-${code}`;
}

/**
 * Convenience wrapper for isQualityApproved
 */
export function isQualityApproved(feedbackText: string): boolean {
  return checkFeedbackQuality(feedbackText);
}
