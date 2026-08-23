/**
 * Secrets posture: is anything that must stay on the server reachable from
 * the browser bundle?
 *
 * The naming half is easy — NEXT_PUBLIC_* is inlined at build time, so a
 * secret wearing that prefix is published by definition. The half that
 * actually bites is a server-only variable read from a module some client
 * component imports, because the bundler follows that import and ships the
 * module's source to the browser along with it. Answering that needs an
 * import closure rooted at every "use client" file, which is what
 * clientReachable builds.
 *
 * Everything here is pure. The closure is computed from a map of module path
 * to source that the collector assembles; specifier resolution is done
 * against a set of known module paths rather than by guessing extensions, so
 * an unresolvable import is simply not followed instead of inventing a file
 * that does not exist.
 *
 * A variable used in code but absent from ENV_CLASS is UNCLASSIFIED and is
 * always an issue — the same "cannot pass by being unknown" rule as
 * TABLE_DATA_CLASS and ROUTE_EXPECTATIONS.
 */

export type SecretClass = "PUBLIC_OK" | "SERVER_ONLY";

/**
 * What each environment variable is allowed to be.
 *
 * PUBLIC_OK   — safe in the browser bundle. Publishable keys, NODE_ENV, and
 *               platform-set values that carry no authority.
 * SERVER_ONLY — grants authority: signs a cookie, spends money, or bypasses
 *               RLS. Never acceptable in a client-reachable module.
 *
 * The standing assertion in the test file fails if the repository reads a
 * variable that has no entry here.
 */
export const ENV_CLASS: Record<string, SecretClass> = {
  NEXT_PUBLIC_SUPABASE_URL: "PUBLIC_OK",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "PUBLIC_OK",
  NODE_ENV: "PUBLIC_OK",
  NODE_OPTIONS: "PUBLIC_OK",

  SUPABASE_SERVICE_ROLE_KEY: "SERVER_ONLY",
  ADMIN_PASSWORD: "SERVER_ONLY",
  ADMIN_SESSION_SECRET: "SERVER_ONLY",
  DEVICE_COOKIE_SECRET: "SERVER_ONLY",
  PAYMONGO_SECRET_KEY: "SERVER_ONLY",
  PAYMONGO_WEBHOOK_SECRET: "SERVER_ONLY",
  RESEND_API_KEY: "SERVER_ONLY",
  CRON_SECRET: "SERVER_ONLY",

  // Flags rather than secrets, but server-only all the same: each one changes
  // what the server will do, and none of them should be settable or readable
  // from the browser.
  PAYMONGO_LIVEMODE: "SERVER_ONLY",
  UNLOCK_ALL: "SERVER_ONLY",
  PROFILE_STORE: "SERVER_ONLY",
};

export interface EnvDeclaration {
  name: string;
  /** True when the line is commented out — declared but optional. */
  commented: boolean;
}

const DECLARATION = /^\s*(?:#\s*)?([A-Z][A-Z0-9_]*)\s*=/;

export function parseEnvExample(text: string): EnvDeclaration[] {
  const declarations: EnvDeclaration[] = [];
  for (const line of text.split("\n")) {
    const match = DECLARATION.exec(line);
    if (!match) continue;
    declarations.push({ name: match[1], commented: line.trimStart().startsWith("#") });
  }
  return declarations;
}

/** Environment variable names a module reads, deduplicated and sorted. */
export function scanEnvUsage(source: string): string[] {
  const found = new Set<string>();
  for (const match of source.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) found.add(match[1]);
  for (const match of source.matchAll(/process\.env\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\]/g)) {
    found.add(match[1]);
  }
  return [...found].sort();
}

/**
 * Every module specifier a source file imports at runtime, in source order.
 *
 * `import type` / `export type` are excluded on purpose: TypeScript erases
 * them at emit, so no bundler ever follows them and nothing they name reaches
 * the browser. Counting them as edges made the closure report a whole server
 * module as client-shipped because a client component imported one type from
 * it — a standing false exposure. An inline `type` binding inside a value
 * import is a real edge and stays.
 */
export function parseImports(source: string): string[] {
  const specifiers: string[] = [];
  for (const match of source.matchAll(/(?:^|\s)import\s+(?!type\b)[\s\S]*?from\s*["']([^"']+)["']/g)) {
    specifiers.push(match[1]);
  }
  for (const match of source.matchAll(/(?:^|\s)export\s+(?!type\b)[\s\S]*?from\s*["']([^"']+)["']/g)) {
    specifiers.push(match[1]);
  }
  for (const match of source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)) {
    specifiers.push(match[1]);
  }
  for (const match of source.matchAll(/(?:^|\s)import\s+["']([^"']+)["']/g)) {
    specifiers.push(match[1]);
  }
  return [...new Set(specifiers)];
}

const CANDIDATE_SUFFIXES = ["", ".ts", ".tsx", ".mjs", "/index.ts", "/index.tsx"];

/**
 * A repo-relative module path for `specifier` as imported from `fromFile`, or
 * null when it resolves outside the known set.
 *
 * Resolution is against `known` rather than the filesystem, which keeps this
 * pure and means a bare package specifier — or a path that does not exist —
 * returns null instead of a plausible-looking guess. Not following an import
 * can only ever shrink the client closure, and a shrunken closure produces a
 * missed finding rather than a false one.
 */
export function resolveSpecifier(
  fromFile: string,
  specifier: string,
  known: Set<string>
): string | null {
  let base: string;
  if (specifier.startsWith("@/")) {
    base = specifier.slice(2);
  } else if (specifier.startsWith(".")) {
    const segments = fromFile.split("/").slice(0, -1);
    for (const part of specifier.split("/")) {
      if (part === "." || part === "") continue;
      if (part === "..") segments.pop();
      else segments.push(part);
    }
    base = segments.join("/");
  } else {
    return null;
  }

  for (const suffix of CANDIDATE_SUFFIXES) {
    if (known.has(`${base}${suffix}`)) return `${base}${suffix}`;
  }
  return null;
}

const USE_CLIENT = /^\s*["']use client["']/m;
const USE_SERVER = /^\s*["']use server["']/m;

/**
 * Every module the browser bundle can reach: the "use client" entry points
 * and everything they import, transitively. Visited-set guarded, so an import
 * cycle terminates rather than hanging the collector.
 *
 * An import into a `"use server"` module is not followed. Next.js compiles
 * such an import to an endpoint reference — the action's source never ships
 * to the browser, so nothing it reads reaches the client either. Following
 * that edge reported every variable a server-actions file read as
 * client-reachable: a permanent false P0, which is precisely the alarm this
 * department cannot afford to raise. The genuine hole on this boundary is a
 * value read on the server and passed to a client component as a prop; that
 * is a data flow, not an import edge, and it is named in the plan as out of
 * scope for a static closure.
 */
export function clientReachable(modules: Record<string, string>): Set<string> {
  const known = new Set(Object.keys(modules));
  const reached = new Set<string>();
  const queue = Object.keys(modules).filter((file) => USE_CLIENT.test(modules[file]));

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (reached.has(file)) continue;
    reached.add(file);

    for (const specifier of parseImports(modules[file] ?? "")) {
      const resolved = resolveSpecifier(file, specifier, known);
      if (!resolved || reached.has(resolved)) continue;
      if (USE_SERVER.test(modules[resolved] ?? "")) continue;
      queue.push(resolved);
    }
  }

  return reached;
}

export type SecretIssueKind =
  | "client-reachable"
  | "public-prefixed"
  | "unclassified"
  | "undocumented"
  | "documented-unused"
  | "env-not-ignored";

export interface SecretIssue {
  kind: SecretIssueKind;
  name: string;
  /** The module the issue was observed in, when it is file-specific. */
  file: string | null;
}

export interface SecretRow {
  name: string;
  secretClass: SecretClass | "UNCLASSIFIED";
  documented: boolean;
  reach: "server" | "CLIENT";
}

export interface SecretsPosture {
  rows: SecretRow[];
  issues: SecretIssue[];
  /** Issues that are real exposure, as opposed to documentation drift. */
  gapCount: number;
}

export interface SecretsInput {
  declared: EnvDeclaration[];
  /** Module path → the variable names it reads. */
  usage: Record<string, string[]>;
  clientFiles: Set<string>;
  /** Result of `git check-ignore` on the real .env files, from the collector. */
  envFilesIgnored: boolean;
  registry?: Record<string, SecretClass>;
}

/** Drift, not exposure. Counted separately so it can never inflate a severity. */
const NON_GAP_KINDS: SecretIssueKind[] = ["documented-unused"];

export function assessSecrets({
  declared,
  usage,
  clientFiles,
  envFilesIgnored,
  registry = ENV_CLASS,
}: SecretsInput): SecretsPosture {
  const declaredNames = new Set(declared.map((entry) => entry.name));
  const issues: SecretIssue[] = [];

  // name → the client-reachable file that reads it, if any.
  const readers = new Map<string, string[]>();
  for (const [file, names] of Object.entries(usage)) {
    for (const name of names) {
      readers.set(name, [...(readers.get(name) ?? []), file]);
    }
  }

  const rows: SecretRow[] = [];
  for (const name of [...readers.keys()].sort()) {
    // Membership, not a lookup-then-compare: Record's index signature claims
    // every key exists, so comparing the lookup result against the fallback
    // literal is a type error. `in` is also exactly the question.
    const registered = name in registry;
    const secretClass: SecretClass | "UNCLASSIFIED" = registered ? registry[name] : "UNCLASSIFIED";
    const files = readers.get(name) ?? [];
    const clientFile = files.find((file) => clientFiles.has(file)) ?? null;

    rows.push({
      name,
      secretClass,
      documented: declaredNames.has(name),
      reach: clientFile ? "CLIENT" : "server",
    });

    if (!registered) {
      issues.push({ kind: "unclassified", name, file: files[0] ?? null });
    }
    if (secretClass === "SERVER_ONLY" && clientFile) {
      issues.push({ kind: "client-reachable", name, file: clientFile });
    }
    if (secretClass === "SERVER_ONLY" && name.startsWith("NEXT_PUBLIC_")) {
      // The prefix alone publishes it; whether a client file reads it is moot.
      issues.push({ kind: "public-prefixed", name, file: null });
    }
    if (!declaredNames.has(name)) {
      issues.push({ kind: "undocumented", name, file: files[0] ?? null });
    }
  }

  for (const entry of declared) {
    if (!readers.has(entry.name)) {
      issues.push({ kind: "documented-unused", name: entry.name, file: ".env.example" });
    }
  }

  if (!envFilesIgnored) {
    issues.push({ kind: "env-not-ignored", name: ".env*", file: ".gitignore" });
  }

  const gapCount = issues.filter((issue) => !NON_GAP_KINDS.includes(issue.kind)).length;
  return { rows, issues, gapCount };
}

const NAME_WIDTH = 38;
const CLASS_WIDTH = 14;
const DOCUMENTED_WIDTH = 12;
const REACH_WIDTH = 8;
const RULE_WIDTH = NAME_WIDTH + CLASS_WIDTH + DOCUMENTED_WIDTH + REACH_WIDTH;

export function renderSecretsTable(posture: SecretsPosture): string {
  const header =
    "VARIABLE".padEnd(NAME_WIDTH) +
    "CLASS".padEnd(CLASS_WIDTH) +
    "DOCUMENTED".padEnd(DOCUMENTED_WIDTH) +
    "REACH".padEnd(REACH_WIDTH);

  const body = posture.rows.map(
    (row) =>
      row.name.padEnd(NAME_WIDTH) +
      row.secretClass.padEnd(CLASS_WIDTH) +
      (row.documented ? "yes" : "NO").padEnd(DOCUMENTED_WIDTH) +
      row.reach.padEnd(REACH_WIDTH)
  );

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function secretsSummaryLine(posture: SecretsPosture): string {
  const noun = posture.rows.length === 1 ? "variable" : "variables";
  const clientReachableCount = posture.issues.filter(
    (issue) => issue.kind === "client-reachable"
  ).length;
  const ignored = posture.issues.some((issue) => issue.kind === "env-not-ignored")
    ? ".env NOT ignored"
    : ".env ignored";

  if (clientReachableCount === 0) {
    return `SECRETS       ${posture.rows.length} ${noun} · none client-reachable · ${ignored}`;
  }
  // Counts only. Which variable leaked is exactly the detail that belongs in
  // the private report and nowhere else.
  return `SECRETS       ${posture.rows.length} ${noun} · ${clientReachableCount} client-reachable · ${ignored}`;
}
