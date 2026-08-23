/**
 * Supply chain: what we ship that someone else wrote.
 *
 * Not the same question Operations asks. Operations reports `npm outdated` —
 * maintenance debt. This reports exposure: a shipped package with a known
 * advisory, or a package that runs code on every machine that installs it. A
 * dependency can be years behind with no advisory, or current with a critical
 * one, so neither number substitutes for the other and this module never
 * looks at `npm outdated`.
 *
 * The rule that matters most here: a failed audit produces null counts, never
 * zeroes. `npm audit` goes over the network and networks fail. A zero renders
 * as "no known vulnerabilities" and reads as an all-clear; null renders as
 * "not read", which is the truth. Every reader of this module gets that for
 * free because the counts are `AuditCounts | null` rather than numbers with a
 * default.
 */

export interface AuditCounts {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
  total: number;
}

export interface AuditSummary {
  readable: boolean;
  /** Null whenever the audit did not produce a usable report. Never zeroed. */
  counts: AuditCounts | null;
  /** Direct dependencies carrying an advisory — the ones we chose ourselves. */
  directAdvisories: string[];
  /** How many advisories npm believes it can fix. Null when unreadable. */
  fixAvailable: number | null;
}

const UNREADABLE_AUDIT: AuditSummary = {
  readable: false,
  counts: null,
  directAdvisories: [],
  fixAvailable: null,
};

interface RawAdvisory {
  name?: string;
  severity?: string;
  isDirect?: boolean;
  fixAvailable?: boolean | Record<string, unknown>;
}

export function summarizeAudit(raw: string | null): AuditSummary {
  if (!raw || !raw.trim()) return UNREADABLE_AUDIT;

  let parsed: { vulnerabilities?: Record<string, RawAdvisory>; metadata?: { vulnerabilities?: Partial<AuditCounts> } };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return UNREADABLE_AUDIT;
  }

  const counts = parsed.metadata?.vulnerabilities;
  // `total` is the field the report is built around. Its absence means the
  // shape is not what we expect, and guessing at that point is how a false
  // all-clear gets printed.
  if (!counts || typeof counts.total !== "number") return UNREADABLE_AUDIT;

  const advisories = Object.values(parsed.vulnerabilities ?? {});

  return {
    readable: true,
    counts: {
      info: counts.info ?? 0,
      low: counts.low ?? 0,
      moderate: counts.moderate ?? 0,
      high: counts.high ?? 0,
      critical: counts.critical ?? 0,
      total: counts.total,
    },
    directAdvisories: advisories
      .filter((advisory) => advisory.isDirect === true && typeof advisory.name === "string")
      .map((advisory) => advisory.name as string)
      .sort(),
    fixAvailable: advisories.filter((advisory) => advisory.fixAvailable !== false).length,
  };
}

export interface InstallScriptEntry {
  /** Why this package is allowed to run code at install time. */
  reason: string;
  /** ISO date the decision was made, so a stale approval is visible. */
  approvedOn: string;
}

/**
 * Packages allowed to execute install scripts.
 *
 * An install script runs arbitrary code on every developer machine and every
 * CI runner that installs the tree — a different level of trust from a
 * package that is merely imported. Every entry here is build tooling that
 * fetches or selects a prebuilt platform binary, which is the legitimate
 * reason to need one. It is also exactly the shape a malicious script
 * imitates, which is why each entry records the reason rather than just the
 * name: "it was already here" is not an approval.
 *
 * A package with an install script and no entry here is `unapproved`, which
 * is the finding. New install-script surface cannot arrive quietly.
 */
export const INSTALL_SCRIPT_REGISTER: Record<string, InstallScriptEntry> = {
  esbuild: {
    reason:
      "Selects and verifies its prebuilt platform binary at install time. Dev-tree only, pulled in transitively by the build toolchain; named in the department design as a known unapproved-postinstall flag and reviewed here.",
    approvedOn: "2026-08-08",
  },
  sharp: {
    reason:
      "Downloads or links prebuilt libvips binaries for the host platform. Dev/optional tree, used by image optimisation during build rather than at runtime.",
    approvedOn: "2026-08-08",
  },
  "unrs-resolver": {
    reason:
      "Native resolver used by the lint toolchain; selects a prebuilt binding for the host platform. Dev-tree only.",
    approvedOn: "2026-08-08",
  },
};

export interface InstallScriptPackage {
  name: string;
  version: string;
  dev: boolean;
}

export interface InstallScriptReport {
  readable: boolean;
  approved: InstallScriptPackage[];
  unapproved: InstallScriptPackage[];
}

export function classifyInstallScripts(
  raw: string | null,
  register: Record<string, InstallScriptEntry> = INSTALL_SCRIPT_REGISTER
): InstallScriptReport {
  if (!raw || !raw.trim()) return { readable: false, approved: [], unapproved: [] };

  let parsed: { name?: string; version?: string; dev?: boolean }[];
  try {
    parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { readable: false, approved: [], unapproved: [] };
  } catch {
    return { readable: false, approved: [], unapproved: [] };
  }

  const packages: InstallScriptPackage[] = parsed
    .filter((entry): entry is { name: string; version?: string; dev?: boolean } =>
      typeof entry.name === "string"
    )
    .map((entry) => ({
      name: entry.name,
      version: entry.version ?? "unknown",
      dev: entry.dev === true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    readable: true,
    approved: packages.filter((pkg) => pkg.name in register),
    unapproved: packages.filter((pkg) => !(pkg.name in register)),
  };
}

export interface LockfileReport {
  readable: boolean;
  version: number | null;
  /** Entries that correspond to a downloadable tarball. */
  installable: number | null;
  /** How many of those carry a Subresource-Integrity hash. */
  hashed: number | null;
  /** Entries resolved from somewhere other than the public npm registry. */
  nonRegistry: number | null;
}

const UNREADABLE_LOCKFILE: LockfileReport = {
  readable: false,
  version: null,
  installable: null,
  hashed: null,
  nonRegistry: null,
};

const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

/**
 * Whether `npm ci` can actually verify what it downloads.
 *
 * An entry with no `integrity` field is installed on the strength of the
 * registry's response alone — nothing pins the bytes. The ratio of hashed to
 * installable entries is the reading that matters; a raw count of either on
 * its own says very little.
 *
 * The root entry and `link: true` workspace entries are excluded because
 * neither has a tarball to hash, and counting them would make a healthy
 * lockfile look partly unverified.
 */
export function lockfileIntegrity(raw: string | null): LockfileReport {
  if (!raw || !raw.trim()) return UNREADABLE_LOCKFILE;

  let parsed: { lockfileVersion?: number; packages?: Record<string, { link?: boolean; integrity?: string; resolved?: string }> };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return UNREADABLE_LOCKFILE;
  }
  if (!parsed.packages || typeof parsed.packages !== "object") return UNREADABLE_LOCKFILE;

  const entries = Object.entries(parsed.packages).filter(
    ([path, entry]) => path !== "" && entry.link !== true
  );

  return {
    readable: true,
    version: typeof parsed.lockfileVersion === "number" ? parsed.lockfileVersion : null,
    installable: entries.length,
    hashed: entries.filter(([, entry]) => typeof entry.integrity === "string").length,
    nonRegistry: entries.filter(
      ([, entry]) => typeof entry.resolved === "string" && !entry.resolved.startsWith(PUBLIC_REGISTRY)
    ).length,
  };
}

/**
 * Direct dependencies present now that were absent last run. New surface,
 * whether or not anything has been reported against it yet. A baseline run
 * has no previous list and returns empty rather than calling everything new.
 */
export function newDirectDependencies(current: string[], previous: string[] | null): string[] {
  if (previous === null) return [];
  const before = new Set(previous);
  return current.filter((name) => !before.has(name)).sort();
}

const CHECK_WIDTH = 30;
const READING_WIDTH = 22;
const STATE_WIDTH = 12;
const RULE_WIDTH = CHECK_WIDTH + READING_WIDTH + STATE_WIDTH;

/** An unmeasured value is "not read". Never a zero. */
const reading = (value: number | null, suffix = ""): string =>
  value === null ? "not read" : `${value}${suffix}`;

export function renderSupplyChainTable(
  audit: AuditSummary,
  installScripts: InstallScriptReport,
  lockfile: LockfileReport
): string {
  const header =
    "CHECK".padEnd(CHECK_WIDTH) + "READING".padEnd(READING_WIDTH) + "STATE".padEnd(STATE_WIDTH);

  const rows: [string, string, string][] = [
    [
      "Advisories (total)",
      reading(audit.counts?.total ?? null),
      !audit.readable ? "not read" : audit.counts!.total === 0 ? "ok" : "review",
    ],
    [
      "Advisories (high/critical)",
      reading(audit.counts ? audit.counts.high + audit.counts.critical : null),
      !audit.readable ? "not read" : audit.counts!.high + audit.counts!.critical === 0 ? "ok" : "gap",
    ],
    [
      "Direct deps with advisory",
      audit.readable ? String(audit.directAdvisories.length) : "not read",
      !audit.readable ? "not read" : audit.directAdvisories.length === 0 ? "ok" : "review",
    ],
    [
      "Install-script packages",
      installScripts.readable
        ? String(installScripts.approved.length + installScripts.unapproved.length)
        : "not read",
      !installScripts.readable ? "not read" : "—",
    ],
    [
      "Unapproved install scripts",
      installScripts.readable ? String(installScripts.unapproved.length) : "not read",
      !installScripts.readable ? "not read" : installScripts.unapproved.length === 0 ? "ok" : "gap",
    ],
    [
      "Lockfile entries hashed",
      lockfile.readable ? `${lockfile.hashed}/${lockfile.installable}` : "not read",
      !lockfile.readable
        ? "not read"
        : lockfile.hashed === lockfile.installable
          ? "ok"
          : "review",
    ],
    [
      "Non-registry resolutions",
      reading(lockfile.nonRegistry),
      !lockfile.readable ? "not read" : lockfile.nonRegistry === 0 ? "ok" : "review",
    ],
  ];

  const body = rows.map(
    ([check, value, state]) =>
      check.padEnd(CHECK_WIDTH) + value.padEnd(READING_WIDTH) + state.padEnd(STATE_WIDTH)
  );

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function supplyChainSummaryLine(
  audit: AuditSummary,
  installScripts: InstallScriptReport
): string {
  const advisories = audit.readable ? `${audit.counts!.total} advisories` : "advisories not read";
  if (!installScripts.readable) {
    return `SUPPLY CHAIN  ${advisories} · install scripts not read`;
  }
  const count = installScripts.unapproved.length;
  const noun = count === 1 ? "unapproved install script" : "unapproved install scripts";
  return `SUPPLY CHAIN  ${advisories} · ${count} ${noun}`;
}
