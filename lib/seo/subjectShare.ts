// What a subject's link preview says. Shared by the subject segment's layout
// metadata and its opengraph-image, so the card and the text above it agree.

export interface SubjectShareInput {
  title: string;
  yearLabel: string | null;
  moduleCount: number;
}

export function subjectShareTitle({ title }: SubjectShareInput): string {
  return `${title} — BSIT Survival Kit`;
}

export function subjectShareDescription({ title, yearLabel, moduleCount }: SubjectShareInput): string {
  const lessons = moduleCount === 1 ? "1 lesson" : `${moduleCount} lessons`;
  const where = yearLabel ? ` (${yearLabel})` : "";
  return moduleCount > 0
    ? `${title}${where}: ${lessons} with free notes, plus reviewers with answer keys.`
    : `${title}${where}: free notes and reviewers with answer keys.`;
}

/** Supabase returns an embedded to-one relation as an object or a 1-array. */
export function yearLabelOf(years: unknown): string | null {
  const row = Array.isArray(years) ? years[0] : years;
  if (row && typeof row === "object" && "label" in row && typeof row.label === "string") return row.label;
  return null;
}
