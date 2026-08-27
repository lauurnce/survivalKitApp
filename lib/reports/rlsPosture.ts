/**
 * RLS posture: does a policy actually constrain, given what the table holds?
 *
 * "using (true) is not a policy" is true only relative to the data. On the
 * public course catalogue it is exactly right — the product serves that to
 * anonymous visitors deliberately. Flagging it every week would bury the one
 * table where it matters, and a report that cries wolf is one the reader
 * stops opening. So the judgement needs a human-written answer to "what does
 * this table hold", which is TABLE_DATA_CLASS.
 *
 * A table absent from the registry is UNREGISTERED and always rates `review`.
 * A new table must not be able to pass by being unknown — that is the charter's
 * "tracks new tables shipped without protection", and it is also why
 * rlsPosture.test.ts asserts the registry covers the real migrations.
 */

import type { PolicyRecord, TableRecord } from "./migrationSchema";

export type DataClass = "PUBLIC_REFERENCE" | "USER_DATA" | "SERVER_ONLY";

/**
 * Roles reachable with the publishable key that ships in the client bundle.
 * `public` is included because a policy with no `to` clause applies to it,
 * and `anon` is a member of `public`.
 */
export const PUBLIC_ROLES: readonly string[] = ["anon", "public"];

/**
 * What each table holds. Written once by a human; the standing assertion in
 * the test file fails if a table is ever added without an entry here.
 *
 * PUBLIC_REFERENCE — course catalogue content the product serves to anyone.
 * USER_DATA        — keyed to a person or a device.
 * SERVER_ONLY      — reached exclusively through the service-role key; the
 *                    correct posture is RLS on with no anon policy at all.
 */
export const TABLE_DATA_CLASS: Record<string, DataClass> = {
  years: "PUBLIC_REFERENCE",
  subjects: "PUBLIC_REFERENCE",
  modules: "PUBLIC_REFERENCE",
  sections: "PUBLIC_REFERENCE",
  counters: "PUBLIC_REFERENCE",

  events: "USER_DATA",
  counter_log: "USER_DATA",
  module_progress: "USER_DATA",
  module_quiz_progress: "USER_DATA",
  module_quiz_answers: "USER_DATA",
  subject_quiz_progress: "USER_DATA",
  subject_quiz_answers: "USER_DATA",
  unlocks: "USER_DATA",
  waitlist: "USER_DATA",
  subscriptions: "USER_DATA",
  payments: "USER_DATA",
  profiles: "USER_DATA",
  classes: "USER_DATA",
  class_members: "USER_DATA",
  class_join_requests: "USER_DATA",
  user_feedback: "USER_DATA",
  email_outbox: "USER_DATA",

  api_rate_limits: "SERVER_ONLY",
};

export interface TablePosture {
  table: string;
  dataClass: DataClass | "UNREGISTERED";
  rlsEnabled: boolean;
  /** Policies reachable with the publishable key. */
  anonPolicies: PolicyRecord[];
  /** One line per problem. Empty when the verdict is ok. */
  reasons: string[];
  verdict: "ok" | "review" | "gap";
}

const TRUTHY = /^\(*\s*(true|1\s*=\s*1)\s*\)*$/i;

/** A predicate that admits every row. A missing clause admits every row too. */
export function isUnconstrained(predicate: string | null): boolean {
  if (predicate === null) return true;
  return TRUTHY.test(predicate.trim());
}

function reachableByPublishableKey(policy: PolicyRecord): boolean {
  return policy.roles.some((role) => PUBLIC_ROLES.includes(role));
}

/** The predicate that governs this command, whichever clause carries it. */
function governingPredicate(policy: PolicyRecord): string | null {
  return policy.command === "INSERT" ? policy.withCheck : policy.using ?? policy.withCheck;
}

const READ_OR_MUTATE: PolicyRecord["command"][] = ["SELECT", "UPDATE", "DELETE", "ALL"];

export function assessRls(
  tables: TableRecord[],
  registry: Record<string, DataClass> = TABLE_DATA_CLASS
): TablePosture[] {
  return tables.map((table) => {
    // Membership, not a lookup-then-compare: Record's index signature claims
    // every key exists, so comparing the lookup result against the fallback
    // literal is a type error. `in` is also exactly the question — is this
    // table named in the registry at all.
    const registered = table.name in registry;
    const dataClass: DataClass | "UNREGISTERED" = registered ? registry[table.name] : "UNREGISTERED";
    const anonPolicies = table.policies.filter(reachableByPublishableKey);
    const reasons: string[] = [];
    let verdict: TablePosture["verdict"] = "ok";

    const escalate = (next: TablePosture["verdict"]) => {
      if (next === "gap" || (next === "review" && verdict === "ok")) verdict = next;
    };

    if (!table.rlsEnabledIn) {
      reasons.push("RLS not enabled");
      escalate("gap");
    }

    if (!registered) {
      reasons.push("table not in TABLE_DATA_CLASS");
      escalate("review");
    }

    for (const policy of anonPolicies) {
      const unconstrained = isUnconstrained(governingPredicate(policy));

      if (dataClass === "SERVER_ONLY") {
        reasons.push(`anon policy ${policy.name} on a server-only table`);
        escalate("review");
        continue;
      }

      if (!unconstrained) continue;

      if (dataClass === "USER_DATA" && READ_OR_MUTATE.includes(policy.command)) {
        // Reads and mutations admitting every row are exposure.
        reasons.push(`${policy.command} unconstrained for anon (${policy.name})`);
        escalate("gap");
      } else if (dataClass === "USER_DATA") {
        // Unconstrained INSERT is a write-abuse surface, not exposure. Real,
        // but a different severity — saying so is the difference between a
        // useful report and an alarming one.
        reasons.push(`INSERT unconstrained for anon (${policy.name})`);
        escalate("review");
      }
      // PUBLIC_REFERENCE with an unconstrained SELECT is the design.
    }

    return { table: table.name, dataClass, rlsEnabled: Boolean(table.rlsEnabledIn), anonPolicies, reasons, verdict };
  });
}

const TABLE_WIDTH = 24;
const CLASS_WIDTH = 18;
const RLS_WIDTH = 5;
const VERDICT_WIDTH = 9;
const RULE_WIDTH = TABLE_WIDTH + CLASS_WIDTH + RLS_WIDTH + VERDICT_WIDTH;

export function renderRlsTable(postures: TablePosture[]): string {
  const header =
    "TABLE".padEnd(TABLE_WIDTH) +
    "CLASS".padEnd(CLASS_WIDTH) +
    "RLS".padEnd(RLS_WIDTH) +
    "VERDICT".padEnd(VERDICT_WIDTH);

  const body = postures.map(
    (posture) =>
      posture.table.padEnd(TABLE_WIDTH) +
      posture.dataClass.padEnd(CLASS_WIDTH) +
      (posture.rlsEnabled ? "on" : "OFF").padEnd(RLS_WIDTH) +
      posture.verdict.padEnd(VERDICT_WIDTH)
  );

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function rlsSummaryLine(postures: TablePosture[]): string {
  const gaps = postures.filter((p) => p.verdict === "gap").length;
  const review = postures.filter((p) => p.verdict === "review").length;
  const clean = postures.length - gaps - review;

  if (gaps === 0 && review === 0) {
    return `RLS           ${clean}/${postures.length} tables clean · no gaps, no review items`;
  }
  return `RLS           ${clean}/${postures.length} tables clean · ${gaps} gap · ${review} review`;
}
