/**
 * Finds the collector run a new run should diff against.
 *
 * Extracted from scripts/reports/ops.ts so the Ops and Finance collectors
 * share one implementation rather than two. The thing this decides — what a
 * delta is measured against — is too load-bearing to exist twice untested.
 *
 * The key is a filename with `.json` stripped, so it is a Manila calendar day
 * for a daily collector (`2026-08-05`) and a Manila calendar month for a
 * monthly one (`2026-08`). Both sort lexically in chronological order, which
 * is why filename comparison is enough and no date parsing is needed.
 *
 * Every failure degrades to a baseline run rather than throwing: no directory
 * yet, no earlier file, an unreadable file, malformed JSON, or a missing
 * `metrics` array. A previous run is a nice-to-have and must never be a hard
 * dependency. (Contrast runArchive.ts, which throws — there, failing means
 * destroying data, which is not survivable.)
 *
 * Reading is non-recursive on purpose. `superseded/` and `weekly/` are
 * subdirectories of the same `.data` directory, and neither may ever be
 * mistaken for the previous run.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metric } from "./metrics";

export interface PreviousRun {
  /** The prior run's filename with `.json` stripped. */
  key: string;
  metrics: Metric[];
}

export function readPreviousRun(
  outDir: string,
  currentFilename: string
): PreviousRun | null {
  let files: string[];
  try {
    files = readdirSync(outDir).filter((name) => name.endsWith(".json"));
  } catch {
    return null;
  }

  const previousFile = files
    .filter((name) => name < currentFilename)
    .sort()
    .at(-1);
  if (!previousFile) return null;

  try {
    const parsed = JSON.parse(
      readFileSync(join(outDir, previousFile), "utf8")
    ) as { metrics?: unknown };
    if (!Array.isArray(parsed.metrics)) return null;
    return {
      key: previousFile.replace(/\.json$/, ""),
      metrics: parsed.metrics as Metric[],
    };
  } catch {
    return null;
  }
}
