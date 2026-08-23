/**
 * The end-state schema model, replayed from migration files in order.
 *
 * "End state" is the whole point. Two migrations in this repository work by
 * dropping earlier policies before creating tighter replacements, so a model
 * that only accumulates `create policy` describes a database more permissive
 * than the one that exists — and reports a leak that was closed months ago.
 * A false finding costs more than a missed one here, because it is what
 * trains the reader to stop believing the report.
 *
 * Every pattern is case-insensitive on purpose: this repository mixes
 * `alter table … enable row level security` with the fully upper-cased form,
 * and a case-sensitive scan would report several protected tables as having
 * no RLS at all.
 */

import { extractParenthesized, splitSqlStatements } from "./sqlStatements";

export type PolicyCommand = "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";

export interface PolicyRecord {
  name: string;
  table: string;
  command: PolicyCommand;
  /** Postgres defaults to the `public` role when `to` is omitted. */
  roles: string[];
  /** The `using` predicate, verbatim, or null when the clause is absent. */
  using: string | null;
  /** The `with check` predicate, verbatim, or null when absent. */
  withCheck: string | null;
  /** Migration filename this policy's live definition came from. */
  migration: string;
}

export interface TableRecord {
  name: string;
  /** Migration that created it, or null when only ever referenced. */
  createdIn: string | null;
  columns: string[];
  /** Migration that enabled RLS, or null when it never was. */
  rlsEnabledIn: string | null;
  policies: PolicyRecord[];
}

export interface MigrationFile {
  name: string;
  sql: string;
}

const CREATE_TABLE = /^create table (?:if not exists )?(?:public\.)?([a-z0-9_]+)\s*\(/i;
const ADD_COLUMN = /^alter table (?:public\.)?([a-z0-9_]+) add column (?:if not exists )?([a-z0-9_]+)/i;
const ENABLE_RLS = /^alter table (?:public\.)?([a-z0-9_]+) enable row level security/i;
const CREATE_POLICY = /^create policy\s+(?:"([^"]+)"|([a-z0-9_]+))\s+on\s+(?:public\.)?([a-z0-9_]+)\b/i;
const DROP_POLICY = /^drop policy\s+(?:if exists\s+)?(?:"([^"]+)"|([a-z0-9_]+))\s+on\s+(?:public\.)?([a-z0-9_]+)/i;
const FOR_COMMAND = /\bfor\s+(select|insert|update|delete|all)\b/i;
const TO_ROLES = /\bto\s+([a-z0-9_]+(?:\s*,\s*[a-z0-9_]+)*)/i;

/** Splits a create-table body into top-level column definitions. */
function columnNames(statement: string): string[] {
  const open = statement.indexOf("(");
  const body = open === -1 ? null : extractParenthesized(statement, open);
  if (!body) return [];

  const parts: string[] = [];
  let depth = 0;
  let piece = "";
  for (const char of body) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(piece);
      piece = "";
      continue;
    }
    piece += char;
  }
  parts.push(piece);

  const CONSTRAINT_WORDS = new Set([
    "primary",
    "unique",
    "foreign",
    "check",
    "constraint",
    "exclude",
  ]);

  return parts
    .map((part) => /^\s*([a-z0-9_]+)/i.exec(part)?.[1]?.toLowerCase() ?? "")
    .filter((name) => name !== "" && !CONSTRAINT_WORDS.has(name));
}

function parsePolicy(statement: string, migration: string): PolicyRecord | null {
  const head = CREATE_POLICY.exec(statement);
  if (!head) return null;

  const name = head[1] ?? head[2];
  const tableName = head[3].toLowerCase();
  const tail = statement.slice(head[0].length);

  const command = (FOR_COMMAND.exec(tail)?.[1]?.toUpperCase() ?? "ALL") as PolicyCommand;
  const roles = TO_ROLES.exec(tail)
    ? TO_ROLES.exec(tail)![1].split(",").map((role) => role.trim().toLowerCase())
    : ["public"];

  const usingAt = /\busing\s*\(/i.exec(tail);
  const checkAt = /\bwith check\s*\(/i.exec(tail);

  return {
    name,
    table: tableName,
    command,
    roles,
    using: usingAt
      ? extractParenthesized(tail, usingAt.index + usingAt[0].length - 1)
      : null,
    withCheck: checkAt
      ? extractParenthesized(tail, checkAt.index + checkAt[0].length - 1)
      : null,
    migration,
  };
}

export function buildSchema(files: MigrationFile[]): TableRecord[] {
  const tables = new Map<string, TableRecord>();

  const get = (name: string): TableRecord => {
    const key = name.toLowerCase();
    let record = tables.get(key);
    if (!record) {
      record = { name: key, createdIn: null, columns: [], rlsEnabledIn: null, policies: [] };
      tables.set(key, record);
    }
    return record;
  };

  for (const file of files) {
    for (const statement of splitSqlStatements(file.sql)) {
      const created = CREATE_TABLE.exec(statement);
      if (created) {
        const record = get(created[1]);
        if (record.createdIn === null) record.createdIn = file.name;
        for (const column of columnNames(statement)) {
          if (!record.columns.includes(column)) record.columns.push(column);
        }
        continue;
      }

      const added = ADD_COLUMN.exec(statement);
      if (added) {
        const record = get(added[1]);
        const column = added[2].toLowerCase();
        if (!record.columns.includes(column)) record.columns.push(column);
        continue;
      }

      const enabled = ENABLE_RLS.exec(statement);
      if (enabled) {
        const record = get(enabled[1]);
        if (record.rlsEnabledIn === null) record.rlsEnabledIn = file.name;
        continue;
      }

      const dropped = DROP_POLICY.exec(statement);
      if (dropped) {
        const record = get(dropped[3]);
        const name = dropped[1] ?? dropped[2];
        record.policies = record.policies.filter((policy) => policy.name !== name);
        continue;
      }

      const policy = parsePolicy(statement, file.name);
      if (policy) {
        const record = get(policy.table);
        record.policies = record.policies.filter((existing) => existing.name !== policy.name);
        record.policies.push(policy);
      }
    }
  }

  return [...tables.values()].sort((a, b) => a.name.localeCompare(b.name));
}
