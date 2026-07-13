// Shared contract for the progress share card: the API route uses
// parseProgressCardParams to validate/normalize, the client uses
// buildProgressCardUrl + progressCardFilename. Keep these in lockstep —
// they are two ends of the same URL.

export const PROGRESS_CARD_LIMITS = {
  subject: 40,
  module: 60,
  name: 20,
  countMax: 999,
} as const;

export const ACADEMIC_YEAR_LABEL = "AY 2026–27";

export interface ProgressCardParams {
  subject: string;
  count: number;
  module?: string;
  name?: string;
}

type ParseResult =
  | { ok: true; value: ProgressCardParams }
  | { ok: false; error: string };

function truncate(raw: string, max: number): string {
  const v = raw.trim();
  return v.length > max ? v.slice(0, max) + "…" : v;
}

export function parseProgressCardParams(sp: URLSearchParams): ParseResult {
  const subjectRaw = (sp.get("subject") ?? "").trim();
  if (!subjectRaw) return { ok: false, error: "Missing subject" };

  const countRaw = Number(sp.get("count"));
  if (!Number.isInteger(countRaw) || countRaw < 1) {
    return { ok: false, error: "count must be a positive integer" };
  }

  const value: ProgressCardParams = {
    subject: truncate(subjectRaw, PROGRESS_CARD_LIMITS.subject),
    count: Math.min(countRaw, PROGRESS_CARD_LIMITS.countMax),
  };

  const moduleRaw = (sp.get("module") ?? "").trim();
  if (moduleRaw) value.module = truncate(moduleRaw, PROGRESS_CARD_LIMITS.module);

  const nameRaw = (sp.get("name") ?? "").trim();
  if (nameRaw) value.name = truncate(nameRaw, PROGRESS_CARD_LIMITS.name);

  return { ok: true, value };
}

export function buildProgressCardUrl(params: ProgressCardParams): string {
  const sp = new URLSearchParams();
  sp.set("subject", params.subject);
  sp.set("count", String(params.count));
  if (params.module) sp.set("module", params.module);
  if (params.name) sp.set("name", params.name);
  return `/api/card/progress?${sp.toString()}`;
}

export function progressCardFilename(subjectTitle: string): string {
  const slug = subjectTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `bsit-progress-${slug || "card"}.png`;
}
