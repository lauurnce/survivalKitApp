import { summaryParts, type SubjectSummary } from "./summary";

// The search-result snippet for a subject's modules page. "Modules and
// reviewers for X" said nothing a student could act on; this carries the same
// counts and the free promise the page header now shows.
export function subjectMetaDescription(
  subjectTitle: string,
  yearLabel: string | null | undefined,
  summary: SubjectSummary,
): string {
  const name = yearLabel ? `${subjectTitle} (${yearLabel})` : subjectTitle;
  const parts = summaryParts(summary);
  if (parts.length === 0) return `Modules and reviewers for ${name}.`;
  const free = summary.lessonCount > 0 ? " Every lesson is free to read." : "";
  return `${name}: ${parts.join(", ")}.${free}`;
}
