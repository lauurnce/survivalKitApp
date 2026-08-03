/**
 * Severity taxonomy shared by every department report.
 *
 * The bottom two labels carry the weight. P3 exists so a trend stays visible
 * without demanding action, and ACCEPTED makes "we are deliberately not fixing
 * this" a durable decision rather than something that quietly resurfaces every
 * week. An ACCEPTED finding is never re-argued until its trigger fires, which
 * is why the trigger is required rather than optional.
 */

export type Severity = "P0" | "P1" | "P2" | "P3" | "ACCEPTED";

export type FindingState = "NEW" | "ONGOING" | "CLOSED";

export interface Finding {
  /** Stable slug. Findings are matched across runs by this, not by title. */
  id: string;
  title: string;
  severity: Severity;
  state: FindingState;
  /** ISO date the finding first appeared. Set on the run that opens it. */
  sinceRun?: string;
  /** Required when severity is ACCEPTED: why we are not fixing it. */
  acceptedReason?: string;
  /** Required when severity is ACCEPTED: what would promote it back. */
  reopenTrigger?: string;
}

export const SEVERITY_ORDER: readonly Severity[] = [
  "P0",
  "P1",
  "P2",
  "P3",
  "ACCEPTED",
] as const;

/** Sort comparator: most severe first, ACCEPTED always last. */
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b);
}

/** Only P0 and P1 justify interrupting other work. */
export function isEscalation(severity: Severity): boolean {
  return severity === "P0" || severity === "P1";
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns a list of problems. An empty array means the finding is valid. */
export function validateFinding(finding: Finding): string[] {
  const errors: string[] = [];

  if (!finding.id) {
    errors.push("id is required");
  } else if (!SLUG.test(finding.id)) {
    errors.push("id must be a lowercase slug: a-z, 0-9 and hyphens only");
  }

  if (!finding.title.trim()) errors.push("title is required");

  if (finding.severity === "ACCEPTED") {
    if (!finding.acceptedReason?.trim()) {
      errors.push("ACCEPTED findings require acceptedReason");
    }
    if (!finding.reopenTrigger?.trim()) {
      errors.push("ACCEPTED findings require reopenTrigger");
    }
  } else {
    if (finding.acceptedReason !== undefined) {
      errors.push("acceptedReason is only valid on ACCEPTED findings");
    }
    if (finding.reopenTrigger !== undefined) {
      errors.push("reopenTrigger is only valid on ACCEPTED findings");
    }
  }

  return errors;
}
