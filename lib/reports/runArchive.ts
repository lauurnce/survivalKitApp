/**
 * Preserves a collector run that a re-run on the same day would otherwise
 * destroy.
 *
 * The collector names its output by Manila calendar date, so a second run on
 * the same day lands on the same path. Plain overwriting is not survivable:
 * a report published from the earlier run cites numbers, and once the file is
 * replaced those numbers exist nowhere — the report claims a source that no
 * longer says what it claimed. Re-running the collector is meant to be free
 * and repeatable, so the fix is to displace the old run rather than forbid the
 * new one.
 *
 * Archived runs go into a `superseded/` subdirectory on purpose. The
 * collector picks the previous run by globbing `*.json` in the data directory
 * itself, which is not recursive — so an archived run stays visible to a human
 * reading the directory while never being mistaken for yesterday's baseline by
 * a same-day re-run.
 *
 * Failures here deliberately throw rather than degrade. Everywhere else in the
 * collector a missing prior run is a nice-to-have that falls back to a
 * baseline, but "could not preserve the old run" must never quietly become
 * "overwrote the old run" — that is precisely the data loss this exists to
 * prevent.
 */

import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

/** Subdirectory holding runs displaced by a later run on the same day. */
export const SUPERSEDED_DIR = "superseded";

/**
 * Moves `outDir/filename` aside if it exists, returning the path it was moved
 * to, or `null` when there was nothing to displace.
 */
export function archiveExistingRun(outDir: string, filename: string): string | null {
  const existing = join(outDir, filename);
  if (!existsSync(existing)) return null;

  const archiveDir = join(outDir, SUPERSEDED_DIR);
  mkdirSync(archiveDir, { recursive: true });

  // Number within the day rather than timestamp the archive: the sequence is
  // what a reader wants ("the run before this one"), and it needs no timezone
  // reasoning to stay ordered.
  const base = filename.replace(/\.json$/, "");
  let target = join(archiveDir, `${base}.1.json`);
  for (let n = 2; existsSync(target); n += 1) {
    target = join(archiveDir, `${base}.${n}.json`);
  }

  renameSync(existing, target);
  return target;
}
