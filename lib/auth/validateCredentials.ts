const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Supabase hashes with bcrypt, which reads only the first 72 bytes; GoTrue
// rejects anything longer with a provider error. Catch it here with a message.
export const MAX_PASSWORD_LENGTH = 72;

/** Trim and lowercase an email the way the auth provider stores it. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): string | null {
  if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
