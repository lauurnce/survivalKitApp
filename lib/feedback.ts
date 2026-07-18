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
 * Generate a unique coupon code in format FEEDBACK-XXXXXX
 * Uses 6 random alphanumeric characters (base36)
 */
export function generateCouponCode(): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FEEDBACK-${randomPart}`;
}

/**
 * Convenience wrapper for isQualityApproved
 */
export function isQualityApproved(feedbackText: string): boolean {
  return checkFeedbackQuality(feedbackText);
}
