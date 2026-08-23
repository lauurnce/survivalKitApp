/**
 * Detection coverage: if this were being attacked right now, what would show it?
 *
 * Every other module in this department asks whether a defence is present.
 * This one asks whether a failure would be noticed, which has a much worse
 * average answer everywhere, and which nobody asks until it is too late to
 * ask usefully.
 *
 * Six rows, one per P0 in the charter's escalation list, in the charter's
 * order. Detection is assessed against what would be catastrophic rather than
 * against everything that could conceivably be logged — an exhaustive
 * logging-coverage report is a report nobody reads.
 *
 * A row with no probes and a `blindReason` is a recorded structural blind
 * spot: permanently BLIND, reported as a standing ACCEPTED finding with a
 * reopen trigger rather than rediscovered as new every week. Inventing a weak
 * probe so a blind row renders as `partial` would be the most damaging thing
 * anyone could do to this module — it would convert a known gap into a
 * comfortable-looking number.
 */

export interface DetectionProbe {
  label: string;
  pattern: RegExp;
  /** Repo-relative file the probe reads. */
  file: string;
}

export interface DetectionEntry {
  id: string;
  /** The P0 escalation, in the charter's words. */
  escalation: string;
  /** The signal that would reveal it, if any. */
  wouldShow: string;
  probes: DetectionProbe[];
  /** Set when there is no signal at all. Makes the row permanently BLIND. */
  blindReason?: string;
  /** Which department would actually see the signal, when it is not this one. */
  ownedBy?: string;
}

export const DETECTION_MATRIX: readonly DetectionEntry[] = [
  {
    id: "E1",
    escalation: "A table readable or writable without RLS containing user data",
    wouldShow:
      "Nothing at runtime — the product behaves normally while exposed. Build-time only: the standing assertion in lib/reports/rlsPosture.test.ts fails npm test, and this department's weekly run rates the table.",
    probes: [
      {
        label: "standing RLS assertion exists",
        pattern: /assessRls\([\s\S]{0,400}verdict === "gap"/,
        file: "lib/reports/rlsPosture.test.ts",
      },
    ],
  },
  {
    id: "E2",
    escalation: "A secret reachable from the client bundle",
    wouldShow:
      "Nothing at runtime. Build-time only: the standing assertion in lib/reports/secretsPosture.test.ts fails npm test. Deleting that assertion to make a build pass is itself the incident.",
    probes: [
      {
        label: "standing client-reachability assertion exists",
        pattern: /kind === "client-reachable"/,
        file: "lib/reports/secretsPosture.test.ts",
      },
    ],
  },
  {
    id: "E3",
    escalation: "Identity or entitlement forgeable — device cookie or admin session",
    wouldShow:
      "A sustained attempt shows only as a rise in 401s in the status-code breakdown, plus admin lockout rows. Individual rejections are silent by design.",
    ownedBy: "Operations reads the status-code breakdown; this department cannot see it.",
    probes: [
      {
        label: "admin attempts recorded in shared state",
        pattern: /["']check_login_lockout["']/,
        file: "app/api/admin/login/route.ts",
      },
      {
        label: "device rejection returns a distinguishable status",
        pattern: /status:\s*401/,
        file: "app/api/run/route.ts",
      },
      {
        label: "limiter failure is logged rather than swallowed",
        pattern: /console\.error\(\s*["']check_rate_limit RPC error/,
        file: "lib/serverRateLimit.ts",
      },
    ],
  },
  {
    id: "E4",
    escalation: "Sandbox escape, or unbounded resource consumption in code execution",
    wouldShow:
      "Resource exhaustion surfaces as timed-out runs returned to the caller and as function duration on the platform. Teardown failures are logged. Escape itself would show only as anomalous outbound behaviour, which nothing here watches.",
    probes: [
      {
        label: "timeout is reported rather than swallowed",
        pattern: /timedOut:/,
        file: "lib/ide/sandboxRunner.ts",
      },
      {
        label: "teardown failure is logged",
        pattern: /console\.error\(\s*["']sandbox\.stop\(\) failed/,
        file: "lib/ide/sandboxRunner.ts",
      },
      {
        label: "rate limiting produces a distinguishable status",
        pattern: /status:\s*429/,
        file: "app/api/run/route.ts",
      },
    ],
  },
  {
    id: "E5",
    escalation: "Payment state settable without a verified webhook",
    wouldShow:
      "Underpayment attempts are logged with both figures. Ignored deliveries are labelled with the reason, so a mode misconfiguration is distinguishable from normal traffic. An invalid signature is rejected silently.",
    probes: [
      {
        label: "underpayment logged with both amounts",
        pattern: /console\.error\([^)]*underpayment/i,
        file: "app/api/webhooks/paymongo/route.ts",
      },
      {
        label: "ignored deliveries carry a reason label",
        pattern: /ignored:\s*["']/,
        file: "app/api/webhooks/paymongo/route.ts",
      },
      {
        label: "ledger write failure is logged",
        pattern: /console\.error\([^)]*(?:payment|recordPayment)/i,
        file: "app/api/webhooks/paymongo/route.ts",
      },
    ],
  },
  {
    id: "E6",
    escalation: "Any actively exploited issue, regardless of theoretical severity",
    wouldShow:
      "Nothing. There is no alerting of any kind: no threshold on 401 or 429 volume, no anomaly detection, no notification path. Runtime errors and 5xx clusters are visible to Operations on its daily cadence, which surfaces an exploit only if it happens to break something.",
    blindReason:
      "No alerting exists, and building it is a real project rather than a fix. Recorded here permanently so it is reported as a standing accepted risk with a reopen trigger, not rediscovered as a new finding every week. The honest reopen trigger is the first incident that ran for more than a day, or the point at which revenue makes an hour of undetected exposure cost more than the alerting would.",
    ownedBy: "Operations sees runtime errors daily; nothing sees an exploit that does not error.",
    probes: [],
  },
];

export type Coverage = "covered" | "partial" | "BLIND" | "unknown";

export interface DetectionResult {
  entry: DetectionEntry;
  coverage: Coverage;
  /** Labels of the probes that did not hold. */
  missingProbes: string[];
}

export function assessDetection(
  sources: Record<string, string | null>,
  matrix: readonly DetectionEntry[] = DETECTION_MATRIX
): DetectionResult[] {
  return matrix.map((entry) => {
    // A recorded blind spot stays blind whatever the sources say. It is a
    // statement about what does not exist, and no file can contradict it.
    if (entry.probes.length === 0) {
      return { entry, coverage: "BLIND" as const, missingProbes: [] };
    }

    for (const probe of entry.probes) {
      if (typeof sources[probe.file] !== "string") {
        return { entry, coverage: "unknown" as const, missingProbes: [] };
      }
    }

    const missingProbes = entry.probes
      .filter((probe) => !probe.pattern.test(sources[probe.file] as string))
      .map((probe) => probe.label);

    const coverage: Coverage =
      missingProbes.length === 0
        ? "covered"
        : missingProbes.length === entry.probes.length
          ? "BLIND"
          : "partial";

    return { entry, coverage, missingProbes };
  });
}

const ID_WIDTH = 5;
const ESCALATION_WIDTH = 58;
const SHOW_WIDTH = 58;
const COVERAGE_WIDTH = 10;
const RULE_WIDTH = ID_WIDTH + ESCALATION_WIDTH + SHOW_WIDTH + COVERAGE_WIDTH;

export function renderDetectionTable(results: DetectionResult[]): string {
  const header =
    "#".padEnd(ID_WIDTH) +
    "ESCALATION".padEnd(ESCALATION_WIDTH) +
    "WOULD SHOW".padEnd(SHOW_WIDTH) +
    "COVERAGE".padEnd(COVERAGE_WIDTH);

  const body = results.map(
    ({ entry, coverage }) =>
      entry.id.padEnd(ID_WIDTH) +
      entry.escalation.slice(0, ESCALATION_WIDTH - 1).padEnd(ESCALATION_WIDTH) +
      entry.wouldShow.slice(0, SHOW_WIDTH - 1).padEnd(SHOW_WIDTH) +
      coverage.padEnd(COVERAGE_WIDTH)
  );

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function detectionSummaryLine(results: DetectionResult[]): string {
  const covered = results.filter((r) => r.coverage === "covered").length;
  const blind = results.filter((r) => r.coverage === "BLIND").length;
  const partial = results.filter((r) => r.coverage === "partial").length;

  if (partial === 0) {
    return `DETECTION     ${covered}/${results.length} escalations covered · ${blind} blind`;
  }
  return `DETECTION     ${covered}/${results.length} covered · ${partial} partial · ${blind} blind`;
}
