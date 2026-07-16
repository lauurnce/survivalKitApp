// Excludes 0/O/1/I/L to avoid Messenger-transcription errors when reps
// read the code aloud or retype it from a screenshot.
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const SHAPE_RE = new RegExp(`^[${CODE_ALPHABET}]{6}$`, "i");

export function generateClassCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function isValidClassCodeShape(code: string): boolean {
  return SHAPE_RE.test(code);
}
