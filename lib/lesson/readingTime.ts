// Estimated reading time for a lesson, shown up front so a reader arriving
// from a group-chat link knows the commitment before they start ("6 min").
//
// Prose reads at ~200 wpm for study material (slower than the ~238 wpm
// average for non-fiction, because it is being learned, not skimmed). Code
// is read line by line, so each line in a fenced block costs a flat few
// seconds instead of being counted as words.

const WORDS_PER_MINUTE = 200;
const SECONDS_PER_CODE_LINE = 4;

export interface TimedSection {
  kind: string;
  body_md: string;
}

const FENCE = /```[^\n]*\n([\s\S]*?)```/g;

/** Seconds needed to read one markdown body. */
export function readingSeconds(body: string): number {
  let codeLines = 0;
  const prose = body.replace(FENCE, (_m, code: string) => {
    codeLines += code.split("\n").filter((l) => l.trim().length > 0).length;
    return " ";
  });
  const words = prose
    // table pipes, heading/list markers and emphasis are not words
    .replace(/[|#>*_`\-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return (words / WORDS_PER_MINUTE) * 60 + codeLines * SECONDS_PER_CODE_LINE;
}

/**
 * Whole minutes to read the lesson's visible sections (content plus any
 * activity body the reader can see), never less than 1.
 */
export function estimateReadingMinutes(sections: TimedSection[]): number {
  const seconds = sections.reduce((sum, s) => sum + readingSeconds(s.body_md ?? ""), 0);
  return Math.max(1, Math.round(seconds / 60));
}
