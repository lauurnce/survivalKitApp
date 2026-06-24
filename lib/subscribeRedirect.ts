import { isUuid } from "./validation";

interface BuildSuccessUrlParams {
  origin: string;
  yearId: string;
  subjectId: string | null;
  returnPath?: string | null;
}

// Build the post-payment redirect URL. Returns the exact module page the payer
// came from (so the SubscribeGate there can auto-poll and unlock in place),
// but ONLY if returnPath is a well-formed module route whose year/subject match
// the plan being purchased. Anything else falls back to the subjects list. This
// prevents open-redirects and stops a payer from returning to content they did
// not pay for. The ?payment=success marker is what triggers SubscribeGate's poll.
export function buildSuccessUrl({
  origin,
  yearId,
  subjectId,
  returnPath,
}: BuildSuccessUrlParams): string {
  const fallback = `${origin}/year/${yearId}/subjects?payment=success`;
  if (typeof returnPath !== "string") return fallback;

  // Expect exactly: ["", "year", <uuid>, "subjects", <uuid>, "modules", <uuid>]
  const parts = returnPath.split("/");
  if (parts.length !== 7) return fallback;
  const [empty, yearKw, pathYear, subjectsKw, pathSubject, modulesKw, pathModule] = parts;
  if (empty !== "" || yearKw !== "year" || subjectsKw !== "subjects" || modulesKw !== "modules") {
    return fallback;
  }
  if (!isUuid(pathYear) || !isUuid(pathSubject) || !isUuid(pathModule)) return fallback;

  // Year must match the purchased plan.
  if (pathYear !== yearId) return fallback;
  // For a subject plan, the subject must match too. (Year plans unlock the whole
  // year, so any subject under the matching year is fine.)
  if (subjectId !== null && pathSubject !== subjectId) return fallback;

  return `${origin}${returnPath}?payment=success`;
}
