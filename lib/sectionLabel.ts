// Editorial section label used in page headers, e.g. "§ 01 — 1st Year".
// Centralizes the zero-padding that was previously hand-built as `§ 0${n}`,
// which broke past 9 ("§ 010") and rendered "§ 0?" when data was missing.
export function sectionLabel(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "§ —";
  return `§ ${String(n).padStart(2, "0")}`;
}
