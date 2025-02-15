/**
 * The word for a count: "1 read", "2 reads", "0 reads". English plural for
 * the counts the UI shows; pass `plural` for irregular words.
 *
 * Takes the raw count, not the formatted one: formatCount(1000) is "1k",
 * which is plural, and only an exact 1 is singular (QA CT-13: "1 READS").
 */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}
