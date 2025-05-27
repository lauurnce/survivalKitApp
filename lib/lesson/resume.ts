// "Pick up where you left off" — the last scroll position in a lesson, kept
// per module in localStorage. 38% of Lesson 1's readers open it more than
// once; today every return starts at the top of a 13-screen page.
//
// Every read and write is wrapped: storage can be missing (private mode,
// in-app browsers from group chats) and the reader must render without it.

const PREFIX = "bsit:lesson-pos:";
/** Positions older than this are a different study session; start fresh. */
export const RESUME_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/** Below this the reader has barely started; above it they have finished. */
export const RESUME_MIN = 0.12;
export const RESUME_MAX = 0.92;

export interface SavedPosition {
  fraction: number;
  /** Heading of the section in view, shown on the resume chip. */
  heading: string | null;
  savedAt: number;
}

function key(moduleId: string) {
  return PREFIX + moduleId;
}

export function savePosition(moduleId: string, fraction: number, heading: string | null, now = Date.now()) {
  try {
    const value: SavedPosition = { fraction, heading, savedAt: now };
    localStorage.setItem(key(moduleId), JSON.stringify(value));
  } catch {
    // storage unavailable — resume is a convenience, never required
  }
}

export function clearPosition(moduleId: string) {
  try {
    localStorage.removeItem(key(moduleId));
  } catch {
    // ignore
  }
}

/** The saved position, if it is recent and worth offering; otherwise null. */
export function loadPosition(moduleId: string, now = Date.now()): SavedPosition | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(moduleId));
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedPosition>;
    const { fraction, savedAt } = parsed;
    if (typeof fraction !== "number" || typeof savedAt !== "number") return null;
    if (!Number.isFinite(fraction) || fraction < RESUME_MIN || fraction > RESUME_MAX) return null;
    if (now - savedAt > RESUME_MAX_AGE_MS || savedAt > now) return null;
    const heading = typeof parsed.heading === "string" && parsed.heading ? parsed.heading : null;
    return { fraction, heading, savedAt };
  } catch {
    return null;
  }
}
