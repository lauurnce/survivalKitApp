# Security Department Agent (WARDEN) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Security department agent (WARDEN) — a deterministic collector that reads the repository (never the database), encodes the June 2026 hardening baseline as machine-checked controls, cross-references every API route against the guards it should have, parses every migration for real RLS posture, and an interpreter agent that ranks what it finds with enough severity discipline that the report stays worth reading.

**Architecture:** The same two layers Operations proved and Growth and Finance inherited. `scripts/reports/security.ts` is a deterministic collector: it reads repository source, parses `supabase/migrations/`, shells out to `npm audit --json` and `git check-ignore`, calls pure functions in `lib/reports/` for every judgment that can be made deterministically, renders every table itself, and writes JSON to `docs/reports/security/.data/`. `.claude/agents/warden.md` is the interpreter: it reads that JSON plus the previous report, decides severity, and writes the report. **WARDEN never counts anything and never computes a delta.** Security is the cheap build precisely because it needs no credentials — there is no Supabase client, no RPC, and no network call except `npm audit`.

**Tech Stack:** TypeScript, Node 24, tsx, Vitest, Claude Code subagents. No new npm dependencies. No database access of any kind.

## Global Constraints

- **Node 24.x** — matches `engines` in `package.json`.
- **No new npm dependencies.** SQL parsing is a small tested state machine in `lib/reports/`, not a parser library. Nothing here needs one.
- **The collector is read-only and credential-free.** It opens files, runs `npm audit --json` and `git check-ignore`, and writes one JSON file under `docs/reports/security/.data/`. It never reads `.env.reports.local`, never constructs a Supabase client, and never contacts production. If a future change appears to need credentials, that is a design decision to make on its own, not to smuggle in.
- **Never write an estimate into a metric row.** An unmeasured value is `null` and renders as `not read`. This has a specific and dangerous form here: **a failed `npm audit` must produce `null`, never `0`.** A zero in the advisory row reads as "no known vulnerabilities" — a false all-clear is worse than no reading at all.
- **`docs/reports/` is gitignored in full, permanently.** `docs/reports/security/` needs no new `.gitignore` entry; the existing `docs/reports/` rule already covers it (verified — see Task 12). A security report in a public repo is a published attack surface.
- **This plan file is tracked and public.** No finding, no result value, no exploit path, no payload, and no proof-of-concept appears anywhere in it. Where a real finding was discovered while writing this plan, the plan names the file it lives in and says the detail is withheld. See *Disclosure discipline* below and *What could not be verified* at the end.
- **Manila dates everywhere.** The data file, the report file, and the agent's reads all use `Asia/Manila`. UTC misfiles everything written between midnight and 8am PH.
- **`tsx` transpiles to CommonJS.** `__dirname` works. **Top-level `await` does not** — the collector is fully synchronous and calls `main()` at the bottom, exactly as `scripts/reports/ops.ts` does.
- **Tests colocate with source** as `<name>.test.ts`.
- **Every fixture in every test is synthetic.** Test SQL invents tables (`widgets`, `orders`); test route sources are hand-written strings. No test asserts against a real production value. The standing assertions in Tasks 3, 5 and 8 are the deliberate exception — they read real repository files and assert only structural facts (every table classified, every route classified, every control present), never a value that would be sensitive if published.
- **Commit messages use conventional-commit prefixes** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) and carry **no trailer block** — no `Co-Authored-By` of any kind.
- **Severity labels are exactly** `P0`, `P1`, `P2`, `P3`, `ACCEPTED`. Finding states are exactly `NEW`, `ONGOING`, `CLOSED`.
- **Metric labels must be 30 characters or fewer.** `renderMetricsTable` pads the label column to `LABEL_WIDTH = 30`; a longer label pushes the value columns out of alignment and breaks the table for that row only, which is the kind of cosmetic drift nobody reports. Every label in Task 10 is under the limit.

## Disclosure discipline — read this before writing any code

This department is the one where the usual rule is not enough.

`docs/reports/` being gitignored protects the *reports*. It does not protect the *plan*, the *tests*, or the *agent definition*, all of which are tracked and public. A test fixture that encodes a real weakness as its expected value publishes that weakness. A control record whose `absentMeans` field spells out an exploit publishes the exploit.

Three rules, applied throughout this plan and binding on the implementer:

1. **Tests assert structure, never a live result.** `expect(assessRls(schema)).toHaveLength(3)` against a synthetic fixture is fine. `expect(realPosture.find(t => t.table === "…").verdict).toBe("gap")` is a published finding. The standing assertions assert the *absence* of gaps, which is safe: if they pass they reveal nothing, and if they fail the CI output stays local.
2. **Registries name controls, not weaknesses.** `absentMeans` says what capability is lost ("admin session could be minted without the secret"), never how to do it.
3. **Two real findings were discovered while writing this plan and are deliberately not described here.** One lives in `supabase/migrations/20260623_enable_rls.sql`; one lives in `lib/deleteAccount.ts` together with the identity columns declared across `supabase/migrations/`. Both are within the scope of checks this plan builds — Task 3 and Task 4 respectively — and both will surface automatically on the first WARDEN run. **Their details are withheld from this tracked file pending that first private run.** Do not go looking for them in order to write them down; the collector will produce them, and the private report is where they belong.

## Machinery that already exists — reuse it, do not rebuild it

| Path | What WARDEN uses it for |
|---|---|
| `lib/reports/severity.ts` | `Severity`, `FindingState`, `Finding`, `compareSeverity`, `isEscalation`, `validateFinding`. Unchanged. |
| `lib/reports/metrics.ts` | `Metric`, `diffMetrics`, `renderMetricsTable`. A `null` value renders `not read`. Unchanged. |
| `lib/reports/costLedger.ts` | The `CostEntry` shape appended to `docs/reports/cost-ledger.jsonl`. Unchanged. |
| `lib/reports/runArchive.ts` | `archiveExistingRun` — displaces a same-day re-run to `.data/superseded/`. Unchanged. |
| `lib/reports/previousRun.ts` | `readPreviousRun(outDir, currentFilename)` → `{ key, metrics } \| null`. **Created by the Finance plan, Task 1.** See the dependency note below. |
| `scripts/reports/cost.ts` | `npm run report:cost`, pasted verbatim into the `CUMULATIVE` footer. Unchanged. |

## Plans that must land before this one

**Finance plan Task 1 (`lib/reports/previousRun.ts`) is a hard dependency.** It extracts the previous-run reader out of `scripts/reports/ops.ts` and gives it tests. The Security collector needs identical behaviour and **must not copy it** — a second untested implementation of "what is this delta measured against" is exactly the failure the split architecture exists to prevent. Task 10 Step 1 checks for the file and stops if it is absent.

The build order in the spec is Ops → Growth → Finance → Security, so by the time this plan runs both siblings have landed. If for any reason Finance has not, land its Task 1 alone — it is self-contained and touches nothing else.

**Modules planned by a sibling. Do not re-plan, re-create, or duplicate any of these.**

| Module | Owner | Why Security does not need its own |
|---|---|---|
| `lib/reports/phWeek.ts` | Growth | Security's only date need is the Manila calendar day for the filename, which is one `toLocaleDateString("en-CA", { timeZone: "Asia/Manila" })` call, identical to the one already inline in `scripts/reports/ops.ts`. |
| `lib/reports/phWindow.ts` | Finance | Same. Security has no windowed aggregation — it reads the repo as it is right now. |
| `lib/reports/funnel.ts`, `academicCalendar.ts` | Growth | No behavioural data in this department. |
| `lib/reports/reportsEnv.ts`, `scripts/reports/supabaseAdmin.ts` | Growth | **Security deliberately takes no credentials.** Importing a credential loader would give the collector a capability it must not have. |
| `lib/reports/rowCap.ts`, `scripts/reports/supabaseClient.ts` | Finance | No Supabase client here at all. |
| `lib/reports/blockPrice.ts`, `ledgerIntegrity.ts`, `billingSignals.ts`, `revenueRecognition.ts`, `unitEconomics.ts` | Finance | Payment *integrity* here means signature, replay, and mode-matching **controls in code** (Task 8). Payment *reconciliation* — whether the money and the entitlements agree — is Finance's, and duplicating it would produce two numbers with one source. |
| `lib/reports/previousRun.ts` | Finance | Consumed as-is. See above. |

## File Structure

| Path | Responsibility |
|---|---|
| `lib/reports/sqlStatements.ts` (+ `.test.ts`) | Splits SQL into statements, surviving dollar-quoted function bodies and quoted strings. Balanced-paren extraction. Pure. |
| `lib/reports/migrationSchema.ts` (+ `.test.ts`) | Builds the schema model from migration files in order: tables, columns, RLS flags, policies with roles/commands/predicates, drop-then-create replay. Pure. |
| `lib/reports/rlsPosture.ts` (+ `.test.ts`) | The data-class registry and the posture verdict. Decides whether a policy actually constrains. Renders the RLS table. Pure. |
| `lib/reports/privacyPosture.ts` (+ `.test.ts`) | Identity-column inventory, the deliberate-retention register, and erasure residue. Renders the privacy table. Pure. |
| `lib/reports/routeGuards.ts` (+ `.test.ts`) | Guard signal registry, per-route classification, the expectation registry, the cross-reference matrix, rate-limit scope, middleware matcher coverage, cookie scope. Renders the route table. Pure. |
| `lib/reports/secretsPosture.ts` (+ `.test.ts`) | `.env.example` versus real `process.env` usage in both directions, `NEXT_PUBLIC_` classification, client-reachability. Renders the secrets table. Pure. |
| `lib/reports/supplyChain.ts` (+ `.test.ts`) | `npm audit --json` summarisation, the approved-install-script register, lockfile integrity. Renders the supply-chain table. Pure. |
| `lib/reports/securityBaseline.ts` (+ `.test.ts`) | The June 2026 baseline transcribed as machine-checked controls, plus the identity/execution/payment/business-logic controls added since. Provenance-locked to the baseline plan file. Renders the baseline table. Pure. |
| `lib/reports/detectionCoverage.ts` (+ `.test.ts`) | Sub-function 11: for each P0 escalation, what signal would show it. Renders the detection table. Pure. |
| `scripts/reports/security.ts` | The Security collector. Reads the repo, calls all of the above, renders, writes JSON. |
| `.claude/agents/warden.md` | The WARDEN interpreter agent definition. |
| `docs/reports/security/README.md` | Gitignored. Standing open items and the department's own conventions. |

`lib/reports/` stays pure and testable: every module above takes strings and structures in and returns structures and rendered text out. Every `readFileSync`, `execFileSync` and directory walk lives in `scripts/reports/security.ts`. That boundary is what lets the whole department be tested without a repository fixture on disk.

**Not planned here, by instruction:** `.claude/skills/report/SKILL.md` gets the `security` routing row, and `package.json` gets `"report:security": "tsx scripts/reports/security.ts"`, in a single central integration pass covering all three new departments. This plan does not touch either file. Until that pass lands, the collector runs as `npx tsx scripts/reports/security.ts`, and `.claude/agents/warden.md` (Task 11) names both forms.

## Sub-function coverage

All eleven from the charter, so nothing is quietly dropped.

| # | Sub-function | Where |
|---|---|---|
| 1 | Application security | Task 5 — route-guard cross-reference |
| 2 | Database and RLS posture | Tasks 1, 2, 3 |
| 3 | Identity and session security | Task 8 (`IDENTITY` control group), Task 5 (cookie scope) |
| 4 | Secrets management | Task 6 |
| 5 | Supply chain | Task 7 |
| 6 | Sandbox and code execution | Task 8 (`EXECUTION` control group and the executor inventory) |
| 7 | Payment integrity | Task 8 (`PAYMENT` control group), Task 5 (signature guard column) |
| 8 | Business-logic abuse | Task 8 (`BUSINESS` control group) |
| 9 | Abuse and rate limiting | Task 5 — rate-limit column and shared-versus-per-instance scope |
| 10 | Privacy and data protection | Task 4 |
| 11 | Detection coverage | Task 9 |

---

### Task 1: SQL statement splitting

**Files:**
- Create: `lib/reports/sqlStatements.ts`
- Test: `lib/reports/sqlStatements.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `splitSqlStatements(sql: string): string[]`, `extractParenthesized(text: string, openIndex: number): string | null`.

Everything in Tasks 2–4 stands on this. The naive approach — `sql.split(";")` — is wrong in a way that fails silently and dangerously: `supabase/migrations/` contains `plpgsql` function bodies wrapped in `$$ … $$` that are full of semicolons. Splitting on `;` shreds one function body into a dozen fragments, and a fragment can begin with words that the policy parser in Task 2 will happily match. A schema model built on shredded input under-reports RLS coverage, which produces a false finding, which is the crying-wolf failure this department exists to avoid.

`splitSqlStatements` therefore walks the text with a small state machine: it skips `--` line comments and `/* */` block comments, passes through single-quoted strings including the `''` escape, and treats `$tag$ … $tag$` as opaque. Each returned statement has its whitespace normalised to single spaces and its trailing semicolon removed, so Task 2's regexes never need to care about line breaks.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/sqlStatements.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { splitSqlStatements, extractParenthesized } from "./sqlStatements";

describe("splitSqlStatements", () => {
  it("splits plain statements and strips the trailing semicolon", () => {
    expect(splitSqlStatements("select 1; select 2;")).toEqual(["select 1", "select 2"]);
  });

  it("normalises newlines and runs of whitespace to single spaces", () => {
    const sql = `create policy "p"\n  on widgets\n  for select to anon\n  using (true);`;
    expect(splitSqlStatements(sql)).toEqual([
      `create policy "p" on widgets for select to anon using (true)`,
    ]);
  });

  it("drops a trailing fragment that is only whitespace", () => {
    expect(splitSqlStatements("select 1;\n\n")).toEqual(["select 1"]);
  });

  it("keeps a final statement that has no trailing semicolon", () => {
    expect(splitSqlStatements("select 1")).toEqual(["select 1"]);
  });

  it("removes line comments without eating the statement", () => {
    const sql = "-- a comment\nselect 1; -- trailing\nselect 2;";
    expect(splitSqlStatements(sql)).toEqual(["select 1", "select 2"]);
  });

  it("removes block comments", () => {
    expect(splitSqlStatements("select /* inline */ 1;")).toEqual(["select 1"]);
  });

  it("does not split on a semicolon inside a single-quoted string", () => {
    const sql = "insert into widgets (note) values ('a;b');";
    expect(splitSqlStatements(sql)).toEqual(["insert into widgets (note) values ('a;b')"]);
  });

  it("survives the doubled-quote escape inside a string", () => {
    const sql = "insert into widgets (note) values ('it''s; fine');";
    expect(splitSqlStatements(sql)).toEqual([
      "insert into widgets (note) values ('it''s; fine')",
    ]);
  });

  it("does not treat a double dash inside a string as a comment", () => {
    const sql = "insert into widgets (note) values ('a -- b');";
    expect(splitSqlStatements(sql)).toEqual(["insert into widgets (note) values ('a -- b')"]);
  });

  it("keeps a dollar-quoted function body as ONE statement", () => {
    const sql = `
      create function f() returns void language plpgsql as $$
      begin
        insert into widgets values (1);
        update widgets set n = 2;
      end;
      $$;
      alter table widgets enable row level security;
    `;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain("insert into widgets values (1)");
    expect(statements[0]).toContain("update widgets set n = 2");
    expect(statements[1]).toBe("alter table widgets enable row level security");
  });

  it("handles a tagged dollar quote", () => {
    const sql = `create function f() as $body$ select 1; select 2; $body$; select 3;`;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[1]).toBe("select 3");
  });

  it("keeps comments that live inside a dollar-quoted body", () => {
    const sql = `create function f() as $$ -- kept\n select 1; $$;`;
    expect(splitSqlStatements(sql)[0]).toContain("-- kept");
  });

  it("returns an empty array for input that is only comments", () => {
    expect(splitSqlStatements("-- nothing here\n/* nor here */\n")).toEqual([]);
  });
});

describe("extractParenthesized", () => {
  it("returns the contents of a simple group", () => {
    expect(extractParenthesized("using (device_id = 'x')", 6)).toBe("device_id = 'x'");
  });

  it("balances nested parentheses", () => {
    expect(extractParenthesized("using (char_length(name) <= (10 + 2))", 6)).toBe(
      "char_length(name) <= (10 + 2)"
    );
  });

  it("ignores parentheses inside a quoted string", () => {
    expect(extractParenthesized("using (note = ')')", 6)).toBe("note = ')'");
  });

  it("returns null when the group never closes", () => {
    expect(extractParenthesized("using (unclosed", 6)).toBeNull();
  });

  it("returns null when openIndex is not an open paren", () => {
    expect(extractParenthesized("using (x)", 0)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/sqlStatements.test.ts`
Expected: FAIL — cannot resolve `./sqlStatements`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/sqlStatements.ts`:

```typescript
/**
 * Statement-level SQL splitting for migration analysis.
 *
 * The obvious implementation — sql.split(";") — is wrong here in a way that
 * fails quietly. supabase/migrations/ contains plpgsql bodies wrapped in
 * `$$ … $$` that are full of semicolons, and splitting on those shreds one
 * function into fragments. A fragment can start with words the policy parser
 * matches, so the schema model ends up describing policies that do not exist
 * and missing ones that do. A security report built on that is confidently
 * wrong, which is worse than having no report.
 *
 * So: a small state machine that knows about line comments, block comments,
 * single-quoted strings with the '' escape, and dollar quotes with optional
 * tags. Comments *inside* a dollar-quoted body are preserved, because there
 * they are part of the function source rather than commentary about it.
 */

/** True when `text` at `i` opens a dollar quote; returns the full tag. */
function dollarTagAt(text: string, i: number): string | null {
  const match = /^\$[a-zA-Z_][a-zA-Z0-9_]*\$|^\$\$/.exec(text.slice(i));
  return match ? match[0] : null;
}

/** Index just past the closing quote of the single-quoted string at `i`. */
function endOfQuotedString(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === "'") {
      // A doubled quote is an escaped quote, not the end of the string.
      if (text[j + 1] === "'") {
        j += 2;
        continue;
      }
      return j + 1;
    }
    j += 1;
  }
  return text.length;
}

function normalize(fragment: string): string {
  return fragment.replace(/\s+/g, " ").trim();
}

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    const statement = normalize(buffer);
    if (statement) statements.push(statement);
    buffer = "";
  };

  while (i < sql.length) {
    const tag = dollarTagAt(sql, i);
    if (tag) {
      const close = sql.indexOf(tag, i + tag.length);
      const end = close === -1 ? sql.length : close + tag.length;
      // Copied through verbatim: whatever is in here is function source, not
      // SQL we are parsing, and its semicolons are not statement boundaries.
      buffer += sql.slice(i, end);
      i = end;
      continue;
    }

    if (sql.startsWith("--", i)) {
      const newline = sql.indexOf("\n", i);
      i = newline === -1 ? sql.length : newline;
      // Replace the comment with a space so `select 1--c\n+2` cannot fuse.
      buffer += " ";
      continue;
    }

    if (sql.startsWith("/*", i)) {
      const close = sql.indexOf("*/", i + 2);
      i = close === -1 ? sql.length : close + 2;
      buffer += " ";
      continue;
    }

    if (sql[i] === "'") {
      const end = endOfQuotedString(sql, i);
      buffer += sql.slice(i, end);
      i = end;
      continue;
    }

    if (sql[i] === ";") {
      flush();
      i += 1;
      continue;
    }

    buffer += sql[i];
    i += 1;
  }

  flush();
  return statements;
}

/**
 * Contents of the balanced parenthesis group opening at `openIndex`, or null
 * when the group never closes or `openIndex` is not "(". Quoted strings are
 * skipped so a ")" inside one does not close the group early — RLS predicates
 * such as `note = ')'` are legal and would otherwise truncate.
 */
export function extractParenthesized(text: string, openIndex: number): string | null {
  if (text[openIndex] !== "(") return null;

  let depth = 0;
  let i = openIndex;
  while (i < text.length) {
    const char = text[i];
    if (char === "'") {
      i = endOfQuotedString(text, i);
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return text.slice(openIndex + 1, i).trim();
    }
    i += 1;
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/sqlStatements.test.ts`
Expected: PASS — 18 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/sqlStatements.ts lib/reports/sqlStatements.test.ts
git commit -m "feat(reports): split SQL statements without shredding function bodies"
```

---

### Task 2: Migration schema model

**Files:**
- Create: `lib/reports/migrationSchema.ts`
- Test: `lib/reports/migrationSchema.test.ts`

**Interfaces:**
- Consumes: `splitSqlStatements`, `extractParenthesized` from `lib/reports/sqlStatements.ts`.
- Produces: `PolicyCommand`, `PolicyRecord`, `TableRecord`, `MigrationFile`, `buildSchema(files: MigrationFile[]): TableRecord[]`.

Migrations are replayed in filename order and the model is the *end state*, not the union of everything ever written. That matters because `20260623_enable_rls.sql` and `20260624140000_tighten_anon_select_policies.sql` both work by dropping earlier policies before creating tighter ones. A model that ignores `drop policy` reports policies that no longer exist and would rate the database more permissive than it is — a false finding.

Two parsing rules that are easy to get wrong and are tested explicitly:

- **Case-insensitivity everywhere.** The repository mixes `alter table … enable row level security` and `ALTER TABLE … ENABLE ROW LEVEL SECURITY` across files. A case-sensitive scan reports several tables as having no RLS at all. That is a fabricated P0.
- **Roles default to `public` and commands default to `ALL`** when the `to` or `for` clause is absent, because that is what Postgres does. Defaulting to something narrower would make an over-broad policy look scoped.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/migrationSchema.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildSchema, type MigrationFile } from "./migrationSchema";

const file = (name: string, sql: string): MigrationFile => ({ name, sql });
const table = (schema: ReturnType<typeof buildSchema>, name: string) =>
  schema.find((t) => t.name === name);

describe("buildSchema", () => {
  it("records a created table and its columns", () => {
    const schema = buildSchema([
      file(
        "001_init.sql",
        `create table if not exists widgets (
           id uuid primary key,
           device_id text not null,
           label text
         );`
      ),
    ]);
    expect(table(schema, "widgets")?.createdIn).toBe("001_init.sql");
    expect(table(schema, "widgets")?.columns).toEqual(["id", "device_id", "label"]);
  });

  it("strips a public. prefix from the table name", () => {
    const schema = buildSchema([file("a.sql", "create table public.widgets (id uuid);")]);
    expect(table(schema, "widgets")).toBeDefined();
  });

  it("adds columns from a later alter table", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "alter table widgets add column if not exists user_id uuid;"),
    ]);
    expect(table(schema, "widgets")?.columns).toEqual(["id", "user_id"]);
  });

  it("records RLS enablement regardless of case", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;"),
    ]);
    expect(table(schema, "widgets")?.rlsEnabledIn).toBe("b.sql");
  });

  it("leaves rlsEnabledIn null when RLS is never enabled", () => {
    const schema = buildSchema([file("a.sql", "create table widgets (id uuid);")]);
    expect(table(schema, "widgets")?.rlsEnabledIn).toBeNull();
  });

  it("parses a policy's name, command, roles and using predicate", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file(
        "b.sql",
        `create policy "widgets_read" on widgets
           for select to anon
           using (device_id = current_setting('app.device_id', true));`
      ),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.name).toBe("widgets_read");
    expect(policy.command).toBe("SELECT");
    expect(policy.roles).toEqual(["anon"]);
    expect(policy.using).toBe("device_id = current_setting('app.device_id', true)");
    expect(policy.withCheck).toBeNull();
    expect(policy.migration).toBe("b.sql");
  });

  it("parses an unquoted policy name and a with check clause", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy widgets_insert on widgets for insert to anon with check (true);"),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.name).toBe("widgets_insert");
    expect(policy.command).toBe("INSERT");
    expect(policy.withCheck).toBe("true");
    expect(policy.using).toBeNull();
  });

  it("defaults the command to ALL and the role to public when unstated", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy widgets_all on widgets using (true);"),
    ]);
    const [policy] = table(schema, "widgets")!.policies;
    expect(policy.command).toBe("ALL");
    expect(policy.roles).toEqual(["public"]);
  });

  it("parses several roles", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy p on widgets for select to anon, authenticated using (true);"),
    ]);
    expect(table(schema, "widgets")![0 as never]).toBeUndefined();
    expect(table(schema, "widgets")!.policies[0].roles).toEqual(["anon", "authenticated"]);
  });

  it("tolerates an as permissive clause", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", "create policy p on widgets as permissive for select to anon using (true);"),
    ]);
    expect(table(schema, "widgets")!.policies[0].command).toBe("SELECT");
  });

  it("removes a policy dropped by a later migration", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", `create policy "leaky" on widgets for select to anon using (true);`),
      file("c.sql", `drop policy if exists "leaky" on widgets;`),
    ]);
    expect(table(schema, "widgets")!.policies).toEqual([]);
  });

  it("keeps the recreated policy when a file drops then creates the same name", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid);"),
      file("b.sql", `create policy "p" on widgets for select to anon using (true);`),
      file(
        "c.sql",
        `drop policy if exists "p" on widgets;
         create policy "p" on widgets for select to anon using (owner = 'me');`
      ),
    ]);
    const policies = table(schema, "widgets")!.policies;
    expect(policies).toHaveLength(1);
    expect(policies[0].using).toBe("owner = 'me'");
    expect(policies[0].migration).toBe("c.sql");
  });

  it("does not drop a same-named policy belonging to another table", () => {
    const schema = buildSchema([
      file("a.sql", "create table widgets (id uuid); create table orders (id uuid);"),
      file("b.sql", `create policy "p" on widgets for select to anon using (true);`),
      file("c.sql", `create policy "p" on orders for select to anon using (true);`),
      file("d.sql", `drop policy if exists "p" on orders;`),
    ]);
    expect(table(schema, "widgets")!.policies).toHaveLength(1);
    expect(table(schema, "orders")!.policies).toHaveLength(0);
  });

  it("records a table it only ever sees in a policy or alter statement", () => {
    const schema = buildSchema([
      file("a.sql", "alter table legacy enable row level security;"),
    ]);
    expect(table(schema, "legacy")?.createdIn).toBeNull();
    expect(table(schema, "legacy")?.rlsEnabledIn).toBe("a.sql");
  });

  it("is not confused by semicolons inside a function body", () => {
    const schema = buildSchema([
      file(
        "a.sql",
        `create table widgets (id uuid);
         create function f() returns void language plpgsql as $$
         begin
           create policy "ghost" on widgets for select to anon using (true);
         end;
         $$;
         alter table widgets enable row level security;`
      ),
    ]);
    // The policy inside the function body is source text, not a live policy.
    expect(table(schema, "widgets")!.policies).toEqual([]);
    expect(table(schema, "widgets")!.rlsEnabledIn).toBe("a.sql");
  });

  it("returns tables sorted by name so the output is stable across runs", () => {
    const schema = buildSchema([
      file("a.sql", "create table zebra (id uuid); create table apple (id uuid);"),
    ]);
    expect(schema.map((t) => t.name)).toEqual(["apple", "zebra"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/migrationSchema.test.ts`
Expected: FAIL — cannot resolve `./migrationSchema`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/migrationSchema.ts`:

```typescript
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

  const names: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of body) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      current = "";
      continue;
    }
    if (current === "") {
      const match = /^\s*([a-z0-9_]+)/i.exec(
        body.slice(body.indexOf(char) === -1 ? 0 : 0)
      );
      void match;
    }
    current += char;
    void names;
  }
  // Simpler and correct: re-split on top-level commas, then take the first word
  // of each part that is not a table-level constraint.
  const parts: string[] = [];
  depth = 0;
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
```

- [ ] **Step 4: Simplify `columnNames` before running the tests**

The draft above contains a dead first loop left over from an earlier shape. Delete everything in `columnNames` between `const names: string[] = [];` and the `// Simpler and correct:` comment, and delete the now-unused `names`, `depth`, `current` declarations that precede it, so the function begins:

```typescript
function columnNames(statement: string): string[] {
  const open = statement.indexOf("(");
  const body = open === -1 ? null : extractParenthesized(statement, open);
  if (!body) return [];

  const parts: string[] = [];
  let depth = 0;
  let piece = "";
  // … unchanged from here
```

This is called out as its own step rather than fixed silently because `npm run lint` will fail on the unused bindings, and an implementer who has not been told will assume the lint failure is theirs.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/reports/migrationSchema.test.ts`
Expected: PASS — 16 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/reports/migrationSchema.ts lib/reports/migrationSchema.test.ts
git commit -m "feat(reports): model migration schema end state for RLS analysis"
```

---

### Task 3: RLS posture and the data-class registry

**Files:**
- Create: `lib/reports/rlsPosture.ts`
- Test: `lib/reports/rlsPosture.test.ts`

**Interfaces:**
- Consumes: `TableRecord`, `PolicyRecord` from `lib/reports/migrationSchema.ts`.
- Produces: `DataClass`, `TABLE_DATA_CLASS`, `PUBLIC_ROLES`, `isUnconstrained`, `TablePosture`, `assessRls(tables: TableRecord[]): TablePosture[]`, `renderRlsTable(postures: TablePosture[]): string`, `rlsSummaryLine(postures: TablePosture[]): string`.

This is where the charter's "a policy of `using (true)` is not a policy" becomes code — and where the naive version of that rule produces a report full of noise.

`using (true)` on the years/subjects/modules content tables is *correct*: that data is a public course catalogue and the app serves it to anonymous visitors by design. Flagging it weekly would bury the one case that matters. So an unconstrained predicate is only a problem relative to what the table holds, and the department needs an explicit answer to "what does this table hold" that a human wrote down once.

`TABLE_DATA_CLASS` is that answer. Three classes:

- `PUBLIC_REFERENCE` — content the product intends to serve to anyone. An unconstrained anon `SELECT` here is the design.
- `USER_DATA` — anything keyed to a person or a device. An unconstrained anon `SELECT`/`UPDATE`/`DELETE` here is a gap; an unconstrained anon `INSERT` is a write-abuse surface and rates `review`.
- `SERVER_ONLY` — touched exclusively through the service-role key. The correct posture is RLS enabled with *no* anon policy at all, which denies by default. A table in this class with any anon policy rates `review`.

**A table missing from the registry is `UNREGISTERED` and always rates `review`.** That is the mechanism the charter asks for under "tracks new tables shipped without protection": a new table cannot pass by being unknown. Step 5 adds a standing assertion that the registry covers every table in the real `supabase/migrations/`, so shipping an unclassified table also fails `npm test` — the weekly report is the second line of defence, not the only one.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/rlsPosture.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSchema } from "./migrationSchema";
import {
  assessRls,
  isUnconstrained,
  renderRlsTable,
  rlsSummaryLine,
  TABLE_DATA_CLASS,
  type TablePosture,
} from "./rlsPosture";
import type { PolicyRecord, TableRecord } from "./migrationSchema";

const policy = (overrides: Partial<PolicyRecord> = {}): PolicyRecord => ({
  name: "p",
  table: "widgets",
  command: "SELECT",
  roles: ["anon"],
  using: "true",
  withCheck: null,
  migration: "a.sql",
  ...overrides,
});

const tableRecord = (overrides: Partial<TableRecord> = {}): TableRecord => ({
  name: "widgets",
  createdIn: "a.sql",
  columns: ["id"],
  rlsEnabledIn: "a.sql",
  policies: [],
  ...overrides,
});

// Synthetic classes so these tests never encode the real registry.
const classes = {
  widgets: "PUBLIC_REFERENCE",
  orders: "USER_DATA",
  ledger: "SERVER_ONLY",
} as const;

describe("isUnconstrained", () => {
  it("treats true as unconstrained in any casing or spacing", () => {
    expect(isUnconstrained("true")).toBe(true);
    expect(isUnconstrained("TRUE")).toBe(true);
    expect(isUnconstrained(" true ")).toBe(true);
    expect(isUnconstrained("(true)")).toBe(true);
  });

  it("treats an absent predicate as unconstrained", () => {
    expect(isUnconstrained(null)).toBe(true);
  });

  it("treats a real predicate as constrained", () => {
    expect(isUnconstrained("device_id = current_setting('app.device_id', true)")).toBe(false);
  });

  it("does not mistake a predicate that merely contains the word true", () => {
    expect(isUnconstrained("current_setting('app.device_id', true) = device_id")).toBe(false);
  });

  it("treats 1 = 1 as unconstrained", () => {
    expect(isUnconstrained("1 = 1")).toBe(true);
  });
});

describe("assessRls", () => {
  it("rates a table with RLS off as a gap whatever its class", () => {
    const [posture] = assessRls([tableRecord({ rlsEnabledIn: null })], classes);
    expect(posture.rlsEnabled).toBe(false);
    expect(posture.verdict).toBe("gap");
    expect(posture.reasons).toContain("RLS not enabled");
  });

  it("rates an unconstrained anon select on public reference data as ok", () => {
    const [posture] = assessRls(
      [tableRecord({ policies: [policy({ command: "SELECT", using: "true" })] })],
      classes
    );
    expect(posture.verdict).toBe("ok");
  });

  it("rates an unconstrained anon select on user data as a gap", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", command: "SELECT", using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("gap");
    expect(posture.reasons.join(" ")).toContain("SELECT");
  });

  it("rates an unconstrained anon insert on user data as review, not a gap", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [
            policy({ table: "orders", command: "INSERT", using: null, withCheck: "true" }),
          ],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("review");
  });

  it("rates a constrained anon policy on user data as ok", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [
            policy({ table: "orders", command: "SELECT", using: "device_id = current_setting('x', true)" }),
          ],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("ok");
  });

  it("rates a server-only table with no anon policy as ok", () => {
    const [posture] = assessRls([tableRecord({ name: "ledger", policies: [] })], classes);
    expect(posture.verdict).toBe("ok");
  });

  it("rates any anon policy on a server-only table as review", () => {
    const [posture] = assessRls(
      [tableRecord({ name: "ledger", policies: [policy({ table: "ledger" })] })],
      classes
    );
    expect(posture.verdict).toBe("review");
  });

  it("rates an unregistered table as review even when it looks clean", () => {
    const [posture] = assessRls([tableRecord({ name: "brandnew", policies: [] })], classes);
    expect(posture.dataClass).toBe("UNREGISTERED");
    expect(posture.verdict).toBe("review");
    expect(posture.reasons).toContain("table not in TABLE_DATA_CLASS");
  });

  it("ignores policies granted only to authenticated or service roles", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", roles: ["authenticated"], using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.anonPolicies).toHaveLength(0);
    expect(posture.verdict).toBe("ok");
  });

  it("counts a public-role policy as anon-reachable", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", roles: ["public"], using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.anonPolicies).toHaveLength(1);
    expect(posture.verdict).toBe("gap");
  });

  it("treats an ALL-command policy as covering select", () => {
    const [posture] = assessRls(
      [
        tableRecord({
          name: "orders",
          policies: [policy({ table: "orders", command: "ALL", using: "true" })],
        }),
      ],
      classes
    );
    expect(posture.verdict).toBe("gap");
  });

  it("preserves table order from the input", () => {
    const postures = assessRls(
      [tableRecord({ name: "orders" }), tableRecord({ name: "widgets" })],
      classes
    );
    expect(postures.map((p) => p.table)).toEqual(["orders", "widgets"]);
  });
});

describe("renderRlsTable", () => {
  const postures: TablePosture[] = assessRls(
    [
      tableRecord({ name: "widgets", policies: [policy({ using: "true" })] }),
      tableRecord({ name: "orders", rlsEnabledIn: null }),
    ],
    classes
  );

  it("has a header naming the columns", () => {
    const [header] = renderRlsTable(postures).split("\n");
    expect(header).toContain("TABLE");
    expect(header).toContain("CLASS");
    expect(header).toContain("RLS");
    expect(header).toContain("VERDICT");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderRlsTable(postures).split("\n");
    expect(rule.length).toBe(body.length);
  });

  it("names every table passed to it", () => {
    const rendered = renderRlsTable(postures);
    expect(rendered).toContain("widgets");
    expect(rendered).toContain("orders");
  });
});

describe("rlsSummaryLine", () => {
  it("reports all clear when nothing needs attention", () => {
    const postures = assessRls([tableRecord({ policies: [] })], classes);
    expect(rlsSummaryLine(postures)).toBe("RLS           1/1 tables clean · no gaps, no review items");
  });

  it("counts gaps and review items separately", () => {
    const postures = assessRls(
      [
        tableRecord({ name: "widgets" }),
        tableRecord({ name: "orders", rlsEnabledIn: null }),
        tableRecord({ name: "brandnew" }),
      ],
      classes
    );
    expect(rlsSummaryLine(postures)).toContain("1 gap");
    expect(rlsSummaryLine(postures)).toContain("1 review");
  });
});

describe("standing assertion: the registry covers the real schema", () => {
  it("classifies every table declared in supabase/migrations", () => {
    const dir = join(__dirname, "..", "..", "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));

    const unregistered = buildSchema(files)
      .map((table) => table.name)
      .filter((name) => !(name in TABLE_DATA_CLASS));

    // A new table must be classified before it can be reported on. Failing
    // here is the intended outcome of shipping one without a class — add it
    // to TABLE_DATA_CLASS with the class its contents actually warrant.
    expect(unregistered).toEqual([]);
  });

  it("has no gap-rated table in the live schema", () => {
    const dir = join(__dirname, "..", "..", "supabase", "migrations");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));

    // Asserts absence, so a passing run publishes nothing. A failing run
    // prints locally and is a finding for the private report, never a commit.
    const gaps = assessRls(buildSchema(files), TABLE_DATA_CLASS)
      .filter((posture) => posture.verdict === "gap")
      .map((posture) => posture.table);

    expect(gaps).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/rlsPosture.test.ts`
Expected: FAIL — cannot resolve `./rlsPosture`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/rlsPosture.ts`:

```typescript
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
  unlocks: "USER_DATA",
  waitlist: "USER_DATA",
  subscriptions: "USER_DATA",
  payments: "USER_DATA",
  profiles: "USER_DATA",
  classes: "USER_DATA",
  class_members: "USER_DATA",
  class_join_requests: "USER_DATA",
  user_feedback: "USER_DATA",

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
    const dataClass = registry[table.name] ?? "UNREGISTERED";
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

    if (dataClass === "UNREGISTERED") {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/rlsPosture.test.ts`
Expected: PASS — 25 tests.

**If the second standing assertion fails**, do not weaken it and do not commit the failure output. A gap-rated table is a real finding: leave the test failing on your working copy, record the table name in `docs/reports/security/README.md` (gitignored, created in Task 12), and let the first WARDEN run write it up properly with options. If the fix is trivial and obviously correct, fix the migration instead — but the fix is a separate commit with its own reasoning, never folded into this task.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/rlsPosture.ts lib/reports/rlsPosture.test.ts
git commit -m "feat(reports): assess RLS posture against a table data-class registry"
```

---

### Task 4: Privacy posture and erasure residue

**Files:**
- Create: `lib/reports/privacyPosture.ts`
- Test: `lib/reports/privacyPosture.test.ts`

**Interfaces:**
- Consumes: `TableRecord` from `lib/reports/migrationSchema.ts`.
- Produces: `IDENTITY_COLUMN_PATTERN`, `IdentityTable`, `inventoryIdentityTables`, `RETENTION_REGISTER`, `extractDeletionTargets`, `erasureResidue`, `renderPrivacyTable`, `privacySummaryLine`.

Sub-function 10 asks two questions: what personal data exists and where, and whether account deletion actually reaches all of it. Both are answerable deterministically from the schema model plus the source of `lib/deleteAccount.ts`.

The inventory comes from the schema: any table carrying a column matching `user_id`, `device_id`, `email`, or an IP-shaped name holds identity. The erasure check compares that inventory against the tables `lib/deleteAccount.ts` actually touches, extracted from its source by `extractDeletionTargets`.

`RETENTION_REGISTER` is the anti-nagging mechanism, and it is the same idea as `ACCEPTED` in the severity taxonomy pushed down into the collector. Some data is retained on purpose — the privacy policy commits to keeping payment records for dispute resolution — and a table listed there with a reason is excluded from the residue rather than re-argued every week. An entry requires a reason and the policy section that authorises it, so "we keep this" can never become a shrug.

**The residue result for the live repository is deliberately not stated in this plan.** The check is fully specified above; the answer belongs in the first private WARDEN run.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/privacyPosture.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  erasureResidue,
  extractDeletionTargets,
  inventoryIdentityTables,
  privacySummaryLine,
  renderPrivacyTable,
  RETENTION_REGISTER,
  type IdentityTable,
} from "./privacyPosture";
import type { TableRecord } from "./migrationSchema";

const tableRecord = (name: string, columns: string[]): TableRecord => ({
  name,
  createdIn: "a.sql",
  columns,
  rlsEnabledIn: "a.sql",
  policies: [],
});

describe("inventoryIdentityTables", () => {
  it("finds a table with a user_id column", () => {
    const inventory = inventoryIdentityTables([tableRecord("orders", ["id", "user_id"])]);
    expect(inventory).toEqual([{ table: "orders", identityColumns: ["user_id"] }]);
  });

  it("finds device, email and ip columns", () => {
    const inventory = inventoryIdentityTables([
      tableRecord("orders", ["id", "device_id", "email", "client_ip"]),
    ]);
    expect(inventory[0].identityColumns).toEqual(["device_id", "email", "client_ip"]);
  });

  it("finds a prefixed device column such as rep_device_id", () => {
    const inventory = inventoryIdentityTables([tableRecord("classes", ["rep_device_id"])]);
    expect(inventory[0].identityColumns).toEqual(["rep_device_id"]);
  });

  it("omits a table with no identity column", () => {
    expect(inventoryIdentityTables([tableRecord("modules", ["id", "title"])])).toEqual([]);
  });

  it("does not match a column that merely contains id", () => {
    expect(inventoryIdentityTables([tableRecord("modules", ["id", "subject_id"])])).toEqual([]);
  });

  it("sorts by table name so the output is stable", () => {
    const inventory = inventoryIdentityTables([
      tableRecord("zebra", ["user_id"]),
      tableRecord("apple", ["user_id"]),
    ]);
    expect(inventory.map((row) => row.table)).toEqual(["apple", "zebra"]);
  });
});

describe("extractDeletionTargets", () => {
  it("finds tables passed to a from() call", () => {
    const source = `
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    `;
    expect(extractDeletionTargets(source)).toEqual(["profiles"]);
  });

  it("finds tables passed to a helper call by string literal", () => {
    const source = `
      await unlink("subscriptions");
      await unlink("payments");
    `;
    expect(extractDeletionTargets(source)).toEqual(["payments", "subscriptions"]);
  });

  it("deduplicates and sorts", () => {
    const source = `unlink("orders"); supabase.from("orders"); unlink("apple");`;
    expect(extractDeletionTargets(source)).toEqual(["apple", "orders"]);
  });

  it("accepts single quotes", () => {
    expect(extractDeletionTargets(`unlink('orders')`)).toEqual(["orders"]);
  });

  it("ignores strings that are not plausible table names", () => {
    const source = `unlink("user_id: not a table"); supabase.from("orders");`;
    expect(extractDeletionTargets(source)).toEqual(["orders"]);
  });

  it("returns an empty array for source that touches nothing", () => {
    expect(extractDeletionTargets("export const x = 1;")).toEqual([]);
  });
});

describe("erasureResidue", () => {
  const inventory: IdentityTable[] = [
    { table: "orders", identityColumns: ["user_id"] },
    { table: "receipts", identityColumns: ["user_id"] },
    { table: "signups", identityColumns: ["email"] },
  ];

  it("returns tables holding identity that deletion never touches", () => {
    const residue = erasureResidue(inventory, ["orders"], {});
    expect(residue.map((row) => row.table)).toEqual(["receipts", "signups"]);
  });

  it("excludes a table listed in the retention register", () => {
    const residue = erasureResidue(inventory, ["orders"], {
      receipts: { reason: "dispute resolution", policySection: "Section 7" },
    });
    expect(residue.map((row) => row.table)).toEqual(["signups"]);
  });

  it("returns an empty array when deletion covers everything", () => {
    expect(erasureResidue(inventory, ["orders", "receipts", "signups"], {})).toEqual([]);
  });

  it("carries the identity columns through so the report can name them", () => {
    const residue = erasureResidue(inventory, [], {});
    expect(residue[0].identityColumns).toEqual(["user_id"]);
  });
});

describe("RETENTION_REGISTER", () => {
  it("gives every entry a reason and a policy section", () => {
    for (const [table, entry] of Object.entries(RETENTION_REGISTER)) {
      expect(entry.reason.trim(), `${table} reason`).not.toBe("");
      expect(entry.policySection.trim(), `${table} policySection`).not.toBe("");
    }
  });
});

describe("renderPrivacyTable", () => {
  const inventory: IdentityTable[] = [
    { table: "orders", identityColumns: ["user_id"] },
    { table: "signups", identityColumns: ["email", "device_id"] },
  ];

  it("names the columns", () => {
    const [header] = renderPrivacyTable(inventory, ["orders"], RETENTION_REGISTER).split("\n");
    expect(header).toContain("TABLE");
    expect(header).toContain("IDENTITY");
    expect(header).toContain("ERASURE");
  });

  it("marks a covered table and an uncovered one differently", () => {
    const rendered = renderPrivacyTable(inventory, ["orders"], {});
    expect(rendered).toContain("deleted");
    expect(rendered).toContain("RESIDUE");
  });

  it("marks a retained table as retained rather than residue", () => {
    const rendered = renderPrivacyTable(inventory, [], {
      signups: { reason: "legal", policySection: "Section 7" },
    });
    expect(rendered).toContain("retained");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderPrivacyTable(inventory, [], {}).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("privacySummaryLine", () => {
  it("reports all clear with no residue", () => {
    expect(privacySummaryLine([{ table: "orders", identityColumns: ["user_id"] }], [])).toBe(
      "PRIVACY       1 identity table · erasure complete"
    );
  });

  it("counts residue tables without naming them", () => {
    const line = privacySummaryLine(
      [
        { table: "orders", identityColumns: ["user_id"] },
        { table: "signups", identityColumns: ["email"] },
      ],
      [{ table: "signups", identityColumns: ["email"] }]
    );
    expect(line).toContain("2 identity tables");
    expect(line).toContain("1 not reached by erasure");
    expect(line).not.toContain("signups");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/privacyPosture.test.ts`
Expected: FAIL — cannot resolve `./privacyPosture`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/privacyPosture.ts`:

```typescript
/**
 * PII inventory and erasure completeness.
 *
 * Two questions from the charter's privacy sub-function: what personal data
 * exists and where, and whether account deletion actually reaches all of it.
 * Both are answerable from the schema model plus the source of
 * lib/deleteAccount.ts, so neither needs a database connection.
 *
 * RETENTION_REGISTER is ACCEPTED pushed down into the collector. Some data is
 * kept deliberately — the privacy policy commits to retaining payment records
 * for dispute resolution — and a registered table is excluded from the residue
 * rather than re-argued every week. Requiring both a reason and the policy
 * section that authorises it stops "we keep this" from becoming a shrug.
 *
 * The summary line names counts, never tables. Which specific table holds
 * un-erased identity is exactly the kind of detail that belongs in the private
 * report and nowhere else.
 */

import type { TableRecord } from "./migrationSchema";

/**
 * Columns that carry identity. `email` and the ip-shaped names are direct
 * personal data; user_id and device_id are the two identity keys this product
 * uses, and device_id matters because the entitlement model is device-first.
 */
export const IDENTITY_COLUMN_PATTERN = /^(.*_)?(user_id|device_id|email|ip)$|^(client_|remote_)?ip(_address)?$/i;

export interface IdentityTable {
  table: string;
  identityColumns: string[];
}

export interface RetentionEntry {
  /** Why the data is kept despite an erasure request. */
  reason: string;
  /** The privacy policy section that authorises keeping it. */
  policySection: string;
}

/**
 * Tables whose identity data is retained on purpose. An entry here is a
 * standing decision, not an oversight, and keeps the table out of the residue.
 */
export const RETENTION_REGISTER: Record<string, RetentionEntry> = {
  payments: {
    reason:
      "Ledger rows survive erasure so disputes and accounting obligations can be met; the user_id link is severed so no personal data remains attached.",
    policySection: "Privacy policy Section 7 — retention",
  },
};

export function inventoryIdentityTables(tables: TableRecord[]): IdentityTable[] {
  return tables
    .map((table) => ({
      table: table.name,
      identityColumns: table.columns.filter((column) => IDENTITY_COLUMN_PATTERN.test(column)),
    }))
    .filter((row) => row.identityColumns.length > 0)
    .sort((a, b) => a.table.localeCompare(b.table));
}

const TABLE_NAME = /^[a-z][a-z0-9_]*$/;

/**
 * Table names that lib/deleteAccount.ts touches, read out of its source.
 *
 * Deliberately literal: it matches `from("x")` and any single-string helper
 * call such as `unlink("x")`. That over-matches slightly — a helper taking a
 * non-table string could appear — which is why the result is filtered to
 * plausible table names and then intersected with the real schema by the
 * caller. Over-matching produces a missed residue rather than a false one, and
 * the standing assertion in Task 12 catches the case that matters.
 */
export function extractDeletionTargets(source: string): string[] {
  const found = new Set<string>();
  for (const match of source.matchAll(/(?:from|unlink|purge|erase)\(\s*["']([^"']+)["']\s*\)/g)) {
    const name = match[1].trim().toLowerCase();
    if (TABLE_NAME.test(name)) found.add(name);
  }
  return [...found].sort();
}

export function erasureResidue(
  inventory: IdentityTable[],
  deletionTargets: string[],
  retention: Record<string, RetentionEntry> = RETENTION_REGISTER
): IdentityTable[] {
  const covered = new Set(deletionTargets);
  return inventory.filter((row) => !covered.has(row.table) && !(row.table in retention));
}

const TABLE_WIDTH = 24;
const IDENTITY_WIDTH = 34;
const ERASURE_WIDTH = 10;
const RULE_WIDTH = TABLE_WIDTH + IDENTITY_WIDTH + ERASURE_WIDTH;

export function renderPrivacyTable(
  inventory: IdentityTable[],
  deletionTargets: string[],
  retention: Record<string, RetentionEntry> = RETENTION_REGISTER
): string {
  const covered = new Set(deletionTargets);

  const header =
    "TABLE".padEnd(TABLE_WIDTH) +
    "IDENTITY".padEnd(IDENTITY_WIDTH) +
    "ERASURE".padEnd(ERASURE_WIDTH);

  const body = inventory.map((row) => {
    const state = covered.has(row.table)
      ? "deleted"
      : row.table in retention
        ? "retained"
        : "RESIDUE";
    return (
      row.table.padEnd(TABLE_WIDTH) +
      row.identityColumns.join(", ").padEnd(IDENTITY_WIDTH) +
      state.padEnd(ERASURE_WIDTH)
    );
  });

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function privacySummaryLine(inventory: IdentityTable[], residue: IdentityTable[]): string {
  const noun = inventory.length === 1 ? "identity table" : "identity tables";
  if (residue.length === 0) {
    return `PRIVACY       ${inventory.length} ${noun} · erasure complete`;
  }
  return `PRIVACY       ${inventory.length} ${noun} · ${residue.length} not reached by erasure`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/privacyPosture.test.ts`
Expected: PASS — 22 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/privacyPosture.ts lib/reports/privacyPosture.test.ts
git commit -m "feat(reports): inventory identity data and check erasure completeness"
```

---

### Task 5: Route-guard cross-reference

**Files:**
- Create: `lib/reports/routeGuards.ts`
- Test: `lib/reports/routeGuards.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `GuardKind`, `GUARD_SIGNALS`, `RateLimitScope`, `RouteRecord`, `classifyRoute`, `Expectation`, `ROUTE_EXPECTATIONS`, `RouteAssessment`, `crossReferenceRoutes`, `middlewareCoverage`, `cookieScopeConflicts`, `renderRouteGuardTable`, `routeSummaryLine`.

This is sub-function 1 and sub-function 9, and it is the module that answers the charter's real requirement: **a newly added unguarded route must show up as a diff rather than needing to be noticed.**

Two registries make that work.

`GUARD_SIGNALS` maps a guard kind to the patterns that prove it. It must be exhaustive about the *named* helpers this codebase uses, and it must include the ones that are easy to miss — the shared-state limiters implemented as Postgres RPCs (`check_rate_limit`, `check_login_lockout`) look nothing like the in-memory `createRateLimiter` and a scan written from memory omits them. Omitting one produces a route reported as unprotected when it is protected, which is the crying-wolf failure in its purest form.

`ROUTE_EXPECTATIONS` says what each route *should* have. A route absent from it is `unclassified` — never "fine", never "missing a guard". Unclassified is its own metric row, so adding a route moves a number in the report on the very next run. Step 5 adds the standing assertion that the registry covers every real `app/api/**/route.ts`, so an unclassified route also fails `npm test`.

`rateLimitScope` distinguishes shared from per-instance because the charter asks specifically whether limits hold across serverless instances. A per-instance limiter on a serverless platform multiplies the real limit by the instance count, silently.

`cookieScopeConflicts` is a small cross-layer consistency check: a session cookie is only sent to paths its `path` attribute covers, so a guard enforced at a path the cookie never reaches is not the guard anyone thinks it is. The check reports the mismatch; whether a given mismatch fails open or closed is WARDEN's call, and the answer differs by direction.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/routeGuards.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  classifyRoute,
  cookieScopeConflicts,
  crossReferenceRoutes,
  middlewareCoverage,
  renderRouteGuardTable,
  routeSummaryLine,
  ROUTE_EXPECTATIONS,
  type Expectation,
  type RouteRecord,
} from "./routeGuards";

const expectations: Record<string, Expectation> = {
  "/api/thing": { auth: ["device"], rateLimit: true, validation: true },
  "/api/open": { auth: "none", rateLimit: false, validation: false },
};

describe("classifyRoute", () => {
  it("records the exported HTTP methods", () => {
    const route = classifyRoute(
      "/api/thing",
      `export async function GET() {}\nexport async function POST() {}`
    );
    expect(route.methods).toEqual(["GET", "POST"]);
  });

  it("detects a device guard", () => {
    const route = classifyRoute("/api/thing", `verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value)`);
    expect(route.guards.device).toContain("verifyDeviceCookie");
  });

  it("detects an admin guard", () => {
    const route = classifyRoute("/api/thing", `if (!(await getAdminSession())) return;`);
    expect(route.guards.admin).toContain("getAdminSession");
  });

  it("detects a user-session guard", () => {
    const route = classifyRoute("/api/thing", `const userId = await getCurrentUserId();`);
    expect(route.guards.user).toContain("getCurrentUserId");
  });

  it("detects a webhook signature guard", () => {
    const route = classifyRoute("/api/thing", `if (!verifyPaymongoWebhook(raw, sig)) return;`);
    expect(route.guards.signature).toContain("verifyPaymongoWebhook");
  });

  it("detects validation via isUuid", () => {
    const route = classifyRoute("/api/thing", `if (!isUuid(id)) return bad();`);
    expect(route.guards.validation).toContain("isUuid");
  });

  it("detects validation via an explicit typeof check", () => {
    const route = classifyRoute("/api/thing", `if (typeof body.name !== "string") return bad();`);
    expect(route.guards.validation.length).toBeGreaterThan(0);
  });

  it("classifies an in-memory limiter as per-instance", () => {
    const route = classifyRoute("/api/thing", `const limiter = createRateLimiter(60);`);
    expect(route.guards.ratelimit).toContain("createRateLimiter");
    expect(route.rateLimitScope).toBe("per-instance");
  });

  it("classifies the RPC limiter as shared", () => {
    const route = classifyRoute("/api/thing", `await isServerRateLimited(key, opts);`);
    expect(route.rateLimitScope).toBe("shared");
  });

  it("classifies the login lockout RPC as a shared rate limit", () => {
    const route = classifyRoute("/api/thing", `await supabase.rpc("check_login_lockout", { p_ip: ip });`);
    expect(route.guards.ratelimit.length).toBeGreaterThan(0);
    expect(route.rateLimitScope).toBe("shared");
  });

  it("prefers shared when a route carries both kinds", () => {
    const route = classifyRoute(
      "/api/thing",
      `const limiter = createRateLimiter(60); await isServerRateLimited(k, o);`
    );
    expect(route.rateLimitScope).toBe("shared");
  });

  it("reports none when there is no limiter at all", () => {
    expect(classifyRoute("/api/thing", `export async function GET() {}`).rateLimitScope).toBe("none");
  });

  it("does not count a guard named only in a comment", () => {
    const route = classifyRoute("/api/thing", `// getAdminSession() is handled by middleware\n`);
    expect(route.guards.admin).toEqual([]);
  });
});

describe("crossReferenceRoutes", () => {
  const route = (overrides: Partial<RouteRecord> = {}): RouteRecord => ({
    path: "/api/thing",
    methods: ["POST"],
    guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
    rateLimitScope: "none",
    ...overrides,
  });

  it("reports a route meeting its expectation as satisfied", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          guards: {
            device: ["verifyDeviceCookie"],
            admin: [],
            user: [],
            ratelimit: ["createRateLimiter"],
            validation: ["isUuid"],
            signature: [],
          },
          rateLimitScope: "per-instance",
        }),
      ],
      expectations
    );
    expect(assessment.missing).toEqual([]);
    expect(assessment.unclassified).toBe(false);
  });

  it("names each missing guard", () => {
    const [assessment] = crossReferenceRoutes([route()], expectations);
    expect(assessment.missing).toEqual(["auth", "rateLimit", "validation"]);
  });

  it("accepts any listed auth kind when several are allowed", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          path: "/api/either",
          guards: {
            device: [],
            admin: [],
            user: ["getCurrentUserId"],
            ratelimit: [],
            validation: [],
            signature: [],
          },
        }),
      ],
      { "/api/either": { auth: ["device", "user"], rateLimit: false, validation: false } }
    );
    expect(assessment.missing).toEqual([]);
  });

  it("treats an unlisted route as unclassified, not as missing guards", () => {
    const [assessment] = crossReferenceRoutes([route({ path: "/api/brandnew" })], expectations);
    expect(assessment.unclassified).toBe(true);
    expect(assessment.missing).toEqual([]);
  });

  it("expects nothing of a route declared open", () => {
    const [assessment] = crossReferenceRoutes([route({ path: "/api/open" })], expectations);
    expect(assessment.missing).toEqual([]);
  });

  it("accepts a signature guard as auth when the expectation names it", () => {
    const [assessment] = crossReferenceRoutes(
      [
        route({
          path: "/api/hook",
          guards: {
            device: [],
            admin: [],
            user: [],
            ratelimit: [],
            validation: [],
            signature: ["verifyPaymongoWebhook"],
          },
        }),
      ],
      { "/api/hook": { auth: ["signature"], rateLimit: false, validation: false } }
    );
    expect(assessment.missing).toEqual([]);
  });
});

describe("middlewareCoverage", () => {
  const matcher = "/((?!_next/static|_next/image|favicon.ico).*)";

  it("reports a covered path as covered", () => {
    expect(middlewareCoverage(matcher, ["/api/thing"])).toEqual([
      { path: "/api/thing", covered: true },
    ]);
  });

  it("reports an excluded path as uncovered", () => {
    expect(middlewareCoverage(matcher, ["/_next/static/chunk.js"])[0].covered).toBe(false);
  });

  it("returns covered:null for a matcher it cannot compile", () => {
    expect(middlewareCoverage("([", ["/api/thing"])[0].covered).toBeNull();
  });
});

describe("cookieScopeConflicts", () => {
  it("returns nothing when the cookie path covers every enforced path", () => {
    expect(cookieScopeConflicts("/", ["/admin", "/api/admin"])).toEqual([]);
  });

  it("names an enforced path the cookie will never be sent to", () => {
    expect(cookieScopeConflicts("/admin", ["/admin", "/api/admin"])).toEqual(["/api/admin"]);
  });

  it("treats an exact match as covered", () => {
    expect(cookieScopeConflicts("/admin", ["/admin"])).toEqual([]);
  });

  it("does not treat a shared prefix without a boundary as covered", () => {
    expect(cookieScopeConflicts("/admin", ["/administration"])).toEqual(["/administration"]);
  });
});

describe("renderRouteGuardTable", () => {
  const assessments = crossReferenceRoutes(
    [
      {
        path: "/api/thing",
        methods: ["POST"],
        guards: {
          device: ["verifyDeviceCookie"],
          admin: [],
          user: [],
          ratelimit: ["createRateLimiter"],
          validation: ["isUuid"],
          signature: [],
        },
        rateLimitScope: "per-instance",
      },
      {
        path: "/api/brandnew",
        methods: ["GET"],
        guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
        rateLimitScope: "none",
      },
    ],
    expectations
  );

  it("has a header naming the guard columns", () => {
    const [header] = renderRouteGuardTable(assessments).split("\n");
    expect(header).toContain("ROUTE");
    expect(header).toContain("AUTH");
    expect(header).toContain("RATE");
    expect(header).toContain("VALID");
  });

  it("marks the unclassified route distinctly from a satisfied one", () => {
    const rendered = renderRouteGuardTable(assessments);
    expect(rendered).toContain("unclassified");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderRouteGuardTable(assessments).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("routeSummaryLine", () => {
  it("reports all clear when every route satisfies its expectation", () => {
    const assessments = crossReferenceRoutes(
      [
        {
          path: "/api/open",
          methods: ["GET"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
      ],
      expectations
    );
    expect(routeSummaryLine(assessments)).toBe(
      "ROUTE GUARDS  1/1 routes satisfy their expectation · none unclassified"
    );
  });

  it("counts gaps and unclassified routes separately", () => {
    const assessments = crossReferenceRoutes(
      [
        {
          path: "/api/thing",
          methods: ["POST"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
        {
          path: "/api/brandnew",
          methods: ["GET"],
          guards: { device: [], admin: [], user: [], ratelimit: [], validation: [], signature: [] },
          rateLimitScope: "none",
        },
      ],
      expectations
    );
    expect(routeSummaryLine(assessments)).toContain("1 missing a guard");
    expect(routeSummaryLine(assessments)).toContain("1 unclassified");
  });
});

describe("standing assertion: every API route is classified", () => {
  const apiDir = join(__dirname, "..", "..", "app", "api");

  const routeFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) out.push(...routeFiles(full));
      else if (entry === "route.ts") out.push(full);
    }
    return out;
  };

  it("has a ROUTE_EXPECTATIONS entry for every app/api route", () => {
    const paths = routeFiles(apiDir).map(
      (file) => `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`
    );

    // A new route must be classified before it can be reported on. Failing
    // here is the intended outcome of adding one — decide what guards it
    // should have and write that down, rather than discovering later that
    // nothing was watching it.
    expect(paths.filter((path) => !(path in ROUTE_EXPECTATIONS))).toEqual([]);
  });

  it("has no live route missing a guard its expectation requires", () => {
    const routes = routeFiles(apiDir).map((file) =>
      classifyRoute(
        `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`,
        readFileSync(file, "utf8")
      )
    );

    // Asserts absence: a passing run publishes nothing.
    const gaps = crossReferenceRoutes(routes, ROUTE_EXPECTATIONS)
      .filter((assessment) => assessment.missing.length > 0)
      .map((assessment) => assessment.route.path);

    expect(gaps).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/routeGuards.test.ts`
Expected: FAIL — cannot resolve `./routeGuards`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/routeGuards.ts`:

```typescript
/**
 * Route-guard cross-reference: what each API route has, against what it should.
 *
 * The requirement this exists to meet is that a newly added unguarded route
 * shows up as a *diff* rather than needing to be noticed. Two registries do
 * that. GUARD_SIGNALS knows what a guard looks like; ROUTE_EXPECTATIONS knows
 * what each route needs. A route absent from the second is `unclassified` —
 * never "fine" and never "missing a guard" — and unclassified is its own
 * metric row, so adding a route moves a number on the next run.
 *
 * GUARD_SIGNALS must be exhaustive about the named helpers this codebase
 * actually uses. The two shared-state limiters are Postgres RPCs and look
 * nothing like the in-memory factory; a scan written from memory omits them
 * and then reports a protected route as unprotected. A false "unguarded route"
 * is the fastest way to make this report unreadable.
 */

export type GuardKind = "device" | "admin" | "user" | "ratelimit" | "validation" | "signature";

export type RateLimitScope = "shared" | "per-instance" | "none";

interface GuardSignal {
  kind: GuardKind;
  /** Human-readable name recorded as evidence. */
  label: string;
  pattern: RegExp;
  /** Only meaningful for `ratelimit`. */
  scope?: Exclude<RateLimitScope, "none">;
}

export const GUARD_SIGNALS: readonly GuardSignal[] = [
  { kind: "device", label: "verifyDeviceCookie", pattern: /\bverifyDeviceCookie\s*\(/ },

  { kind: "admin", label: "getAdminSession", pattern: /\bgetAdminSession\s*\(/ },
  { kind: "admin", label: "verifySessionToken", pattern: /\bverifySessionToken\s*\(/ },

  { kind: "user", label: "getCurrentUserId", pattern: /\bgetCurrentUserId\s*\(/ },
  { kind: "user", label: "auth.getUser", pattern: /\bauth\.getUser\s*\(/ },

  {
    kind: "ratelimit",
    label: "createRateLimiter",
    pattern: /\bcreateRateLimiter\s*\(/,
    scope: "per-instance",
  },
  {
    kind: "ratelimit",
    label: "in-route limiter map",
    pattern: /\bisRateLimited\s*\(/,
    scope: "per-instance",
  },
  {
    kind: "ratelimit",
    label: "isServerRateLimited",
    pattern: /\bisServerRateLimited\s*\(/,
    scope: "shared",
  },
  {
    kind: "ratelimit",
    label: "check_rate_limit RPC",
    pattern: /["']check_rate_limit["']/,
    scope: "shared",
  },
  {
    kind: "ratelimit",
    label: "check_login_lockout RPC",
    pattern: /["']check_login_lockout["']/,
    scope: "shared",
  },

  { kind: "validation", label: "isUuid", pattern: /\bisUuid\s*\(/ },
  { kind: "validation", label: "typeof guard", pattern: /typeof\s+[\w.[\]]+\s*!==\s*["']\w+["']/ },
  { kind: "validation", label: "allowlist set", pattern: /\b[A-Z_]*(VALID|ALLOWED)[A-Z_]*\b/ },

  { kind: "signature", label: "verifyPaymongoWebhook", pattern: /\bverifyPaymongoWebhook\s*\(/ },
];

export interface RouteRecord {
  /** URL path, e.g. `/api/class/[code]/rep`. */
  path: string;
  methods: string[];
  guards: Record<GuardKind, string[]>;
  rateLimitScope: RateLimitScope;
}

/**
 * Removes comments so a guard mentioned in prose is not counted as present.
 * Deliberately crude — it does not understand strings containing "//" — which
 * over-strips rather than over-matches, and over-stripping only ever loses a
 * guard we would then look at by hand.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1 ");
}

export function classifyRoute(path: string, source: string): RouteRecord {
  const code = stripComments(source);

  const methods = [...code.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map(
    (match) => match[1]
  );

  const guards: Record<GuardKind, string[]> = {
    device: [],
    admin: [],
    user: [],
    ratelimit: [],
    validation: [],
    signature: [],
  };

  let scope: RateLimitScope = "none";
  for (const signal of GUARD_SIGNALS) {
    if (!signal.pattern.test(code)) continue;
    guards[signal.kind].push(signal.label);
    if (signal.kind === "ratelimit" && signal.scope) {
      // Shared wins: a route carrying both is protected across instances.
      if (signal.scope === "shared" || scope === "none") scope = signal.scope;
    }
  }

  return { path, methods, guards, rateLimitScope: scope };
}

export interface Expectation {
  /** Acceptable auth kinds, or "none" for a route that is open by design. */
  auth: GuardKind[] | "none";
  rateLimit: boolean;
  validation: boolean;
  /** Why this shape, when it is not obvious. */
  note?: string;
}

/**
 * What each route should carry. Keyed by URL path.
 *
 * `auth: "none"` is a decision, not a default — it says the route is open on
 * purpose. The standing assertion in the test file fails if a route exists
 * without an entry here, so "we never decided" is not reachable.
 */
export const ROUTE_EXPECTATIONS: Record<string, Expectation> = {
  "/api/account/delete": { auth: ["user"], rateLimit: true, validation: false, note: "Identity comes only from the session; there is no client-suppliable id to validate." },
  "/api/activity/[sectionId]": { auth: ["device", "user"], rateLimit: false, validation: true, note: "Serves paid activity bodies; entitlement is checked before the body is returned." },
  "/api/admin/feedback": { auth: ["admin"], rateLimit: false, validation: false },
  "/api/admin/grant-class": { auth: ["admin"], rateLimit: false, validation: true },
  "/api/admin/login": { auth: "none", rateLimit: true, validation: true, note: "Issues the session, so it cannot require one. The lockout RPC is the guard." },
  "/api/admin/logout": { auth: "none", rateLimit: false, validation: false, note: "Must work with an expired session so the cookie can always be cleared." },
  "/api/admin/reconcile": { auth: ["admin"], rateLimit: false, validation: true },
  "/api/admin/unlock": { auth: ["admin"], rateLimit: false, validation: false },
  "/api/class/[code]/rep": { auth: ["device"], rateLimit: false, validation: true },
  "/api/class/[code]/rep/decide": { auth: ["device"], rateLimit: false, validation: true },
  "/api/class/[code]/request": { auth: ["device"], rateLimit: true, validation: true },
  "/api/class/[code]/request/status": { auth: ["device"], rateLimit: false, validation: true },
  "/api/class/checkout": { auth: ["device"], rateLimit: false, validation: true },
  "/api/device": { auth: "none", rateLimit: true, validation: true, note: "Mints the device identity, so it cannot require one." },
  "/api/events": { auth: ["device"], rateLimit: true, validation: true },
  "/api/feedback": { auth: ["device", "user"], rateLimit: true, validation: true },
  "/api/feedback/user": { auth: ["user"], rateLimit: false, validation: false },
  "/api/me": { auth: ["user"], rateLimit: false, validation: false },
  "/api/progress": { auth: ["device", "user"], rateLimit: true, validation: true },
  "/api/quiz": { auth: ["user"], rateLimit: false, validation: true },
  "/api/run": { auth: ["device"], rateLimit: true, validation: true, note: "Highest-surface route in the product; both guards are load-bearing." },
  "/api/subscribe": { auth: ["device", "user"], rateLimit: true, validation: true },
  "/api/subscription-status": { auth: ["device", "user"], rateLimit: false, validation: true },
  "/api/waitlist": { auth: ["device"], rateLimit: true, validation: true },
  "/api/webhooks/paymongo": { auth: ["signature"], rateLimit: true, validation: true, note: "Authenticated by HMAC signature rather than by a session." },
};

export interface RouteAssessment {
  route: RouteRecord;
  /** Guard categories the expectation requires and the route lacks. */
  missing: string[];
  /** True when no expectation exists for this route. */
  unclassified: boolean;
}

export function crossReferenceRoutes(
  routes: RouteRecord[],
  expectations: Record<string, Expectation> = ROUTE_EXPECTATIONS
): RouteAssessment[] {
  return routes.map((route) => {
    const expected = expectations[route.path];
    if (!expected) return { route, missing: [], unclassified: true };

    const missing: string[] = [];

    if (expected.auth !== "none") {
      const satisfied = expected.auth.some((kind) => route.guards[kind].length > 0);
      if (!satisfied) missing.push("auth");
    }
    if (expected.rateLimit && route.guards.ratelimit.length === 0) missing.push("rateLimit");
    if (expected.validation && route.guards.validation.length === 0) missing.push("validation");

    return { route, missing, unclassified: false };
  });
}

/**
 * Whether the middleware matcher reaches each path. A route outside the
 * matcher gets no middleware-layer guard at all, which is fine when the route
 * guards itself and is worth knowing when it does not.
 *
 * `covered: null` means the matcher could not be compiled — recorded as
 * unknown rather than assumed either way.
 */
export function middlewareCoverage(
  matcherSource: string,
  paths: string[]
): { path: string; covered: boolean | null }[] {
  let matcher: RegExp | null = null;
  try {
    matcher = new RegExp(`^${matcherSource}$`);
  } catch {
    matcher = null;
  }
  return paths.map((path) => ({ path, covered: matcher ? matcher.test(path) : null }));
}

/**
 * Enforced paths a cookie with `cookiePath` will never be sent to.
 *
 * RFC 6265 path matching: a cookie is sent when the request path equals the
 * cookie path, or begins with it followed by "/". A guard enforced somewhere
 * the cookie cannot reach is not the guard it appears to be — in which
 * direction that fails is a judgement, which is why this reports the mismatch
 * rather than a severity.
 */
export function cookieScopeConflicts(cookiePath: string, enforcedPaths: string[]): string[] {
  const base = cookiePath.endsWith("/") ? cookiePath.slice(0, -1) : cookiePath;
  return enforcedPaths.filter((path) => {
    if (base === "" || path === base) return false;
    return !path.startsWith(`${base}/`);
  });
}

const ROUTE_WIDTH = 38;
const METHOD_WIDTH = 10;
const CELL_WIDTH = 8;
const STATE_WIDTH = 14;
const RULE_WIDTH = ROUTE_WIDTH + METHOD_WIDTH + CELL_WIDTH * 3 + STATE_WIDTH;

export function renderRouteGuardTable(assessments: RouteAssessment[]): string {
  const header =
    "ROUTE".padEnd(ROUTE_WIDTH) +
    "METHODS".padEnd(METHOD_WIDTH) +
    "AUTH".padEnd(CELL_WIDTH) +
    "RATE".padEnd(CELL_WIDTH) +
    "VALID".padEnd(CELL_WIDTH) +
    "STATE".padEnd(STATE_WIDTH);

  const mark = (present: boolean): string => (present ? "yes" : "—");

  const body = assessments.map(({ route, missing, unclassified }) => {
    const hasAuth =
      route.guards.device.length + route.guards.admin.length + route.guards.user.length + route.guards.signature.length > 0;
    const state = unclassified ? "unclassified" : missing.length === 0 ? "ok" : `missing ${missing.join("+")}`;
    return (
      route.path.padEnd(ROUTE_WIDTH) +
      route.methods.join(",").padEnd(METHOD_WIDTH) +
      mark(hasAuth).padEnd(CELL_WIDTH) +
      (route.rateLimitScope === "none" ? "—" : route.rateLimitScope).padEnd(CELL_WIDTH) +
      mark(route.guards.validation.length > 0).padEnd(CELL_WIDTH) +
      state.padEnd(STATE_WIDTH)
    );
  });

  return [header, "─".repeat(RULE_WIDTH), ...body].join("\n");
}

export function routeSummaryLine(assessments: RouteAssessment[]): string {
  const unclassified = assessments.filter((a) => a.unclassified).length;
  const gaps = assessments.filter((a) => a.missing.length > 0).length;
  const satisfied = assessments.length - unclassified - gaps;

  if (gaps === 0 && unclassified === 0) {
    return `ROUTE GUARDS  ${satisfied}/${assessments.length} routes satisfy their expectation · none unclassified`;
  }
  return `ROUTE GUARDS  ${satisfied}/${assessments.length} satisfy · ${gaps} missing a guard · ${unclassified} unclassified`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/routeGuards.test.ts`
Expected: PASS — 34 tests.

Both standing assertions are expected to pass against the repository as it stands. If either fails, apply the same rule as Task 3: do not weaken the assertion, record the route in the gitignored README, and let the first WARDEN run write it up.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/routeGuards.ts lib/reports/routeGuards.test.ts
git commit -m "feat(reports): cross-reference API routes against expected guards"
```

---

### Task 6: Secrets posture

**Files:**
- Create: `lib/reports/secretsPosture.ts`
- Test: `lib/reports/secretsPosture.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `SecretClass`, `ENV_CLASS`, `EnvDeclaration`, `parseEnvExample`, `scanEnvUsage`, `parseImports`, `resolveSpecifier`, `clientReachable`, `SecretIssue`, `SecretRow`, `assessSecrets`, `renderSecretsTable`, `secretsSummaryLine`.

Sub-function 4, and the one where the charter's escalation list is unusually blunt: *a secret reachable from the client bundle* is P0 on its own. Everything this module does is in service of answering that one question deterministically, plus three cheaper questions that share the same inputs.

The hard part is "reachable from the client bundle", because the answer is not a property of one file. Next.js inlines `NEXT_PUBLIC_*` at build time — that half is a naming check anyone can do. The half that actually bites is a **server-only variable read from a module that a client component imports**, because the bundler follows that import and the module's source goes to the browser with it. So the check needs an import closure: start from every file carrying the `"use client"` directive, follow its imports, follow theirs, and call everything reached client-reachable. A server-only `process.env` read anywhere in that closure is the finding.

That closure has to be computed without a bundler and without touching disk from `lib/`. `parseImports` returns raw specifiers; `resolveSpecifier` turns `@/lib/foo` and `./bar` into repo-relative module paths **against a supplied set of known modules**, so the resolution is pure and the collector owns the directory walk. Resolving against a known set rather than guessing extensions also means an unresolvable specifier — a bare package name, a type-only import of something absent — is simply not followed, rather than silently inventing a file.

Four registries-and-rules, in descending order of how much they matter:

- **`ENV_CLASS`** says what each variable is: `PUBLIC_OK` or `SERVER_ONLY`. **A variable used in code but absent from the registry is `UNCLASSIFIED` and always counts as an issue** — the same mechanism as `TABLE_DATA_CLASS` in Task 3 and `ROUTE_EXPECTATIONS` in Task 5. A new secret must not be able to pass by being unknown.
- **A `SERVER_ONLY` variable read from a client-reachable file** is the P0 shape. Reported as its own issue kind so WARDEN never has to infer it.
- **A `NEXT_PUBLIC_`-prefixed variable classified `SERVER_ONLY`** is the same failure caught one step earlier: the prefix alone guarantees the value is inlined into the bundle whatever else is true.
- **`.env*` ignore status** is checked by the collector with `git check-ignore` and passed in. This module only renders the verdict, because a boolean that came from a real `git` invocation is worth more than one derived from parsing `.gitignore` by hand.

Two lower-weight rows share the inputs for free: a variable read in code but missing from `.env.example` (undocumented — the next person deploying will not know to set it), and a variable declared in `.env.example` that nothing reads (drift). Drift is reported and **never rated a gap**; `.env.example` documenting a platform variable that the SDK reads for itself is normal and nagging about it weekly is exactly the behaviour this department is built to avoid.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/secretsPosture.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  assessSecrets,
  clientReachable,
  ENV_CLASS,
  parseEnvExample,
  parseImports,
  renderSecretsTable,
  resolveSpecifier,
  scanEnvUsage,
  secretsSummaryLine,
} from "./secretsPosture";

const classes = {
  NEXT_PUBLIC_THING: "PUBLIC_OK",
  SERVER_TOKEN: "SERVER_ONLY",
  NODE_ENV: "PUBLIC_OK",
} as const;

describe("parseEnvExample", () => {
  it("reads a plain declaration", () => {
    expect(parseEnvExample("SERVER_TOKEN=x")).toEqual([
      { name: "SERVER_TOKEN", commented: false },
    ]);
  });

  it("reads a commented-out declaration as optional", () => {
    expect(parseEnvExample("# SERVER_TOKEN=x")).toEqual([
      { name: "SERVER_TOKEN", commented: true },
    ]);
  });

  it("ignores prose comments that are not declarations", () => {
    expect(parseEnvExample("# Copy this file to .env.local for local dev.")).toEqual([]);
  });

  it("ignores blank lines and box-drawing separators", () => {
    expect(parseEnvExample("\n# ─────────────\n\n")).toEqual([]);
  });

  it("keeps declaration order and does not deduplicate silently", () => {
    const names = parseEnvExample("B_VAR=1\nA_VAR=2").map((d) => d.name);
    expect(names).toEqual(["B_VAR", "A_VAR"]);
  });
});

describe("scanEnvUsage", () => {
  it("finds a direct process.env read", () => {
    expect(scanEnvUsage(`const s = process.env.SERVER_TOKEN;`)).toEqual(["SERVER_TOKEN"]);
  });

  it("finds a bracket read", () => {
    expect(scanEnvUsage(`process.env["SERVER_TOKEN"]`)).toEqual(["SERVER_TOKEN"]);
  });

  it("deduplicates and sorts", () => {
    const source = `process.env.B_VAR; process.env.A_VAR; process.env.B_VAR;`;
    expect(scanEnvUsage(source)).toEqual(["A_VAR", "B_VAR"]);
  });

  it("returns an empty array for source that reads nothing", () => {
    expect(scanEnvUsage("export const x = 1;")).toEqual([]);
  });
});

describe("parseImports", () => {
  it("finds static import specifiers", () => {
    const source = `import { a } from "@/lib/a";\nimport b from "./b";`;
    expect(parseImports(source)).toEqual(["@/lib/a", "./b"]);
  });

  it("finds a type-only import", () => {
    expect(parseImports(`import type { T } from "./types";`)).toEqual(["./types"]);
  });

  it("finds a dynamic import", () => {
    expect(parseImports(`const m = await import("@/lib/heavy");`)).toEqual(["@/lib/heavy"]);
  });

  it("finds a re-export", () => {
    expect(parseImports(`export { a } from "./a";`)).toEqual(["./a"]);
  });
});

describe("resolveSpecifier", () => {
  const known = new Set(["lib/a.ts", "lib/b/index.ts", "components/C.tsx"]);

  it("resolves an @/ alias to a repo-relative module", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/a", known)).toBe("lib/a.ts");
  });

  it("resolves a relative specifier against the importing file's directory", () => {
    expect(resolveSpecifier("lib/b/index.ts", "../a", known)).toBe("lib/a.ts");
  });

  it("resolves a directory specifier to its index file", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/b", known)).toBe("lib/b/index.ts");
  });

  it("returns null for a bare package specifier", () => {
    expect(resolveSpecifier("components/C.tsx", "react", known)).toBeNull();
  });

  it("returns null when nothing in the known set matches", () => {
    expect(resolveSpecifier("components/C.tsx", "@/lib/missing", known)).toBeNull();
  });
});

describe("clientReachable", () => {
  const modules = {
    "components/C.tsx": `"use client";\nimport { a } from "@/lib/a";`,
    "lib/a.ts": `import { b } from "./b";`,
    "lib/b.ts": `export const b = 1;`,
    "lib/server.ts": `export const s = process.env.SERVER_TOKEN;`,
  };

  it("includes the client entry itself", () => {
    expect(clientReachable(modules).has("components/C.tsx")).toBe(true);
  });

  it("follows imports transitively", () => {
    const reached = clientReachable(modules);
    expect(reached.has("lib/a.ts")).toBe(true);
    expect(reached.has("lib/b.ts")).toBe(true);
  });

  it("excludes a module nothing client-side imports", () => {
    expect(clientReachable(modules).has("lib/server.ts")).toBe(false);
  });

  it("terminates on an import cycle", () => {
    const cyclic = {
      "components/C.tsx": `"use client";\nimport "./x";`,
      "components/x.ts": `import "./y";`,
      "components/y.ts": `import "./x";`,
    };
    expect(clientReachable(cyclic).size).toBe(3);
  });
});

describe("assessSecrets", () => {
  const base = {
    declared: [{ name: "SERVER_TOKEN", commented: false }],
    usage: { "lib/server.ts": ["SERVER_TOKEN"] },
    clientFiles: new Set<string>(),
    envFilesIgnored: true,
    registry: classes,
  };

  it("rates a server-only variable read only on the server as ok", () => {
    const posture = assessSecrets(base);
    expect(posture.issues).toEqual([]);
    expect(posture.rows.find((r) => r.name === "SERVER_TOKEN")?.reach).toBe("server");
  });

  it("flags a server-only variable read from a client-reachable file", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
    });
    expect(posture.issues.map((i) => i.kind)).toContain("client-reachable");
    expect(posture.rows.find((r) => r.name === "SERVER_TOKEN")?.reach).toBe("CLIENT");
  });

  it("flags a NEXT_PUBLIC_ variable classified server-only", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "lib/server.ts": ["NEXT_PUBLIC_LEAK"] },
      registry: { ...classes, NEXT_PUBLIC_LEAK: "SERVER_ONLY" },
    });
    expect(posture.issues.map((i) => i.kind)).toContain("public-prefixed");
  });

  it("flags a variable used in code but absent from the registry", () => {
    const posture = assessSecrets({ ...base, usage: { "lib/server.ts": ["MYSTERY_VAR"] } });
    expect(posture.issues.map((i) => i.kind)).toContain("unclassified");
  });

  it("flags a variable used in code but absent from .env.example", () => {
    const posture = assessSecrets({ ...base, declared: [] });
    expect(posture.issues.map((i) => i.kind)).toContain("undocumented");
  });

  it("reports a declared-but-unread variable as drift, not as a gap", () => {
    const posture = assessSecrets({
      ...base,
      declared: [...base.declared, { name: "UNUSED_VAR", commented: true }],
    });
    expect(posture.issues.map((i) => i.kind)).toContain("documented-unused");
    expect(posture.gapCount).toBe(0);
  });

  it("flags env files that git does not ignore", () => {
    const posture = assessSecrets({ ...base, envFilesIgnored: false });
    expect(posture.issues.map((i) => i.kind)).toContain("env-not-ignored");
    expect(posture.gapCount).toBeGreaterThan(0);
  });

  it("names the file for a client-reachable issue so the report can cite it", () => {
    const posture = assessSecrets({
      ...base,
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
    });
    expect(posture.issues.find((i) => i.kind === "client-reachable")?.file).toBe(
      "components/C.tsx"
    );
  });
});

describe("renderSecretsTable", () => {
  const posture = assessSecrets({
    declared: [{ name: "SERVER_TOKEN", commented: false }],
    usage: { "lib/server.ts": ["SERVER_TOKEN"], "components/C.tsx": ["NEXT_PUBLIC_THING"] },
    clientFiles: new Set(["components/C.tsx"]),
    envFilesIgnored: true,
    registry: classes,
  });

  it("has a header naming the columns", () => {
    const [header] = renderSecretsTable(posture).split("\n");
    expect(header).toContain("VARIABLE");
    expect(header).toContain("CLASS");
    expect(header).toContain("DOCUMENTED");
    expect(header).toContain("REACH");
  });

  it("names every variable it was given", () => {
    const rendered = renderSecretsTable(posture);
    expect(rendered).toContain("SERVER_TOKEN");
    expect(rendered).toContain("NEXT_PUBLIC_THING");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderSecretsTable(posture).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("secretsSummaryLine", () => {
  it("reports all clear when nothing is wrong", () => {
    const posture = assessSecrets({
      declared: [{ name: "SERVER_TOKEN", commented: false }],
      usage: { "lib/server.ts": ["SERVER_TOKEN"] },
      clientFiles: new Set<string>(),
      envFilesIgnored: true,
      registry: classes,
    });
    expect(secretsSummaryLine(posture)).toBe(
      "SECRETS       1 variable · none client-reachable · .env ignored"
    );
  });

  it("counts issues without naming the variable", () => {
    const posture = assessSecrets({
      declared: [],
      usage: { "components/C.tsx": ["SERVER_TOKEN"] },
      clientFiles: new Set(["components/C.tsx"]),
      envFilesIgnored: true,
      registry: classes,
    });
    const line = secretsSummaryLine(posture);
    expect(line).toContain("1 client-reachable");
    expect(line).not.toContain("SERVER_TOKEN");
  });
});

describe("standing assertion: the registry covers real env usage", () => {
  const REPO = join(__dirname, "..", "..");
  const ROOTS = ["app", "lib", "components", "scripts", "middleware.ts", "next.config.ts"];
  const EXTENSIONS = [".ts", ".tsx", ".mjs"];

  const walk = (path: string, out: string[] = []): string[] => {
    const stats = statSync(path, { throwIfNoEntry: false });
    if (!stats) return out;
    if (stats.isFile()) {
      if (EXTENSIONS.some((ext) => path.endsWith(ext))) out.push(path);
      return out;
    }
    for (const entry of readdirSync(path)) walk(join(path, entry), out);
    return out;
  };

  const modules = (): Record<string, string> => {
    const found: Record<string, string> = {};
    for (const root of ROOTS) {
      for (const file of walk(join(REPO, root))) {
        found[relative(REPO, file).split(sep).join("/")] = readFileSync(file, "utf8");
      }
    }
    return found;
  };

  it("classifies every environment variable the repository reads", () => {
    const used = new Set<string>();
    for (const source of Object.values(modules())) {
      for (const name of scanEnvUsage(source)) used.add(name);
    }

    // A new secret must be classified before it can be reported on. Failing
    // here is the intended outcome of adding one — decide whether it is safe
    // to publish and write that down in ENV_CLASS.
    expect([...used].filter((name) => !(name in ENV_CLASS)).sort()).toEqual([]);
  });

  it("has no server-only variable read from a client-reachable module", () => {
    const found = modules();
    const posture = assessSecrets({
      declared: parseEnvExample(readFileSync(join(REPO, ".env.example"), "utf8")),
      usage: Object.fromEntries(
        Object.entries(found).map(([file, source]) => [file, scanEnvUsage(source)])
      ),
      clientFiles: clientReachable(found),
      envFilesIgnored: true,
      registry: ENV_CLASS,
    });

    // Asserts absence, so a passing run publishes nothing. This is the P0 in
    // the charter's escalation list, and it is worth failing the build over.
    expect(posture.issues.filter((issue) => issue.kind === "client-reachable")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/secretsPosture.test.ts`
Expected: FAIL — cannot resolve `./secretsPosture`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/secretsPosture.ts`:

```typescript
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

/** Every module specifier a source file imports, in source order. */
export function parseImports(source: string): string[] {
  const specifiers: string[] = [];
  for (const match of source.matchAll(/(?:^|\s)(?:import|export)[\s\S]*?from\s*["']([^"']+)["']/g)) {
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

/**
 * Every module the browser bundle can reach: the "use client" entry points
 * and everything they import, transitively. Visited-set guarded, so an import
 * cycle terminates rather than hanging the collector.
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
      if (resolved && !reached.has(resolved)) queue.push(resolved);
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
    const secretClass = registry[name] ?? "UNCLASSIFIED";
    const files = readers.get(name) ?? [];
    const clientFile = files.find((file) => clientFiles.has(file)) ?? null;

    rows.push({
      name,
      secretClass,
      documented: declaredNames.has(name),
      reach: clientFile ? "CLIENT" : "server",
    });

    if (secretClass === "UNCLASSIFIED") {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/secretsPosture.test.ts`
Expected: PASS — 33 tests.

Both standing assertions are expected to pass. If the second one fails, that is the charter's P0 and the rule from Task 3 applies with extra force: **do not weaken the assertion, do not commit the failure output, and do not paste the variable name into a commit message or a tracked file.** Record it in the gitignored `docs/reports/security/README.md` and treat rotating the exposed value as the first action, before the code fix.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/secretsPosture.ts lib/reports/secretsPosture.test.ts
git commit -m "feat(reports): check secrets for client reachability and drift"
```

---

### Task 7: Supply chain

**Files:**
- Create: `lib/reports/supplyChain.ts`
- Test: `lib/reports/supplyChain.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `AuditCounts`, `AuditSummary`, `summarizeAudit`, `InstallScriptEntry`, `INSTALL_SCRIPT_REGISTER`, `InstallScriptReport`, `classifyInstallScripts`, `LockfileReport`, `lockfileIntegrity`, `newDirectDependencies`, `renderSupplyChainTable`, `supplyChainSummaryLine`.

Sub-function 5, and the one most likely to be confused with something Operations already does. **Operations reports `npm outdated` — maintenance debt, "we are behind". Security reports exposure — "a package we ship has a known advisory, or can run code on this machine at install time".** Those are different questions with different responses, and a package can be badly outdated with no advisory at all or bang up to date with a critical one. Neither department's number substitutes for the other's, and this module never reads `npm outdated`.

Three inputs, all gathered by the collector and passed in as raw text:

**`npm audit --json`.** Parsed by `summarizeAudit`, which exists mostly to get one thing right: **a failed or unparseable audit produces `null` counts, never zeroes.** This is the single most dangerous rounding in the whole department. A zero in the advisory row renders as "no known vulnerabilities" and reads as an all-clear; the collector runs `npm audit` against the network, and networks fail. `null` renders as `not read`, which is honest. That rule is already in the Global Constraints and this is where it is enforced in code.

**`npm query` for packages carrying install scripts.** A dependency with a `preinstall`, `install`, or `postinstall` script executes arbitrary code on every developer machine and every CI runner that installs it — a materially different level of trust than a package that is merely imported. `INSTALL_SCRIPT_REGISTER` records the ones that have been looked at and accepted, with a reason and the date the decision was made. **A package with an install script and no register entry is `unapproved` and is the finding.** This is the same registry-or-review shape as Tasks 3, 5 and 6: new install-script surface cannot arrive quietly. The register starts populated with the three that exist today, all of them build tooling that ships prebuilt platform binaries — which is the legitimate reason to have an install script and also exactly the shape a malicious one imitates, so the entries record *why* rather than merely listing names.

**`package-lock.json`.** `lockfileIntegrity` counts entries carrying a Subresource-Integrity hash against entries that do not. That ratio is what decides whether `npm ci` can actually verify what it downloads: an entry with no `integrity` field is installed on trust in the registry response alone. The check deliberately excludes the root entry and `link: true` workspace entries, neither of which has a tarball to hash, and separately counts entries resolved from somewhere other than the public registry, since a git or tarball URL in a lockfile is a supply-chain decision worth seeing.

**The live result of the lockfile check is deliberately not stated in this plan.** The check is fully specified above; the answer belongs in the first private WARDEN run. See *What could not be verified* at the end.

`newDirectDependencies` closes the loop on cadence: a direct dependency added since the previous run is new attack surface regardless of whether anything has been reported against it yet, and it is the one supply-chain signal that is genuinely a *diff* rather than a state. On a baseline run — no previous list — it returns empty rather than declaring every dependency new.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/supplyChain.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  classifyInstallScripts,
  INSTALL_SCRIPT_REGISTER,
  lockfileIntegrity,
  newDirectDependencies,
  renderSupplyChainTable,
  summarizeAudit,
  supplyChainSummaryLine,
} from "./supplyChain";

const auditReport = JSON.stringify({
  auditReportVersion: 2,
  vulnerabilities: {
    "left-pad": { name: "left-pad", severity: "high", isDirect: true, fixAvailable: true },
    "deep-thing": { name: "deep-thing", severity: "low", isDirect: false, fixAvailable: false },
  },
  metadata: {
    vulnerabilities: { info: 0, low: 1, moderate: 0, high: 1, critical: 0, total: 2 },
    dependencies: { prod: 10, dev: 20, total: 30 },
  },
});

describe("summarizeAudit", () => {
  it("returns null counts when the audit did not run", () => {
    const summary = summarizeAudit(null);
    expect(summary.readable).toBe(false);
    expect(summary.counts).toBeNull();
  });

  it("returns null counts for empty output rather than zeroes", () => {
    // A zero here would render as "no known vulnerabilities" — a false
    // all-clear is worse than no reading at all.
    expect(summarizeAudit("").counts).toBeNull();
  });

  it("returns null counts for output that is not JSON", () => {
    expect(summarizeAudit("npm ERR! code ENETUNREACH").counts).toBeNull();
  });

  it("returns null counts when metadata is missing", () => {
    expect(summarizeAudit(JSON.stringify({ auditReportVersion: 2 })).counts).toBeNull();
  });

  it("reads the severity counts from a well-formed report", () => {
    const summary = summarizeAudit(auditReport);
    expect(summary.readable).toBe(true);
    expect(summary.counts).toEqual({ info: 0, low: 1, moderate: 0, high: 1, critical: 0, total: 2 });
  });

  it("names the direct dependencies carrying an advisory", () => {
    expect(summarizeAudit(auditReport).directAdvisories).toEqual(["left-pad"]);
  });

  it("counts how many advisories have a fix available", () => {
    expect(summarizeAudit(auditReport).fixAvailable).toBe(1);
  });
});

describe("classifyInstallScripts", () => {
  const queryOutput = JSON.stringify([
    { name: "esbuild", version: "0.28.1", dev: true },
    { name: "sneaky-pkg", version: "1.0.0", dev: false },
  ]);

  const register = {
    esbuild: { reason: "ships prebuilt binaries", approvedOn: "2026-08-08" },
  };

  it("reports unreadable when the query did not run", () => {
    const report = classifyInstallScripts(null, register);
    expect(report.readable).toBe(false);
    expect(report.approved).toEqual([]);
    expect(report.unapproved).toEqual([]);
  });

  it("reports unreadable for output that is not JSON", () => {
    expect(classifyInstallScripts("not json", register).readable).toBe(false);
  });

  it("puts a registered package in approved", () => {
    expect(classifyInstallScripts(queryOutput, register).approved.map((p) => p.name)).toEqual([
      "esbuild",
    ]);
  });

  it("puts an unregistered package in unapproved", () => {
    expect(classifyInstallScripts(queryOutput, register).unapproved.map((p) => p.name)).toEqual([
      "sneaky-pkg",
    ]);
  });

  it("carries the dev flag through so prod surface can be told apart", () => {
    const report = classifyInstallScripts(queryOutput, register);
    expect(report.unapproved[0].dev).toBe(false);
  });

  it("sorts by name so the output is stable across runs", () => {
    const unsorted = JSON.stringify([
      { name: "zebra", version: "1.0.0", dev: false },
      { name: "apple", version: "1.0.0", dev: false },
    ]);
    expect(classifyInstallScripts(unsorted, {}).unapproved.map((p) => p.name)).toEqual([
      "apple",
      "zebra",
    ]);
  });
});

describe("INSTALL_SCRIPT_REGISTER", () => {
  it("gives every entry a reason and an approval date", () => {
    for (const [name, entry] of Object.entries(INSTALL_SCRIPT_REGISTER)) {
      expect(entry.reason.trim(), `${name} reason`).not.toBe("");
      expect(entry.approvedOn, `${name} approvedOn`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("lockfileIntegrity", () => {
  const lockfile = JSON.stringify({
    lockfileVersion: 3,
    packages: {
      "": { name: "app", version: "0.1.0" },
      "node_modules/a": { version: "1.0.0", resolved: "https://registry.npmjs.org/a", integrity: "sha512-x" },
      "node_modules/b": { version: "2.0.0" },
      "node_modules/c": { version: "3.0.0", resolved: "https://github.com/x/c.git#abc", integrity: "sha512-y" },
      "packages/local": { link: true },
    },
  });

  it("reports unreadable when the lockfile could not be read", () => {
    const report = lockfileIntegrity(null);
    expect(report.readable).toBe(false);
    expect(report.hashed).toBeNull();
  });

  it("reads the lockfile version", () => {
    expect(lockfileIntegrity(lockfile).version).toBe(3);
  });

  it("counts only installable entries, excluding the root and links", () => {
    expect(lockfileIntegrity(lockfile).installable).toBe(3);
  });

  it("counts entries carrying an integrity hash", () => {
    expect(lockfileIntegrity(lockfile).hashed).toBe(2);
  });

  it("counts entries resolved from somewhere other than the public registry", () => {
    expect(lockfileIntegrity(lockfile).nonRegistry).toBe(1);
  });

  it("returns unreadable rather than zeroes when packages is missing", () => {
    expect(lockfileIntegrity(JSON.stringify({ lockfileVersion: 3 })).readable).toBe(false);
  });
});

describe("newDirectDependencies", () => {
  it("reports nothing on a baseline run", () => {
    expect(newDirectDependencies(["a", "b"], null)).toEqual([]);
  });

  it("names a dependency that was not there last run", () => {
    expect(newDirectDependencies(["a", "b"], ["a"])).toEqual(["b"]);
  });

  it("does not report a removed dependency as new", () => {
    expect(newDirectDependencies(["a"], ["a", "b"])).toEqual([]);
  });
});

describe("renderSupplyChainTable", () => {
  const rendered = renderSupplyChainTable(
    summarizeAudit(auditReport),
    classifyInstallScripts(
      JSON.stringify([{ name: "sneaky-pkg", version: "1.0.0", dev: false }]),
      {}
    ),
    lockfileIntegrity(JSON.stringify({ lockfileVersion: 3, packages: { "": {} } }))
  );

  it("has a header naming the columns", () => {
    const [header] = rendered.split("\n");
    expect(header).toContain("CHECK");
    expect(header).toContain("READING");
    expect(header).toContain("STATE");
  });

  it("renders an unreadable check as not read rather than as a zero", () => {
    const unread = renderSupplyChainTable(
      summarizeAudit(null),
      classifyInstallScripts(null, {}),
      lockfileIntegrity(null)
    );
    expect(unread).toContain("not read");
    expect(unread).not.toContain(" 0 ");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = rendered.split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("supplyChainSummaryLine", () => {
  it("says not read when the audit failed", () => {
    const line = supplyChainSummaryLine(
      summarizeAudit(null),
      classifyInstallScripts(null, {})
    );
    expect(line).toContain("not read");
  });

  it("counts advisories and unapproved install scripts", () => {
    const line = supplyChainSummaryLine(
      summarizeAudit(auditReport),
      classifyInstallScripts(JSON.stringify([{ name: "sneaky-pkg", version: "1.0.0", dev: false }]), {})
    );
    expect(line).toContain("2 advisories");
    expect(line).toContain("1 unapproved install script");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/supplyChain.test.ts`
Expected: FAIL — cannot resolve `./supplyChain`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/supplyChain.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/supplyChain.test.ts`
Expected: PASS — 27 tests.

There is no standing assertion in this task, deliberately. An advisory count is a fact about the wider ecosystem on a given day, not about this repository's code, so asserting it in `npm test` would break the suite on a morning when someone else published a disclosure — a failure the author of the failing commit cannot act on and did not cause. Advisories belong in the weekly report, where WARDEN can rate them against what actually ships. The install-script register is the part that *is* about this repository, and its shape is asserted.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/supplyChain.ts lib/reports/supplyChain.test.ts
git commit -m "feat(reports): summarise audit, install scripts and lockfile integrity"
```

---

### Task 8: The control registry — baseline, identity, execution, payment, business logic

**Files:**
- Create: `lib/reports/securityBaseline.ts`
- Test: `lib/reports/securityBaseline.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `ControlGroup`, `ControlSignal`, `Control`, `ControlState`, `ControlResult`, `CONTROLS`, `BASELINE_PLAN`, `BASELINE_TASK_COUNT`, `BASELINE_NOT_MECHANISED`, `evaluateControls`, `controlsByGroup`, `EXECUTOR_INVENTORY`, `ExecutorResult`, `assessExecutors`, `renderControlTable`, `renderExecutorTable`, `baselineSummaryLine`.

This is the largest task in the plan and covers four sub-functions at once — 3 (identity and session), 6 (sandbox and code execution), 7 (payment integrity), 8 (business-logic abuse) — plus the transcription of the June 2026 hardening baseline. They share one module because they share one mechanism: **a control is a property of the source that must still be true, expressed as signals that a regex can confirm.** Splitting them into four modules would produce four copies of the same evaluator.

#### Is the June baseline substantial enough to serve as a baseline?

Assessed honestly: **as a provenance list, yes. As a machine-checkable baseline, no — and that gap is what this task closes.**

`docs/superpowers/plans/2026-06-15-security-hardening.md` is about 3 KB: twelve tasks, each two or three checkbox lines. Its value is real and specific — it names twelve distinct controls, the file each one lives in, and the order they were built in, and that is genuinely more than most solo projects have. But three things stop it being usable as-is:

1. **It records intentions, not end states.** "Add `headers()` to `next.config.ts`" tells a reader what was done in June; it does not tell a checker what must still be true in August. Every item has to be re-expressed as a property before anything can verify it.
2. **It carries literal values that have since moved.** At least one task records a specific numeric parameter that has since been *tightened*. A control asserting the literal from the plan would report a hardening as a regression — the crying-wolf failure, arrived at by being too faithful to the baseline. **Controls therefore assert the property (the bound is declared, and it is bounded), never the June literal.**
3. **The pivot moved one item's subject entirely.** Baseline Task 11 constrains columns on a table the subscription pivot replaced. The durable intent — a payment identifier cannot be replayed into two grants — now lives on a different table with a different column. The control follows the intent to where it lives now, and records in its `absentMeans` that it is the successor to the original, rather than asserting a pre-pivot column that no longer gates anything.

So the baseline is kept as **provenance**: every `BASELINE`-group control carries `baselineTask`, the number of the June task it descends from, and `BASELINE_NOT_MECHANISED` records the tasks that deliberately produce no control, with the reason. A test asserts that every one of the twelve is either covered or explained. That is the part that makes "findings already fixed there are not re-reported" a checkable claim rather than a promise: the twelve are *checked* every week and only reported when one stops holding.

#### How a control is expressed

```
Control { id, group, title, file, signals[], absentMeans, baselineTask? }
ControlSignal { label, pattern, file?, absent? }
```

Three properties of that shape are load-bearing:

- **`absentMeans` names the lost capability, never the exploit.** "The admin session could be minted without the secret" is a capability. Anything more specific than that is an instruction, and this file is public. This is rule 2 of *Disclosure discipline* and it binds every entry added later.
- **A signal may name its own `file`,** so one control can span two files. That is not a convenience: the admin token is verified twice, once in Edge with Web Crypto and once in Node with the `crypto` module, and the property worth checking is that *both* verify signature and expiry. A control that could only look at one file could not express the thing that actually matters.
- **A signal may be `absent: true`,** required to be missing rather than present. Some controls are the absence of something — a CSP that has not had `'unsafe-inline'` added back to `script-src` cannot be expressed any other way, and that particular regression is one line and reverts most of the policy's value.

**A control whose file cannot be read is `unknown`, never `present` and never `MISSING`.** Same rule as the audit counts in Task 7: a missing reading is not a result. `unknown` is what appears when a file has been renamed or moved, and it is a signal in its own right — a control pointing at a file that no longer exists is either a stale registry entry or a control that got deleted with its file, and those need a human to tell apart.

#### The executor inventory

Sub-function 6 asks for more than "are the limits present": it asks *where user code runs at all*. `EXECUTOR_INVENTORY` is that list — one entry per place arbitrary user input becomes execution — and each entry references the control ids that bound it. `assessExecutors` joins the two so the report can say, per executor, which of its bounds are holding. Keeping it as a join over `CONTROLS` rather than a second evaluator means a bound is never counted twice, and an executor added without bounds shows up as an executor with an empty bound list rather than quietly passing.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/securityBaseline.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assessExecutors,
  BASELINE_NOT_MECHANISED,
  BASELINE_TASK_COUNT,
  baselineSummaryLine,
  CONTROLS,
  controlsByGroup,
  evaluateControls,
  EXECUTOR_INVENTORY,
  renderControlTable,
  renderExecutorTable,
  type Control,
} from "./securityBaseline";

const control = (overrides: Partial<Control> = {}): Control => ({
  id: "TEST-01",
  group: "BASELINE",
  title: "a test control",
  file: "lib/thing.ts",
  signals: [{ label: "guard", pattern: /\bguardIt\s*\(/ }],
  absentMeans: "the guard would not run",
  ...overrides,
});

describe("evaluateControls", () => {
  it("reports a control whose signals are all present", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "guardIt();" }, [control()]);
    expect(result.state).toBe("present");
    expect(result.missingSignals).toEqual([]);
  });

  it("reports a control with a missing signal and names which one", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "nothing here" }, [control()]);
    expect(result.state).toBe("MISSING");
    expect(result.missingSignals).toEqual(["guard"]);
  });

  it("requires every signal, not merely one", () => {
    const two = control({
      signals: [
        { label: "a", pattern: /\baaa\b/ },
        { label: "b", pattern: /\bbbb\b/ },
      ],
    });
    const [result] = evaluateControls({ "lib/thing.ts": "aaa" }, [two]);
    expect(result.state).toBe("MISSING");
    expect(result.missingSignals).toEqual(["b"]);
  });

  it("reports unknown when the file could not be read", () => {
    const [result] = evaluateControls({ "lib/thing.ts": null }, [control()]);
    expect(result.state).toBe("unknown");
  });

  it("reports unknown when the file is absent from the source map entirely", () => {
    const [result] = evaluateControls({}, [control()]);
    expect(result.state).toBe("unknown");
  });

  it("never reports unknown as present, even with no signals left to check", () => {
    const [result] = evaluateControls({}, [control({ signals: [] })]);
    expect(result.state).toBe("unknown");
  });

  it("ignores a signal matched only inside a comment", () => {
    const [result] = evaluateControls({ "lib/thing.ts": "// guardIt() used to be here" }, [
      control(),
    ]);
    expect(result.state).toBe("MISSING");
  });

  it("preserves registry order so the table is stable across runs", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
      control({ id: "B" }),
      control({ id: "A" }),
    ]);
    expect(results.map((r) => r.control.id)).toEqual(["B", "A"]);
  });
});

describe("evaluateControls with an absent signal", () => {
  const forbidden = control({
    signals: [{ label: "no unsafe-inline", pattern: /unsafe-inline/, absent: true }],
  });

  it("is present when the forbidden pattern is missing", () => {
    expect(evaluateControls({ "lib/thing.ts": "safe" }, [forbidden])[0].state).toBe("present");
  });

  it("is MISSING when the forbidden pattern reappears", () => {
    expect(evaluateControls({ "lib/thing.ts": "unsafe-inline" }, [forbidden])[0].state).toBe(
      "MISSING"
    );
  });
});

describe("evaluateControls across two files", () => {
  const spanning = control({
    signals: [
      { label: "node side", pattern: /nodeVerify/ },
      { label: "edge side", pattern: /edgeVerify/, file: "middleware.ts" },
    ],
  });

  it("is present when both files carry their signal", () => {
    const sources = { "lib/thing.ts": "nodeVerify()", "middleware.ts": "edgeVerify()" };
    expect(evaluateControls(sources, [spanning])[0].state).toBe("present");
  });

  it("is unknown when either file could not be read", () => {
    const sources = { "lib/thing.ts": "nodeVerify()", "middleware.ts": null };
    expect(evaluateControls(sources, [spanning])[0].state).toBe("unknown");
  });
});

describe("CONTROLS registry shape", () => {
  it("gives every control a unique id", () => {
    const ids = CONTROLS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every control at least one signal", () => {
    for (const c of CONTROLS) expect(c.signals.length, c.id).toBeGreaterThan(0);
  });

  it("gives every control an absentMeans describing a lost capability", () => {
    for (const c of CONTROLS) expect(c.absentMeans.trim(), c.id).not.toBe("");
  });

  it("never writes an exploit instruction into absentMeans", () => {
    // Disclosure discipline rule 2: absentMeans says what capability is lost,
    // never how to take it. This is a crude tripwire, not a proof — its job is
    // to make an implementer stop and think before adding a how-to.
    const INSTRUCTIONAL = /\b(curl|POST |payload|proof of concept|bypass by|simply send)\b/i;
    for (const c of CONTROLS) expect(INSTRUCTIONAL.test(c.absentMeans), c.id).toBe(false);
  });
});

describe("baseline provenance", () => {
  it("gives every BASELINE control a baselineTask number", () => {
    for (const c of controlsByGroup(CONTROLS, "BASELINE")) {
      expect(typeof c.baselineTask, c.id).toBe("number");
    }
  });

  it("accounts for every task in the June baseline plan", () => {
    const covered = new Set(
      controlsByGroup(CONTROLS, "BASELINE").map((c) => c.baselineTask as number)
    );
    const uncovered: number[] = [];
    for (let task = 1; task <= BASELINE_TASK_COUNT; task += 1) {
      if (!covered.has(task) && !(task in BASELINE_NOT_MECHANISED)) uncovered.push(task);
    }
    // A baseline task with neither a control nor a recorded reason has been
    // silently dropped, which is the one thing a baseline must not allow.
    expect(uncovered).toEqual([]);
  });

  it("gives every not-mechanised task a reason", () => {
    for (const [task, reason] of Object.entries(BASELINE_NOT_MECHANISED)) {
      expect(reason.trim(), `task ${task}`).not.toBe("");
    }
  });
});

describe("controlsByGroup", () => {
  it("returns only the requested group", () => {
    const mixed = [control({ id: "A" }), control({ id: "B", group: "PAYMENT" })];
    expect(controlsByGroup(mixed, "PAYMENT").map((c) => c.id)).toEqual(["B"]);
  });
});

describe("assessExecutors", () => {
  it("has an entry for every executor in the inventory", () => {
    const results = assessExecutors(evaluateControls({}, CONTROLS));
    expect(results).toHaveLength(EXECUTOR_INVENTORY.length);
  });

  it("references only control ids that exist", () => {
    const ids = new Set(CONTROLS.map((c) => c.id));
    for (const executor of EXECUTOR_INVENTORY) {
      for (const id of executor.boundBy) expect(ids.has(id), `${executor.id} → ${id}`).toBe(true);
    }
  });

  it("gives every executor at least one bound", () => {
    for (const executor of EXECUTOR_INVENTORY) {
      expect(executor.boundBy.length, executor.id).toBeGreaterThan(0);
    }
  });

  it("counts an executor's holding bounds separately from its total", () => {
    const results = assessExecutors([
      {
        control: control({ id: "EXEC-TEST" }),
        state: "present",
        missingSignals: [],
      },
    ], [{ id: "x", language: "Test", runtime: "test", boundBy: ["EXEC-TEST"] }]);
    expect(results[0].holding).toBe(1);
    expect(results[0].total).toBe(1);
  });
});

describe("renderControlTable", () => {
  const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [
    control({ id: "A-01" }),
    control({ id: "A-02", signals: [{ label: "absent thing", pattern: /nope/ }] }),
  ]);

  it("has a header naming the columns", () => {
    const [header] = renderControlTable(results).split("\n");
    expect(header).toContain("CONTROL");
    expect(header).toContain("GROUP");
    expect(header).toContain("STATE");
  });

  it("names every control it was given", () => {
    const rendered = renderControlTable(results);
    expect(rendered).toContain("A-01");
    expect(rendered).toContain("A-02");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderControlTable(results).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("renderExecutorTable", () => {
  it("names each executor and its bound count", () => {
    const rendered = renderExecutorTable(assessExecutors(evaluateControls({}, CONTROLS)));
    for (const executor of EXECUTOR_INVENTORY) expect(rendered).toContain(executor.language);
  });
});

describe("baselineSummaryLine", () => {
  it("reports all clear when every control holds", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();" }, [control()]);
    expect(baselineSummaryLine(results)).toBe("CONTROLS      1/1 holding · none missing, none unknown");
  });

  it("counts missing and unknown separately", () => {
    const results = evaluateControls({ "lib/thing.ts": "guardIt();", "lib/gone.ts": null }, [
      control({ id: "A" }),
      control({ id: "B", signals: [{ label: "x", pattern: /nope/ }] }),
      control({ id: "C", file: "lib/gone.ts" }),
    ]);
    expect(baselineSummaryLine(results)).toContain("1 missing");
    expect(baselineSummaryLine(results)).toContain("1 unknown");
  });
});

describe("standing assertion: the registry points at files that exist", () => {
  const REPO = join(__dirname, "..", "..");

  const filesFor = (c: Control): string[] => [
    c.file,
    ...c.signals.map((signal) => signal.file).filter((file): file is string => Boolean(file)),
  ];

  it("has no control naming a file that is not in the repository", () => {
    const missing: string[] = [];
    for (const c of CONTROLS) {
      for (const file of filesFor(c)) {
        if (!existsSync(join(REPO, file))) missing.push(`${c.id} → ${file}`);
      }
    }
    // A control pointing at a file that no longer exists is either a stale
    // registry entry or a control deleted along with its file. Those need a
    // human to tell apart, so the suite stops here rather than reporting
    // `unknown` every week forever.
    expect(missing).toEqual([]);
  });

  it("has no control in the MISSING state against the live repository", () => {
    const sources: Record<string, string | null> = {};
    for (const c of CONTROLS) {
      for (const file of filesFor(c)) {
        if (file in sources) continue;
        try {
          sources[file] = readFileSync(join(REPO, file), "utf8");
        } catch {
          sources[file] = null;
        }
      }
    }

    // Asserts absence, so a passing run publishes nothing. A failing run names
    // a control id locally and is a finding for the private report.
    const missing = evaluateControls(sources, CONTROLS)
      .filter((result) => result.state === "MISSING")
      .map((result) => result.control.id);

    expect(missing).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/securityBaseline.test.ts`
Expected: FAIL — cannot resolve `./securityBaseline`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/securityBaseline.ts`:

```typescript
/**
 * The control registry: properties of the source that must still be true.
 *
 * Four of the charter's sub-functions live here — identity and session,
 * sandbox and code execution, payment integrity, and business-logic abuse —
 * together with the June 2026 hardening baseline transcribed into checkable
 * form. They share a module because they share a mechanism, not because they
 * are the same subject: a control is a named property, a file, and the
 * signals that prove it. Four copies of one evaluator would be four places to
 * fix the same bug.
 *
 * Three rules the registry enforces on itself:
 *
 * 1. `absentMeans` names the capability that is lost, never how to take it.
 *    This file is tracked in a public repository. "The admin session could be
 *    minted without the secret" is a capability; anything more specific is an
 *    instruction. The test file carries a crude tripwire for that.
 * 2. A control whose file cannot be read is `unknown` — never `present`, and
 *    never `MISSING`. A missing reading is not a result, exactly as a failed
 *    `npm audit` is not a count of zero.
 * 3. Baseline controls assert the *property*, not the literal value recorded
 *    in the June plan. At least one of those literals has since been
 *    tightened, and a control asserting the old number would report a
 *    hardening as a regression — the crying-wolf failure reached by being too
 *    faithful to the baseline.
 */

export type ControlGroup = "BASELINE" | "IDENTITY" | "EXECUTION" | "PAYMENT" | "BUSINESS";

export interface ControlSignal {
  /** Named so a missing signal can be reported without printing the regex. */
  label: string;
  pattern: RegExp;
  /** Defaults to the control's own file. Set it to span two files. */
  file?: string;
  /** When true the pattern must NOT match — the control is an absence. */
  absent?: boolean;
}

export interface Control {
  id: string;
  group: ControlGroup;
  title: string;
  /** Repo-relative path the control primarily lives in. */
  file: string;
  /** Every signal must hold. */
  signals: ControlSignal[];
  /** The capability lost if this control is gone. Never an exploit path. */
  absentMeans: string;
  /** Task number in the June baseline plan, for BASELINE controls. */
  baselineTask?: number;
}

export const BASELINE_PLAN = "docs/superpowers/plans/2026-06-15-security-hardening.md";
export const BASELINE_TASK_COUNT = 12;

/**
 * Baseline tasks that deliberately produce no control, and why.
 *
 * A baseline task with neither a control nor an entry here has been silently
 * dropped, which is the one thing a baseline must not permit. The test file
 * asserts that every task from 1 to BASELINE_TASK_COUNT is accounted for.
 */
export const BASELINE_NOT_MECHANISED: Record<number, string> = {
  6: "UI refactor — the admin login page. Its durable property is that authentication travels in a signed cookie rather than a URL parameter, which BASE-06 and BASE-09 already assert. A separate control would assert the page's markup, which changes for cosmetic reasons and would produce noise.",
  7: "UI refactor — the admin dashboard. Same reasoning as task 6; the security-relevant half is session verification, already covered.",
};

export const CONTROLS: readonly Control[] = [
  // ── BASELINE — transcribed from the June 2026 hardening plan ─────────────
  {
    id: "BASE-01",
    group: "BASELINE",
    title: "Security response headers",
    file: "next.config.ts",
    baselineTask: 1,
    signals: [
      { label: "headers() hook", pattern: /async\s+headers\s*\(/ },
      { label: "HSTS", pattern: /Strict-Transport-Security/ },
      { label: "nosniff", pattern: /X-Content-Type-Options/ },
      { label: "frame options", pattern: /X-Frame-Options/ },
      { label: "referrer policy", pattern: /Referrer-Policy/ },
      { label: "permissions policy", pattern: /Permissions-Policy/ },
    ],
    absentMeans:
      "Browsers would apply their permissive defaults for framing, referrer leakage, MIME sniffing and transport downgrade.",
  },
  {
    id: "BASE-02",
    group: "BASELINE",
    title: "Nonce-based Content-Security-Policy",
    file: "middleware.ts",
    baselineTask: 1,
    signals: [
      { label: "CSP header set", pattern: /Content-Security-Policy/ },
      { label: "per-request nonce", pattern: /nonce-\$\{nonce\}/ },
      { label: "framing denied", pattern: /frame-ancestors 'none'/ },
    ],
    absentMeans:
      "Injected script would run with the page's privileges; the policy is what makes an injection inert rather than executable. Lives in middleware rather than next.config.ts because the nonce must be regenerated per request.",
  },
  {
    id: "BASE-03",
    group: "BASELINE",
    title: "CSP has not regained script-src 'unsafe-inline'",
    file: "middleware.ts",
    baselineTask: 1,
    signals: [
      {
        label: "no unsafe-inline in script-src",
        pattern: /script-src[^;`]*'unsafe-inline'/,
        absent: true,
      },
    ],
    absentMeans:
      "Most of the script policy's value would be gone in one line while the header still appears to be present — a regression that reads as compliant.",
  },
  {
    id: "BASE-04",
    group: "BASELINE",
    title: "UNLOCK_ALL cannot be enabled in production",
    file: "lib/unlocks.ts",
    baselineTask: 2,
    signals: [
      { label: "flag read", pattern: /UNLOCK_ALL/ },
      { label: "production check", pattern: /NODE_ENV\s*===\s*["']production["']/ },
      { label: "throws rather than degrades", pattern: /throw new Error/ },
    ],
    absentMeans: "A development convenience flag could make all paid content free in production.",
  },
  {
    id: "BASE-05",
    group: "BASELINE",
    title: "Event type allowlist at the API boundary",
    file: "app/api/events/route.ts",
    baselineTask: 2,
    signals: [
      { label: "allowlist set", pattern: /VALID_EVENT_TYPES/ },
      { label: "membership check", pattern: /VALID_EVENT_TYPES\.has\(/ },
    ],
    absentMeans:
      "Arbitrary caller-chosen strings would enter the analytics table, and the enum that Growth reads would stop being a closed set.",
  },
  {
    id: "BASE-06",
    group: "BASELINE",
    title: "In-memory rate-limit map is bounded",
    file: "lib/rateLimit.ts",
    baselineTask: 9,
    signals: [
      { label: "size ceiling", pattern: /MAX_MAP_SIZE/ },
      { label: "eviction", pattern: /\.delete\(/ },
    ],
    absentMeans:
      "The limiter's own state would grow without limit, turning a defence against abuse into a way to exhaust the function's memory.",
  },
  {
    id: "BASE-07",
    group: "BASELINE",
    title: "Admin session is HMAC-signed with an expiry",
    file: "lib/auth/adminSession.ts",
    baselineTask: 4,
    signals: [
      { label: "HMAC", pattern: /createHmac\(\s*["']sha256["']/ },
      { label: "constant-time compare", pattern: /timingSafeEqual\(/ },
      { label: "expiry in payload", pattern: /\bexp\b/ },
    ],
    absentMeans: "An admin session could be minted or extended without possession of the secret.",
  },
  {
    id: "BASE-08",
    group: "BASELINE",
    title: "Admin password compared in constant time",
    file: "lib/auth/adminSession.ts",
    baselineTask: 5,
    signals: [
      { label: "checkAdminPassword", pattern: /function checkAdminPassword/ },
      { label: "constant-time compare", pattern: /timingSafeEqual\(/ },
      { label: "length guard before compare", pattern: /\.length\s*===\s*\w+\.length/ },
    ],
    absentMeans:
      "The comparison's duration would carry information about the secret it is comparing against.",
  },
  {
    id: "BASE-09",
    group: "BASELINE",
    title: "Admin session cookie is HttpOnly, Secure and SameSite-strict",
    file: "lib/auth/adminSession.ts",
    baselineTask: 4,
    signals: [
      { label: "httpOnly", pattern: /httpOnly:\s*true/ },
      { label: "secure in production", pattern: /secure:\s*process\.env\.NODE_ENV/ },
      { label: "sameSite strict", pattern: /sameSite:\s*["']strict["']/ },
    ],
    absentMeans:
      "The session cookie would be readable by page script or attachable to cross-site requests.",
  },
  {
    id: "BASE-10",
    group: "BASELINE",
    title: "Middleware guards the admin surface",
    file: "middleware.ts",
    baselineTask: 8,
    signals: [
      { label: "admin path match", pattern: /pathname\.startsWith\(["']\/admin["']\)/ },
      { label: "token verification", pattern: /verifyAdminToken\(/ },
      { label: "unauthenticated redirect", pattern: /NextResponse\.redirect\(/ },
    ],
    absentMeans:
      "The admin surface would rely entirely on each page and route remembering to check for itself, with no layer beneath them.",
  },
  {
    id: "BASE-11",
    group: "BASELINE",
    title: "Sandboxed programs run under resource limits",
    file: "lib/ide/sandboxRunner.ts",
    baselineTask: 3,
    signals: [
      { label: "cpu limit", pattern: /ulimit[^"`\n]*-t\s+\d+/ },
      { label: "memory limit", pattern: /-v\s+\d+/ },
      { label: "process limit", pattern: /-u\s+\d+/ },
      { label: "file size limit", pattern: /-f\s+\d+/ },
    ],
    absentMeans:
      "A submitted program could consume CPU, memory, process slots or disk without a ceiling.",
  },
  {
    id: "BASE-12",
    group: "BASELINE",
    title: "Execution route declares a duration ceiling and payload caps",
    file: "app/api/run/route.ts",
    baselineTask: 3,
    signals: [
      { label: "maxDuration declared", pattern: /export const maxDuration\s*=\s*\d+/ },
      { label: "code size cap", pattern: /MAX_CODE_BYTES/ },
      { label: "stdin size cap", pattern: /MAX_STDIN_BYTES/ },
      { label: "oversize rejected", pattern: /status:\s*413/ },
    ],
    absentMeans:
      "A single request could hold a function open to its platform ceiling, or submit an unbounded body. The June plan recorded a specific duration; this asserts that a ceiling is declared, not which number it is, because the live value has since been tightened.",
  },
  {
    id: "BASE-13",
    group: "BASELINE",
    title: "Browser Python runs in a worker with an enforced timeout",
    file: "lib/ide/runners/pyodideRunner.ts",
    baselineTask: 10,
    signals: [
      { label: "dedicated worker", pattern: /new Worker\(/ },
      { label: "timeout constant", pattern: /TIMEOUT_MS/ },
      { label: "terminated on timeout", pattern: /\.terminate\(\)/ },
    ],
    absentMeans:
      "A non-terminating program would hold the page's main thread rather than a disposable worker, and nothing would reclaim it.",
  },
  {
    id: "BASE-14",
    group: "BASELINE",
    title: "Payment identifier is unique at the database level",
    file: "supabase/migrations/20260624120000_payments_ledger.sql",
    baselineTask: 11,
    signals: [
      { label: "unique index", pattern: /create unique index/i },
      { label: "on the link identifier", pattern: /paymongo_link_id/ },
    ],
    absentMeans:
      "One payment could be recorded more than once, so a duplicate delivery would produce a duplicate grant. Successor to the June task's constraint, which was written against the pre-pivot unlocks table; the intent moved with the ledger.",
  },
  {
    id: "BASE-15",
    group: "BASELINE",
    title: "Environment variables are documented with their exposure class",
    file: ".env.example",
    baselineTask: 12,
    signals: [
      { label: "service role documented", pattern: /SUPABASE_SERVICE_ROLE_KEY/ },
      { label: "server-only marked", pattern: /SERVER ONLY/i },
      { label: "public prefix explained", pattern: /NEXT_PUBLIC_/ },
    ],
    absentMeans:
      "The next person configuring a deployment would have no record of which values are safe to publish.",
  },

  // ── IDENTITY — sub-function 3 ────────────────────────────────────────────
  {
    id: "IDENT-01",
    group: "IDENTITY",
    title: "Device cookie is HMAC-signed and verified in constant time",
    file: "lib/auth/deviceCookie.ts",
    signals: [
      { label: "HMAC", pattern: /createHmac\(\s*["']sha256["']/ },
      { label: "constant-time compare", pattern: /timingSafeEqual\(/ },
    ],
    absentMeans:
      "Device identity could be asserted without possession of the secret. This is the product's entitlement key: everything paid is gated on it.",
  },
  {
    id: "IDENT-02",
    group: "IDENTITY",
    title: "Device cookie secret is required, never defaulted",
    file: "lib/auth/deviceCookie.ts",
    signals: [
      { label: "throws when unset", pattern: /DEVICE_COOKIE_SECRET[\s\S]{0,200}throw new Error/ },
    ],
    absentMeans:
      "A deployment missing the secret would fall back to a predictable one instead of refusing to run.",
  },
  {
    id: "IDENT-03",
    group: "IDENTITY",
    title: "Device identifier shape is validated before it is trusted",
    file: "lib/auth/deviceCookie.ts",
    signals: [{ label: "uuid check", pattern: /isUuid\(/ }],
    absentMeans:
      "A structurally arbitrary identifier could reach the queries and constraints that assume a UUID.",
  },
  {
    id: "IDENT-04",
    group: "IDENTITY",
    title: "Device cookie is HttpOnly, Secure and path-scoped",
    file: "lib/auth/deviceCookie.ts",
    signals: [
      { label: "httpOnly", pattern: /httpOnly:\s*true/ },
      { label: "secure in production", pattern: /secure:\s*process\.env\.NODE_ENV/ },
      { label: "sameSite declared", pattern: /sameSite:/ },
      { label: "path declared", pattern: /path:\s*["']/ },
    ],
    absentMeans:
      "The entitlement cookie would be readable by page script, or sent on paths it has no business reaching.",
  },
  {
    id: "IDENT-05",
    group: "IDENTITY",
    title: "Admin session expiry is enforced, not merely recorded",
    file: "lib/auth/adminSession.ts",
    signals: [{ label: "expiry compared to now", pattern: /Date\.now\(\)\s*<\s*exp/ }],
    absentMeans: "A session would remain valid for as long as its signature does, which is forever.",
  },
  {
    id: "IDENT-06",
    group: "IDENTITY",
    title: "Admin login is lockout-protected by shared state",
    file: "app/api/admin/login/route.ts",
    signals: [{ label: "lockout RPC", pattern: /["']check_login_lockout["']/ }],
    absentMeans:
      "Repeated login attempts would be bounded only per serverless instance, which on this platform is not a bound at all.",
  },
  {
    id: "IDENT-07",
    group: "IDENTITY",
    title: "Edge and Node verifiers both check signature and expiry",
    file: "lib/auth/adminSession.ts",
    signals: [
      { label: "node signature check", pattern: /timingSafeEqual\(/ },
      { label: "node expiry check", pattern: /Date\.now\(\)\s*<\s*exp/ },
      { label: "edge signature check", pattern: /crypto\.subtle\.verify\(/, file: "middleware.ts" },
      { label: "edge expiry check", pattern: /Date\.now\(\)\s*<\s*decoded\.exp/, file: "middleware.ts" },
    ],
    absentMeans:
      "The same token is verified twice by two different implementations. If they diverge, one layer accepts what the other rejects and the weaker one becomes the real policy.",
  },

  // ── EXECUTION — sub-function 6 ───────────────────────────────────────────
  {
    id: "EXEC-01",
    group: "EXECUTION",
    title: "Server-side execution requires a verified device identity",
    file: "app/api/run/route.ts",
    signals: [
      { label: "device verification", pattern: /verifyDeviceCookie\(/ },
      { label: "rejects without it", pattern: /status:\s*401/ },
    ],
    absentMeans:
      "The endpoint would accept fully anonymous submissions, making it an open proxy onto a shared third-party execution service under this project's reputation.",
  },
  {
    id: "EXEC-02",
    group: "EXECUTION",
    title: "Execution is rate limited by both network address and device",
    file: "app/api/run/route.ts",
    signals: [
      { label: "limiter", pattern: /isRateLimited\(/ },
      { label: "device dimension", pattern: /device:\$\{deviceId\}/ },
      { label: "rejects when limited", pattern: /status:\s*429/ },
    ],
    absentMeans:
      "Either dimension alone is insufficient — one is rotatable, the other is shared by everyone behind a campus network.",
  },
  {
    id: "EXEC-03",
    group: "EXECUTION",
    title: "Execution language is chosen from an allowlist",
    file: "app/api/run/route.ts",
    signals: [
      { label: "allowlist", pattern: /SERVER_LANGS/ },
      { label: "membership check", pattern: /SERVER_LANGS\.includes\(/ },
    ],
    absentMeans:
      "A caller-supplied language identifier would reach the execution backend unfiltered.",
  },
  {
    id: "EXEC-04",
    group: "EXECUTION",
    title: "Sandbox lifetime is bounded and teardown always runs",
    file: "lib/ide/sandboxRunner.ts",
    signals: [
      { label: "creation timeout", pattern: /timeout:\s*\d+/ },
      { label: "teardown in finally", pattern: /finally\s*\{[\s\S]*?\.stop\(\)/ },
    ],
    absentMeans:
      "A sandbox could outlive the request that created it, and a failure mid-run would leak the microVM rather than reclaim it.",
  },
  {
    id: "EXEC-05",
    group: "EXECUTION",
    title: "JVM heap and stack are capped inside the sandbox",
    file: "lib/ide/sandboxRunner.ts",
    signals: [
      { label: "heap cap", pattern: /-Xmx\d+[a-zA-Z]/ },
      { label: "stack cap", pattern: /-Xss\d+[a-zA-Z]/ },
    ],
    absentMeans:
      "The JVM would size itself against the whole machine, so the process-level limits would be reached by way of a crash rather than a rejection.",
  },
  {
    id: "EXEC-06",
    group: "EXECUTION",
    title: "The Python worker gets its own narrowly-scoped CSP",
    file: "next.config.ts",
    signals: [
      { label: "worker-specific header set", pattern: /pyodideWorker/ },
      { label: "scoped by source path", pattern: /source:\s*["']\/pyodideWorker\.js["']/ },
    ],
    absentMeans:
      "The eval permission the Python runtime needs would have to be granted to every page instead of to one script.",
  },

  // ── PAYMENT — sub-function 7 ─────────────────────────────────────────────
  {
    id: "PAY-01",
    group: "PAYMENT",
    title: "Webhook signature is verified on the raw body before parsing",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "raw body read", pattern: /await req\.text\(\)/ },
      {
        label: "verified before parse",
        pattern: /verifyPaymongoWebhook\([\s\S]*?JSON\.parse\(rawBody/,
      },
      { label: "rejects on failure", pattern: /status:\s*401/ },
    ],
    absentMeans:
      "Unverified input would reach the parser, and the bytes that were signed would not be the bytes that were acted on.",
  },
  {
    id: "PAY-02",
    group: "PAYMENT",
    title: "Webhook signature carries a bounded timestamp",
    file: "lib/paymongo.ts",
    signals: [
      { label: "tolerance constant", pattern: /WEBHOOK_TOLERANCE_SECONDS/ },
      { label: "age compared", pattern: /Math\.abs\(/ },
    ],
    absentMeans:
      "A valid signature would stay valid indefinitely, so an old delivery could be presented again at any time.",
  },
  {
    id: "PAY-03",
    group: "PAYMENT",
    title: "Webhook secret absence fails closed",
    file: "lib/paymongo.ts",
    signals: [
      { label: "returns false when unset", pattern: /PAYMONGO_WEBHOOK_SECRET[\s\S]{0,160}return false/ },
      { label: "constant-time compare", pattern: /timingSafeEqual\(/ },
    ],
    absentMeans:
      "A deployment missing the secret would accept every delivery instead of none — the direction that matters.",
  },
  {
    id: "PAY-04",
    group: "PAYMENT",
    title: "Mode mismatch is ignored and labelled",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "expected mode constant", pattern: /EXPECTED_LIVEMODE/ },
      { label: "mismatch compared", pattern: /livemode\s*!==\s*EXPECTED_LIVEMODE/ },
      { label: "ignore is labelled", pattern: /ignored:\s*["']livemode["']/ },
    ],
    absentMeans:
      "Deliveries from the other PayMongo mode would be acted on. The label matters as much as the check: this branch answers 2xx, so without it a misconfiguration is indistinguishable from normal operation on both sides. Task 9 reads this label as the detection signal for the trap.",
  },
  {
    id: "PAY-05",
    group: "PAYMENT",
    title: "Replay is deduplicated on a database constraint, not a read",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "unique-violation handled", pattern: /["']23505["']/ },
      {
        label: "constraint exists",
        pattern: /create unique index/i,
        file: "supabase/migrations/20260624120000_payments_ledger.sql",
      },
    ],
    absentMeans:
      "Deduplication would depend on a read-then-write that two concurrent deliveries can both pass.",
  },
  {
    id: "PAY-06",
    group: "PAYMENT",
    title: "Paid amount is re-derived server-side and underpayment refused",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "expected amount computed", pattern: /expectedAmount/ },
      { label: "underpayment compared", pattern: /paidAmount\s*<\s*expectedAmount/ },
      { label: "refused", pattern: /status:\s*400/ },
    ],
    absentMeans:
      "The amount named in the delivery would be the amount believed, and the price would effectively be caller-chosen.",
  },
  {
    id: "PAY-07",
    group: "PAYMENT",
    title: "Entitlement requires an explicit paid status",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "explicit status required", pattern: /paidStatus\s*!==\s*["']paid["']/ },
      { label: "type checked first", pattern: /typeof paidStatus\s*!==\s*["']string["']/ },
    ],
    absentMeans:
      "A delivery with a missing or unexpected status field would be treated as a completed payment.",
  },
  {
    id: "PAY-08",
    group: "PAYMENT",
    title: "The ledger row is written before access is granted",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "payments insert", pattern: /from\(["']payments["']\)[\s\S]{0,200}insert\(/ },
      { label: "failure stops the grant", pattern: /paymentError/ },
    ],
    absentMeans:
      "Access could exist with no money recorded against it, which is precisely the exception Finance's reconciliation is built to detect — and it should never have to.",
  },

  // ── BUSINESS — sub-function 8 ────────────────────────────────────────────
  {
    id: "BIZ-01",
    group: "BUSINESS",
    title: "Seat cap is enforced by a database trigger",
    file: "supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql",
    signals: [
      { label: "trigger created", pattern: /create trigger class_members_seat_cap_trigger/i },
      { label: "raises on overflow", pattern: /raise exception/i },
    ],
    absentMeans:
      "The seat cap would be enforced only by the route that checks it, so any other write path — or two at once — would not be bound by it.",
  },
  {
    id: "BIZ-02",
    group: "BUSINESS",
    title: "Seat count is read under a row lock",
    file: "supabase/migrations/20260716010000_class_members_seat_cap_trigger.sql",
    signals: [{ label: "for update", pattern: /for update/i }],
    absentMeans:
      "Concurrent approvals could each read a stale count, so the cap would hold for one request at a time and not for two.",
  },
  {
    id: "BIZ-03",
    group: "BUSINESS",
    title: "Join-request decisions are rep-only and single-use",
    file: "app/api/class/[code]/rep/decide/route.ts",
    signals: [
      { label: "device identity required", pattern: /status:\s*401/ },
      { label: "non-rep refused", pattern: /status:\s*403/ },
      { label: "already-decided refused", pattern: /already_decided/ },
    ],
    absentMeans:
      "A pending request could be decided by someone other than the class representative, or decided more than once.",
  },
  {
    id: "BIZ-04",
    group: "BUSINESS",
    title: "Class checkout prices are computed server-side from a floor",
    file: "app/api/class/checkout/route.ts",
    signals: [
      { label: "server-side amount", pattern: /computeAmount\(/ },
      { label: "minimum seats enforced", pattern: /seats\s*<\s*MIN_SEATS/ },
    ],
    absentMeans:
      "The amount charged for a block purchase would be derived from a caller-supplied seat count with no floor beneath it.",
  },
  {
    id: "BIZ-05",
    group: "BUSINESS",
    title: "Block webhook re-derives the price rather than trusting the link",
    file: "app/api/webhooks/paymongo/route.ts",
    signals: [
      { label: "per-seat price re-derived", pattern: /PER_SEAT_CENTAVOS/ },
      { label: "included seats re-derived", pattern: /INCLUDED_SEATS/ },
    ],
    absentMeans:
      "The seat count carried in the payment's own metadata would set the entitlement without the price ever being checked against it.",
  },
  {
    id: "BIZ-06",
    group: "BUSINESS",
    title: "Feedback coupons are one per user per module and single-redemption",
    file: "supabase/migrations/20260719000000_user_feedback_dedup.sql",
    signals: [
      { label: "unique per user and module", pattern: /create unique index[\s\S]*?user_id, module_id/i },
      { label: "unique per device and module", pattern: /create unique index[\s\S]*?device_id, module_id/i },
      {
        label: "redemption is conditional on being unredeemed",
        pattern: /is\(\s*['"]redeemed_at['"]\s*,\s*null\s*\)/,
        file: "app/api/subscribe/route.ts",
      },
    ],
    absentMeans:
      "Discount coupons could be minted repeatedly for the same module, or one coupon redeemed more than once.",
  },
];

export type ControlState = "present" | "MISSING" | "unknown";

export interface ControlResult {
  control: Control;
  state: ControlState;
  /** Labels of the signals that did not hold. Never the patterns themselves. */
  missingSignals: string[];
}

/**
 * Strips comments so a control is not satisfied by a mention of itself.
 *
 * The same crude approach as routeGuards.stripComments and for the same
 * reason: it over-strips rather than over-matches, and over-stripping costs a
 * control that a human then looks at, while over-matching costs a control
 * that silently reports itself as present after being deleted.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|\s)\/\/[^\n]*/g, "$1 ")
    .replace(/(^|\n)\s*--[^\n]*/g, "$1 ");
}

export function evaluateControls(
  sources: Record<string, string | null>,
  controls: readonly Control[] = CONTROLS
): ControlResult[] {
  return controls.map((control) => {
    const needed = new Set([control.file, ...control.signals.map((s) => s.file ?? control.file)]);

    // A file we could not read is not evidence of anything. Never fold an
    // unreadable file into "present" and never into "MISSING" — an unmeasured
    // control is `unknown`, exactly as an unmeasured metric is `not read`.
    for (const file of needed) {
      if (typeof sources[file] !== "string") {
        return { control, state: "unknown" as const, missingSignals: [] };
      }
    }

    const stripped = new Map<string, string>();
    for (const file of needed) stripped.set(file, stripComments(sources[file] as string));

    const missingSignals = control.signals
      .filter((signal) => {
        const text = stripped.get(signal.file ?? control.file) as string;
        const matched = signal.pattern.test(text);
        return signal.absent ? matched : !matched;
      })
      .map((signal) => signal.label);

    return {
      control,
      state: missingSignals.length === 0 ? ("present" as const) : ("MISSING" as const),
      missingSignals,
    };
  });
}

export function controlsByGroup(controls: readonly Control[], group: ControlGroup): Control[] {
  return controls.filter((control) => control.group === group);
}

export interface Executor {
  id: string;
  /** What the user writes. */
  language: string;
  /** Where it runs. */
  runtime: string;
  /** Control ids that bound it. */
  boundBy: string[];
}

/**
 * Every place arbitrary user input becomes execution.
 *
 * The charter calls this the highest-surface area in the product, and the
 * list is the half of that sub-function a control registry alone cannot
 * answer: controls say whether a bound holds, this says what needs bounding.
 * An executor added without bounds appears here with an empty `boundBy`
 * rather than passing unnoticed.
 */
export const EXECUTOR_INVENTORY: readonly Executor[] = [
  {
    id: "pyodide",
    language: "Python",
    runtime: "Pyodide in a browser worker",
    boundBy: ["BASE-13", "EXEC-06"],
  },
  {
    id: "sqljs",
    language: "SQL",
    runtime: "sql.js in the browser",
    boundBy: ["BASE-02"],
  },
  {
    id: "server-exec",
    language: "C and Java",
    runtime: "remote execution service via /api/run",
    boundBy: ["BASE-12", "EXEC-01", "EXEC-02", "EXEC-03"],
  },
  {
    id: "vercel-sandbox",
    language: "C and Java",
    runtime: "Vercel Sandbox microVM",
    boundBy: ["BASE-11", "EXEC-04", "EXEC-05"],
  },
];

export interface ExecutorResult {
  executor: Executor;
  holding: number;
  total: number;
  /** Ids of the executor's bounds that are not currently present. */
  notHolding: string[];
}

export function assessExecutors(
  results: ControlResult[],
  inventory: readonly Executor[] = EXECUTOR_INVENTORY
): ExecutorResult[] {
  const byId = new Map(results.map((result) => [result.control.id, result]));
  return inventory.map((executor) => {
    const notHolding = executor.boundBy.filter((id) => byId.get(id)?.state !== "present");
    return {
      executor,
      holding: executor.boundBy.length - notHolding.length,
      total: executor.boundBy.length,
      notHolding,
    };
  });
}

const ID_WIDTH = 12;
const GROUP_WIDTH = 12;
const TITLE_WIDTH = 52;
const STATE_WIDTH = 10;
const CONTROL_RULE_WIDTH = ID_WIDTH + GROUP_WIDTH + TITLE_WIDTH + STATE_WIDTH;

export function renderControlTable(results: ControlResult[]): string {
  const header =
    "CONTROL".padEnd(ID_WIDTH) +
    "GROUP".padEnd(GROUP_WIDTH) +
    "TITLE".padEnd(TITLE_WIDTH) +
    "STATE".padEnd(STATE_WIDTH);

  const body = results.map(
    ({ control, state }) =>
      control.id.padEnd(ID_WIDTH) +
      control.group.padEnd(GROUP_WIDTH) +
      control.title.slice(0, TITLE_WIDTH - 1).padEnd(TITLE_WIDTH) +
      state.padEnd(STATE_WIDTH)
  );

  return [header, "─".repeat(CONTROL_RULE_WIDTH), ...body].join("\n");
}

const LANGUAGE_WIDTH = 16;
const RUNTIME_WIDTH = 38;
const BOUNDS_WIDTH = 12;
const EXECUTOR_RULE_WIDTH = LANGUAGE_WIDTH + RUNTIME_WIDTH + BOUNDS_WIDTH;

export function renderExecutorTable(results: ExecutorResult[]): string {
  const header =
    "LANGUAGE".padEnd(LANGUAGE_WIDTH) +
    "RUNTIME".padEnd(RUNTIME_WIDTH) +
    "BOUNDS".padEnd(BOUNDS_WIDTH);

  const body = results.map(
    ({ executor, holding, total }) =>
      executor.language.padEnd(LANGUAGE_WIDTH) +
      executor.runtime.padEnd(RUNTIME_WIDTH) +
      `${holding}/${total}`.padEnd(BOUNDS_WIDTH)
  );

  return [header, "─".repeat(EXECUTOR_RULE_WIDTH), ...body].join("\n");
}

export function baselineSummaryLine(results: ControlResult[]): string {
  const missing = results.filter((result) => result.state === "MISSING").length;
  const unknown = results.filter((result) => result.state === "unknown").length;
  const holding = results.length - missing - unknown;

  if (missing === 0 && unknown === 0) {
    return `CONTROLS      ${holding}/${results.length} holding · none missing, none unknown`;
  }
  // Counts only — which control lapsed is a finding, and findings live in the
  // private report.
  return `CONTROLS      ${holding}/${results.length} holding · ${missing} missing · ${unknown} unknown`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/securityBaseline.test.ts`
Expected: PASS — 30 tests.

Both standing assertions are expected to pass against the repository as it stands. Rule from Task 3 applies unchanged: if the second one fails, **do not weaken it, do not name the control id in a commit message,** record it in the gitignored README and let the first WARDEN run write it up with options.

If the *first* one fails, the cause is almost always benign — a file was renamed and the registry still points at the old path. Fix the registry path in the same commit; that is registry maintenance, not a finding.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/securityBaseline.ts lib/reports/securityBaseline.test.ts
git commit -m "feat(reports): encode the hardening baseline and posture controls"
```

---

### Task 9: Detection coverage

**Files:**
- Create: `lib/reports/detectionCoverage.ts`
- Test: `lib/reports/detectionCoverage.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `DetectionProbe`, `DetectionEntry`, `DETECTION_MATRIX`, `Coverage`, `DetectionResult`, `assessDetection`, `renderDetectionTable`, `detectionSummaryLine`.

Sub-function 11, and the charter states it better than a restatement could: *if this were being attacked right now, what would show it?* Every other module in this department answers "is the defence there". This one answers "and if it fails, would anyone find out" — which is a different question with a much worse average answer, in every product, always.

The matrix has exactly six rows, one per P0 in the charter's escalation list, in the charter's order. That is deliberate and it is the whole design: **detection is assessed against the things that would be catastrophic, not against everything that could be logged.** Six rows is also a number a reader will actually read every week.

Each row names the escalation, names the signal that would reveal it, and carries probes — patterns over real source that establish whether that signal exists. Coverage is derived, never asserted:

| Every probe holds | `covered` |
| Some hold | `partial` |
| None hold | `BLIND` |
| A probe's file could not be read | `unknown` |
| The entry has no probes and a `blindReason` | `BLIND`, always |

That last row is the one that makes this module honest. Some escalations have **no** signal, and the correct output is to say so permanently rather than to invent a weak probe that renders as partial coverage. An entry with a `blindReason` is a recorded structural blind spot: it stays `BLIND` every week, WARDEN reports it as a standing `ACCEPTED` finding with a reopen trigger rather than a new one, and it stops being a thing that gets rediscovered and re-argued every run.

Two findings fall out of the design before a single run happens, and both are worth stating in advance because they shape how WARDEN should read this table:

- **The two highest escalations have no runtime signal at all.** An RLS gap and a secret in the client bundle produce no error, no log line, and no 5xx — the product works perfectly while exposed. Their detection is entirely *build-time*: the standing assertions in Tasks 3 and 6, which fail `npm test`. That is genuinely good coverage, but it is a different kind, and the matrix records it as such rather than pretending a runtime signal exists. It also means those two assertions are load-bearing security infrastructure, not test hygiene, and deleting one to make a build green is itself the incident.
- **Most rejection paths are silent by design.** Returning 401 without logging is correct engineering — logging every rejection is how a log becomes useless — but it means the only aggregate view of a sustained forgery attempt is the status-code breakdown, which lives in Operations, and which on this hosting tier has a known window bug recorded in the handoff. The matrix records the dependency instead of assuming the signal.

- [ ] **Step 1: Write the failing test**

Create `lib/reports/detectionCoverage.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  assessDetection,
  detectionSummaryLine,
  DETECTION_MATRIX,
  renderDetectionTable,
  type DetectionEntry,
} from "./detectionCoverage";

const entry = (overrides: Partial<DetectionEntry> = {}): DetectionEntry => ({
  id: "T1",
  escalation: "a bad thing happens",
  wouldShow: "an error is logged",
  probes: [{ label: "logs", pattern: /console\.error/, file: "lib/thing.ts" }],
  ...overrides,
});

describe("assessDetection", () => {
  it("rates an entry with every probe holding as covered", () => {
    const [result] = assessDetection({ "lib/thing.ts": "console.error('x')" }, [entry()]);
    expect(result.coverage).toBe("covered");
  });

  it("rates an entry with no probe holding as BLIND", () => {
    const [result] = assessDetection({ "lib/thing.ts": "silent()" }, [entry()]);
    expect(result.coverage).toBe("BLIND");
  });

  it("rates an entry with some probes holding as partial", () => {
    const two = entry({
      probes: [
        { label: "a", pattern: /console\.error/, file: "lib/thing.ts" },
        { label: "b", pattern: /alerting/, file: "lib/thing.ts" },
      ],
    });
    const [result] = assessDetection({ "lib/thing.ts": "console.error('x')" }, [two]);
    expect(result.coverage).toBe("partial");
    expect(result.missingProbes).toEqual(["b"]);
  });

  it("rates an entry as unknown when a probe's file could not be read", () => {
    expect(assessDetection({ "lib/thing.ts": null }, [entry()])[0].coverage).toBe("unknown");
  });

  it("rates an entry as unknown when a probe's file is absent entirely", () => {
    expect(assessDetection({}, [entry()])[0].coverage).toBe("unknown");
  });

  it("rates a recorded blind spot as BLIND regardless of sources", () => {
    const blind = entry({ probes: [], blindReason: "nothing watches this" });
    expect(assessDetection({ "lib/thing.ts": "console.error('x')" }, [blind])[0].coverage).toBe(
      "BLIND"
    );
  });

  it("preserves matrix order so the table reads the same every run", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
      entry({ id: "B" }),
      entry({ id: "A" }),
    ]);
    expect(results.map((r) => r.entry.id)).toEqual(["B", "A"]);
  });
});

describe("DETECTION_MATRIX", () => {
  it("has one row per P0 in the charter's escalation list", () => {
    expect(DETECTION_MATRIX).toHaveLength(6);
  });

  it("gives every row a unique id", () => {
    const ids = DETECTION_MATRIX.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every row an escalation and a signal", () => {
    for (const row of DETECTION_MATRIX) {
      expect(row.escalation.trim(), row.id).not.toBe("");
      expect(row.wouldShow.trim(), row.id).not.toBe("");
    }
  });

  it("gives a probe-less row an explicit blindReason", () => {
    // A row with neither probes nor a recorded reason is an unanswered
    // question wearing the costume of an answer.
    for (const row of DETECTION_MATRIX) {
      if (row.probes.length === 0) expect(row.blindReason?.trim(), row.id).toBeTruthy();
    }
  });

  it("names a file for every probe", () => {
    for (const row of DETECTION_MATRIX) {
      for (const probe of row.probes) expect(probe.file.trim(), `${row.id}/${probe.label}`).not.toBe("");
    }
  });
});

describe("renderDetectionTable", () => {
  const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
    entry({ id: "T1" }),
    entry({ id: "T2", probes: [], blindReason: "nothing watches this" }),
  ]);

  it("has a header naming the columns", () => {
    const [header] = renderDetectionTable(results).split("\n");
    expect(header).toContain("ESCALATION");
    expect(header).toContain("WOULD SHOW");
    expect(header).toContain("COVERAGE");
  });

  it("marks a blind row distinctly", () => {
    expect(renderDetectionTable(results)).toContain("BLIND");
  });

  it("renders a rule as wide as a body row", () => {
    const [, rule, body] = renderDetectionTable(results).split("\n");
    expect(rule.length).toBe(body.length);
  });
});

describe("detectionSummaryLine", () => {
  it("reports full coverage when every escalation has a signal", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [entry()]);
    expect(detectionSummaryLine(results)).toBe("DETECTION     1/1 escalations covered · 0 blind");
  });

  it("counts blind and partial rows", () => {
    const results = assessDetection({ "lib/thing.ts": "console.error('x')" }, [
      entry({ id: "A" }),
      entry({ id: "B", probes: [], blindReason: "nothing watches this" }),
      entry({
        id: "C",
        probes: [
          { label: "a", pattern: /console\.error/, file: "lib/thing.ts" },
          { label: "b", pattern: /alerting/, file: "lib/thing.ts" },
        ],
      }),
    ]);
    const line = detectionSummaryLine(results);
    expect(line).toContain("1 blind");
    expect(line).toContain("1 partial");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/reports/detectionCoverage.test.ts`
Expected: FAIL — cannot resolve `./detectionCoverage`.

- [ ] **Step 3: Write the implementation**

Create `lib/reports/detectionCoverage.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/reports/detectionCoverage.test.ts`
Expected: PASS — 17 tests.

There is no standing assertion against the live repository here, and the reason is worth stating: **this module is expected to report a blind row on every single run.** `E6` is permanently `BLIND` by construction. An assertion that no row is blind would fail from the first commit and would then be weakened or deleted, which is how a real recorded gap turns into a deleted test. The matrix's *shape* is asserted; its verdict is a report, not a build gate.

The probes in `E1` and `E2` point at test files this plan creates in Tasks 3 and 6. Run those tasks first, or both rows read `unknown` — which is the correct output, not a bug.

- [ ] **Step 5: Commit**

```bash
git add lib/reports/detectionCoverage.ts lib/reports/detectionCoverage.test.ts
git commit -m "feat(reports): assess whether each P0 escalation would be noticed"
```

---

### Task 10: The Security collector

**Files:**
- Create: `scripts/reports/security.ts`

**Interfaces:**
- Consumes: every module built in Tasks 1–9; `diffMetrics`, `renderMetricsTable` from `lib/reports/metrics.ts`; `archiveExistingRun` from `lib/reports/runArchive.ts`; `readPreviousRun` from `lib/reports/previousRun.ts` (**Finance plan, Task 1** — hard dependency).
- Produces: `docs/reports/security/.data/<YYYY-MM-DD>.json`.

This is the only file in the department that touches the disk, the network, or a subprocess. Everything in `lib/reports/` stayed pure precisely so that all of the untestable parts could be concentrated in one place and kept thin: the collector walks directories, shells out three times, hands the strings to tested functions, and writes what comes back.

**It takes no credentials and constructs no client.** There is no `.env.reports.local` read, no `createClient`, no Supabase import anywhere in the file — Growth and Finance both need production credentials and Security deliberately does not. That is the reason this department is the cheap one to build and the safe one to re-run. If a future change appears to need database access, that is a decision to make deliberately and write down, not to add quietly to an import list.

Three subprocesses, all through the same `capture` helper that returns `null` rather than throwing:

| Command | Feeds | On failure |
|---|---|---|
| `npm audit --json` | `summarizeAudit` | `null` → counts render `not read`. **Never zero.** |
| `npm query` for install scripts | `classifyInstallScripts` | `null` → `readable: false` |
| `git check-ignore -q` | the `.env` ignore verdict | non-zero exit → the path is **not** ignored, which is a finding |

`npm audit` exits non-zero whenever it finds anything, exactly as `npm outdated` does, so `capture` must return stdout from the error path too — the identical trap `scripts/reports/ops.ts` already documents.

The `.env` ignore check runs against **pattern-level paths as well as real files**, because a fresh clone has no `.env.local` on disk and "no files found" must never render as "all files ignored". `git check-ignore` answers for a path that does not exist, which is what makes the vacuous case avoidable.

The collector owns the diff, as every collector in this system does. It reads the previous run through `readPreviousRun`, diffs the metrics, renders the finished table, and puts it in the payload. **WARDEN pastes that table and never computes a delta.** It reads the previous file a second time using the key `readPreviousRun` returns, purely to recover last run's direct-dependency list for `newDirectDependencies` — reusing the previous run's *identity* rather than re-implementing the choice of which file that is.

- [ ] **Step 1: Confirm the Finance dependency has landed**

Run: `ls lib/reports/previousRun.ts`

Expected: the path prints. If it does not, **stop and land Finance plan Task 1 first.** It is self-contained — it extracts the previous-run reader out of `scripts/reports/ops.ts` and gives it tests — and it touches nothing else in this plan. Do not copy `readPreviousRun` into this collector: a second untested implementation of "what is this delta measured against" is precisely the failure the collector/interpreter split exists to prevent.

- [ ] **Step 2: Write the collector**

Create `scripts/reports/security.ts`:

```typescript
/**
 * Security collector.
 *
 * Deterministic and credential-free. Reads repository source, parses the
 * migrations, shells out to npm and git, hands every judgement to a tested
 * pure function in lib/reports/, and writes JSON for WARDEN to interpret. No
 * model is involved, so this costs nothing and can be re-run freely while
 * debugging.
 *
 * There is no Supabase client here, and there must not be one. Growth and
 * Finance need production credentials; Security answers every one of its
 * questions from the repository as it stands. Adding database access would
 * give this process a capability it has no reason to hold, on top of being a
 * decision worth making in the open rather than in an import list.
 *
 * tsx transpiles to CommonJS: __dirname works, top-level await does not.
 * Everything below is synchronous and main() is called at the bottom.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { diffMetrics, renderMetricsTable, type Metric } from "../../lib/reports/metrics";
import { archiveExistingRun } from "../../lib/reports/runArchive";
import { readPreviousRun } from "../../lib/reports/previousRun";

import { buildSchema, type MigrationFile } from "../../lib/reports/migrationSchema";
import { assessRls, renderRlsTable, rlsSummaryLine, TABLE_DATA_CLASS } from "../../lib/reports/rlsPosture";
import {
  erasureResidue,
  extractDeletionTargets,
  inventoryIdentityTables,
  privacySummaryLine,
  renderPrivacyTable,
  RETENTION_REGISTER,
} from "../../lib/reports/privacyPosture";
import {
  classifyRoute,
  cookieScopeConflicts,
  crossReferenceRoutes,
  middlewareCoverage,
  renderRouteGuardTable,
  routeSummaryLine,
  ROUTE_EXPECTATIONS,
} from "../../lib/reports/routeGuards";
import {
  assessSecrets,
  clientReachable,
  ENV_CLASS,
  parseEnvExample,
  renderSecretsTable,
  scanEnvUsage,
  secretsSummaryLine,
} from "../../lib/reports/secretsPosture";
import {
  classifyInstallScripts,
  lockfileIntegrity,
  newDirectDependencies,
  renderSupplyChainTable,
  summarizeAudit,
  supplyChainSummaryLine,
} from "../../lib/reports/supplyChain";
import {
  assessExecutors,
  baselineSummaryLine,
  CONTROLS,
  evaluateControls,
  renderControlTable,
  renderExecutorTable,
} from "../../lib/reports/securityBaseline";
import {
  assessDetection,
  detectionSummaryLine,
  DETECTION_MATRIX,
  renderDetectionTable,
} from "../../lib/reports/detectionCoverage";

const REPO_ROOT = join(__dirname, "..", "..");
const SOURCE_ROOTS = ["app", "lib", "components", "scripts", "middleware.ts", "next.config.ts"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs"];

/**
 * Paths checked for ignore status. Real files on disk are checked too, but
 * these pattern-level paths are checked whether or not they exist: a fresh
 * clone carries no .env.local, and "found no files" must never render as
 * "every file is ignored".
 */
const ENV_PATHS = [".env", ".env.local", ".env.production", ".env.reports.local"];

/** Captures stdout, returning null on failure rather than throwing. */
function capture(file: string, args: string[]): string | null {
  try {
    return execFileSync(file, args, { cwd: REPO_ROOT, stdio: "pipe", maxBuffer: 32 * 1024 * 1024 })
      .toString();
  } catch (error) {
    // npm audit exits non-zero whenever it finds anything, exactly as npm
    // outdated does — its stdout is still the answer. Genuine failures give
    // no usable stdout, and summarizeAudit turns that into null counts rather
    // than a zero. A zero here would read as an all-clear.
    const stdout = (error as { stdout?: Buffer }).stdout;
    const text = stdout ? stdout.toString() : "";
    return text.trim() ? text : null;
  }
}

/** True when git ignores `path`, whether or not it exists on disk. */
function isIgnored(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", "--no-index", path], {
      cwd: REPO_ROOT,
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function walk(path: string, out: string[] = []): string[] {
  const stats = statSync(path, { throwIfNoEntry: false });
  if (!stats) return out;
  if (stats.isFile()) {
    if (SOURCE_EXTENSIONS.some((ext) => path.endsWith(ext))) out.push(path);
    return out;
  }
  for (const entry of readdirSync(path)) walk(join(path, entry), out);
  return out;
}

/** Repo-relative module path → source, for every file the checks read. */
function readSourceTree(): Record<string, string> {
  const sources: Record<string, string> = {};
  for (const root of SOURCE_ROOTS) {
    for (const file of walk(join(REPO_ROOT, root))) {
      sources[relative(REPO_ROOT, file).split(sep).join("/")] = readFileSync(file, "utf8");
    }
  }
  return sources;
}

function readMigrations(): MigrationFile[] {
  const dir = join(REPO_ROOT, "supabase", "migrations");
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));
  } catch {
    return [];
  }
}

/** Every app/api/**\/route.ts as a URL path plus its source. */
function readRoutes(): { path: string; source: string }[] {
  const apiDir = join(REPO_ROOT, "app", "api");
  const files: string[] = [];
  const collect = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) collect(full);
      else if (entry === "route.ts") files.push(full);
    }
  };
  try {
    collect(apiDir);
  } catch {
    return [];
  }
  return files
    .map((file) => ({
      path: `/api/${relative(apiDir, file).split(sep).slice(0, -1).join("/")}`,
      source: readFileSync(file, "utf8"),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** The middleware matcher, or null when it cannot be located. */
function readMiddlewareMatcher(sources: Record<string, string>): string | null {
  const source = sources["middleware.ts"];
  if (!source) return null;
  const match = /matcher:\s*\[\s*["']([^"']+)["']/.exec(source);
  return match ? match[1] : null;
}

/** Direct dependency names from package.json, both trees, sorted. */
function directDependencies(): string[] {
  try {
    const manifest = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
    ].sort();
  } catch {
    return [];
  }
}

/** Last run's direct-dependency list, via the key readPreviousRun chose. */
function previousDependencies(outDir: string, key: string | null): string[] | null {
  if (!key) return null;
  try {
    const parsed = JSON.parse(readFileSync(join(outDir, `${key}.json`), "utf8")) as {
      raw?: { directDependencies?: unknown };
    };
    const list = parsed.raw?.directDependencies;
    return Array.isArray(list) ? (list as string[]) : null;
  } catch {
    return null;
  }
}

/** A boolean rendered for a metric row. Null stays null — "not read". */
const yesNo = (value: boolean | null): string | null =>
  value === null ? null : value ? "yes" : "NO";

function main(): void {
  const started = Date.now();

  const sources = readSourceTree();
  const migrations = readMigrations();
  const schema = buildSchema(migrations);

  // ── Database and RLS posture (Tasks 1–3) ────────────────────────────────
  const rls = assessRls(schema, TABLE_DATA_CLASS);

  // ── Privacy (Task 4) ────────────────────────────────────────────────────
  const deleteAccountSource = sources["lib/deleteAccount.ts"] ?? "";
  const identityTables = inventoryIdentityTables(schema);
  const knownTables = new Set(schema.map((table) => table.name));
  const deletionTargets = extractDeletionTargets(deleteAccountSource).filter((name) =>
    knownTables.has(name)
  );
  const residue = erasureResidue(identityTables, deletionTargets, RETENTION_REGISTER);

  // ── Route guards and rate limiting (Task 5) ─────────────────────────────
  const routes = readRoutes().map((route) => classifyRoute(route.path, route.source));
  const routeAssessments = crossReferenceRoutes(routes, ROUTE_EXPECTATIONS);
  const matcher = readMiddlewareMatcher(sources);
  const coverage = matcher ? middlewareCoverage(matcher, routes.map((route) => route.path)) : [];
  // The admin session cookie's own path against the paths middleware enforces.
  const adminCookiePath =
    /path:\s*["']([^"']+)["']/.exec(sources["lib/auth/adminSession.ts"] ?? "")?.[1] ?? "/";
  const cookieConflicts = cookieScopeConflicts(adminCookiePath, ["/admin", "/api/admin"]);

  // ── Secrets (Task 6) ────────────────────────────────────────────────────
  const envExample = sources[".env.example"] ?? readFileSync(join(REPO_ROOT, ".env.example"), "utf8");
  const envUsage = Object.fromEntries(
    Object.entries(sources).map(([file, source]) => [file, scanEnvUsage(source)])
  );
  const realEnvFiles = readdirSync(REPO_ROOT).filter((name) => name.startsWith(".env"));
  const envFilesIgnored = [...ENV_PATHS, ...realEnvFiles]
    .filter((name) => name !== ".env.example")
    .every(isIgnored);
  const secrets = assessSecrets({
    declared: parseEnvExample(envExample),
    usage: envUsage,
    clientFiles: clientReachable(sources),
    envFilesIgnored,
    registry: ENV_CLASS,
  });

  // ── Supply chain (Task 7) ───────────────────────────────────────────────
  const audit = summarizeAudit(capture("npm", ["audit", "--json"]));
  const installScripts = classifyInstallScripts(
    capture("npm", [
      "query",
      ":attr(scripts, [postinstall]), :attr(scripts, [preinstall]), :attr(scripts, [install])",
      "--json",
    ])
  );
  const lockfile = lockfileIntegrity(
    existsSync(join(REPO_ROOT, "package-lock.json"))
      ? readFileSync(join(REPO_ROOT, "package-lock.json"), "utf8")
      : null
  );
  const deps = directDependencies();

  // ── Controls and executors (Task 8) ─────────────────────────────────────
  // Controls read migrations and .env.example as well as source, so the map
  // handed to evaluateControls is wider than the source tree.
  const controlSources: Record<string, string | null> = { ...sources, ".env.example": envExample };
  for (const migration of migrations) {
    controlSources[`supabase/migrations/${migration.name}`] = migration.sql;
  }
  const controlResults = evaluateControls(controlSources, CONTROLS);
  const executorResults = assessExecutors(controlResults);

  // ── Detection coverage (Task 9) ─────────────────────────────────────────
  const detectionSources: Record<string, string | null> = { ...controlSources };
  for (const probeFile of DETECTION_MATRIX.flatMap((entry) => entry.probes.map((p) => p.file))) {
    if (probeFile in detectionSources) continue;
    try {
      detectionSources[probeFile] = readFileSync(join(REPO_ROOT, probeFile), "utf8");
    } catch {
      detectionSources[probeFile] = null;
    }
  }
  const detection = assessDetection(detectionSources, DETECTION_MATRIX);

  // ── Metrics ─────────────────────────────────────────────────────────────
  // Every label is 30 characters or fewer: renderMetricsTable pads the label
  // column to exactly 30, and a longer label pushes that row's value columns
  // out of alignment while every other row stays straight — the kind of
  // cosmetic drift nobody bothers to report.
  const metrics: Metric[] = [
    { label: "RLS tables", value: rls.length },
    { label: "RLS gaps", value: rls.filter((row) => row.verdict === "gap").length },
    { label: "RLS review items", value: rls.filter((row) => row.verdict === "review").length },
    {
      label: "Tables unregistered",
      value: rls.filter((row) => row.dataClass === "UNREGISTERED").length,
    },

    { label: "API routes", value: routeAssessments.length },
    {
      label: "Routes missing a guard",
      value: routeAssessments.filter((row) => row.missing.length > 0).length,
    },
    { label: "Routes unclassified", value: routeAssessments.filter((row) => row.unclassified).length },
    {
      label: "Routes with shared limiter",
      value: routes.filter((route) => route.rateLimitScope === "shared").length,
    },
    {
      label: "Routes with local limiter",
      value: routes.filter((route) => route.rateLimitScope === "per-instance").length,
    },
    { label: "Middleware-covered routes", value: coverage.filter((row) => row.covered).length },
    { label: "Cookie scope conflicts", value: cookieConflicts.length },

    { label: "Identity tables", value: identityTables.length },
    { label: "Erasure residue tables", value: residue.length },

    { label: "Env vars in use", value: secrets.rows.length },
    {
      label: "Secrets client-reachable",
      value: secrets.issues.filter((issue) => issue.kind === "client-reachable").length,
    },
    {
      label: "Env vars unclassified",
      value: secrets.issues.filter((issue) => issue.kind === "unclassified").length,
    },
    {
      label: "Env vars undocumented",
      value: secrets.issues.filter((issue) => issue.kind === "undocumented").length,
    },
    { label: "Env files ignored", value: yesNo(envFilesIgnored) },

    // Null, not zero, whenever the audit did not produce a usable report.
    { label: "Advisories total", value: audit.counts?.total ?? null },
    {
      label: "Advisories high/critical",
      value: audit.counts ? audit.counts.high + audit.counts.critical : null,
    },
    { label: "Direct deps with advisory", value: audit.readable ? audit.directAdvisories.length : null },
    { label: "Direct dependencies", value: deps.length },
    {
      label: "Install-script packages",
      value: installScripts.readable
        ? installScripts.approved.length + installScripts.unapproved.length
        : null,
    },
    {
      label: "Unapproved install scripts",
      value: installScripts.readable ? installScripts.unapproved.length : null,
    },
    {
      label: "Lockfile entries unhashed",
      value: lockfile.readable ? (lockfile.installable as number) - (lockfile.hashed as number) : null,
    },

    { label: "Controls holding", value: controlResults.filter((r) => r.state === "present").length },
    { label: "Controls missing", value: controlResults.filter((r) => r.state === "MISSING").length },
    { label: "Controls unknown", value: controlResults.filter((r) => r.state === "unknown").length },
    {
      label: "Executor bounds holding",
      value: executorResults.reduce((sum, row) => sum + row.holding, 0),
    },

    { label: "Escalations covered", value: detection.filter((r) => r.coverage === "covered").length },
    { label: "Escalations blind", value: detection.filter((r) => r.coverage === "BLIND").length },
  ];

  const collectMs = Date.now() - started;

  // Manila calendar date, not UTC. WARDEN reads this filename back with
  // `TZ=Asia/Manila date +%F`; between midnight and 8am Manila the two
  // calendars disagree and UTC would name a file the agent never looks for.
  // Do not "simplify" this to toISOString().slice(0, 10).
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const outDir = join(REPO_ROOT, "docs", "reports", "security", ".data");
  mkdirSync(outDir, { recursive: true });

  const outFilename = `${date}.json`;
  // Displace an earlier run today rather than overwriting it: a report already
  // published from those numbers must stay checkable against them.
  const superseded = archiveExistingRun(outDir, outFilename);

  const previous = readPreviousRun(outDir, outFilename);
  const rows = diffMetrics(metrics, previous?.metrics ?? null);
  const table = renderMetricsTable(rows, "POSTURE", { now: "TODAY", previous: "LAST RUN" });

  const payload = {
    collectedAt: new Date().toISOString(),
    collectMs,
    previousKey: previous?.key ?? null,
    supersededTo: superseded,
    metrics,
    table,
    summaries: [
      rlsSummaryLine(rls),
      routeSummaryLine(routeAssessments),
      privacySummaryLine(identityTables, residue),
      secretsSummaryLine(secrets),
      supplyChainSummaryLine(audit, installScripts),
      baselineSummaryLine(controlResults),
      detectionSummaryLine(detection),
    ],
    tables: {
      rls: renderRlsTable(rls),
      routes: renderRouteGuardTable(routeAssessments),
      privacy: renderPrivacyTable(identityTables, deletionTargets, RETENTION_REGISTER),
      secrets: renderSecretsTable(secrets),
      supplyChain: renderSupplyChainTable(audit, installScripts, lockfile),
      controls: renderControlTable(controlResults),
      executors: renderExecutorTable(executorResults),
      detection: renderDetectionTable(detection),
    },
    raw: {
      rls,
      privacy: { identityTables, deletionTargets, residue },
      routes: routeAssessments,
      middleware: { matcher, coverage, adminCookiePath, cookieConflicts },
      secrets: { rows: secrets.rows, issues: secrets.issues, gapCount: secrets.gapCount },
      supplyChain: {
        audit,
        installScripts,
        lockfile,
        newDirectDependencies: newDirectDependencies(
          deps,
          previousDependencies(outDir, previous?.key ?? null)
        ),
      },
      // Kept so the next run can diff against it — see previousDependencies.
      directDependencies: deps,
      controls: controlResults.map((result) => ({
        id: result.control.id,
        group: result.control.group,
        title: result.control.title,
        file: result.control.file,
        state: result.state,
        missingSignals: result.missingSignals,
        absentMeans: result.control.absentMeans,
        baselineTask: result.control.baselineTask ?? null,
      })),
      executors: executorResults,
      detection: detection.map((result) => ({
        id: result.entry.id,
        escalation: result.entry.escalation,
        wouldShow: result.entry.wouldShow,
        coverage: result.coverage,
        missingProbes: result.missingProbes,
        blindReason: result.entry.blindReason ?? null,
        ownedBy: result.entry.ownedBy ?? null,
      })),
      migrations: { count: migrations.length, latest: migrations.at(-1)?.name ?? null },
    },
  };

  const outPath = join(outDir, outFilename);
  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  if (superseded) console.log(`superseded -> ${superseded}`);
  console.log(outPath);
}

main();
```

- [ ] **Step 3: Run the collector**

Run: `npx tsx scripts/reports/security.ts`

Expected: prints a path ending `docs/reports/security/.data/<today>.json`. It should finish in a few seconds — `npm audit` is the only network call and there is no test run, no build, and no HTTP check.

If `npm audit` cannot reach the network, the run still succeeds and the advisory rows read `not read`. **That is correct behaviour, not a failure to fix.** If they read `0` instead, something has been changed to default a null, and that is a bug worth stopping for.

`npm run report:security` will be the normal entry point once the central integration pass adds the script to `package.json`. **This plan does not touch `package.json`** — see *File Structure*.

- [ ] **Step 4: Verify the output shape**

Run:

```sh
node -e "const d=require('./docs/reports/security/.data/'+new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'})+'.json');
console.log(d.metrics.length,'metrics');
console.log('labels over 30 chars:', d.metrics.filter(m=>m.label.length>30).map(m=>m.label));
console.log('tables:', Object.keys(d.tables).join(' '));
console.log('summaries:', d.summaries.length);
console.log('previousKey:', d.previousKey);"
```

Expected: 31 metrics, an **empty** over-30 list, eight tables, seven summaries, and `previousKey: null` on the first run.

- [ ] **Step 5: Verify the report data is gitignored**

Run: `git status --porcelain docs/reports/`

Expected: no output. If anything appears, **stop** — a security report or its data file becoming trackable in a public repository is the failure this whole department is arranged to prevent, and it must be fixed before the next commit rather than after.

- [ ] **Step 6: Verify no credential path crept in**

Run: `grep -nE "reportsEnv|supabaseAdmin|createClient|SERVICE_ROLE|env\.reports" scripts/reports/security.ts`

Expected: no output. The collector's credential-free property is easy to lose to a well-meaning edit and cheap to re-check.

- [ ] **Step 7: Commit**

```bash
git add scripts/reports/security.ts
git commit -m "feat(reports): add the security collector"
```

---

### Task 11: WARDEN agent definition

**Files:**
- Create: `.claude/agents/warden.md`

**Interfaces:**
- Consumes: the collector JSON from Task 10, `docs/reports/security/<previous>.md`, and two Vercel MCP tools.
- Produces: `docs/reports/security/<YYYY-MM-DD>.md` and one appended line in `docs/reports/cost-ledger.jsonl`.

WARDEN's persona guards against **crying wolf**, and that is not a stylistic note — it is the deliverable. A security report that rates everything urgent trains its only reader to stop opening it, at which point the department has negative value: it costs tokens and provides false assurance. Every other department can survive a bad week of over-reporting. This one cannot, because the reader's trust is the entire delivery mechanism.

So the agent definition below spends most of its length on **severity discipline** rather than on procedure. The collector already produces every number, every table and every verdict; WARDEN's whole job is deciding what a verdict *means* this week, and defending the rating in one sentence. The rubric is explicit for one specific reason: the collector's vocabulary — `gap`, `review`, `MISSING`, `BLIND` — is deliberately **not** severity vocabulary, and the single easiest mistake available here is to translate `gap` to P0 by reflex. A `gap` on a table nobody can reach through any route is not a P0. A `present` control on a route with no traffic is not a P3 worth writing up. The mapping needs a human-shaped judgement every time, and the rubric names the questions that judgement has to answer.

Two tools are granted beyond the file tools, and no more: `get_runtime_errors` and `get_runtime_logs`. The spec lists Vercel runtime errors among Security's data sources, and detection escalation E6 turns entirely on whether anything is visibly being attacked right now. Deployment state, cache, and capacity belong to Operations and WARDEN has no tool that can see them, which is intentional — two departments reporting the same number from different tools is how a log stops agreeing with itself.

- [ ] **Step 1: Create the agent**

Create `.claude/agents/warden.md`:

```markdown
---
name: warden
description: Security department agent. Use when running the weekly security report — RLS posture, route guards, secrets, supply chain, identity and session, code execution, payment integrity, business-logic abuse, privacy, and detection coverage.
tools: Bash, Read, Write, Edit, Glob, Grep, mcp__plugin_vercel_vercel__get_runtime_errors, mcp__plugin_vercel_vercel__get_runtime_logs
---

# WARDEN · Security

You are WARDEN, the Security department. You assume compromise is possible and look
for it deliberately. You never use alarming language for an unalarming thing. When you
rate something, you say in one sentence why it is that severity and not the one above
or below.

**What you guard against: crying wolf.** A report that rates everything urgent teaches
its only reader to stop opening it, and a security report nobody opens is worse than no
report — it costs money and provides false assurance. Severity discipline is your
deliverable. The findings are just what it is applied to.

## Core principle

**A scan is a diff, not a snapshot.** The value is what changed since last week. Your
cadence is weekly, so a finding that was P2 seven days ago and is still P2 is worth one
line, not a page.

**Every number in your report comes from the collector.** You never count, never
subtract, never compute a percentage, and never retype a figure out of a table. If a
number looks wrong, that is a finding — write it up like any other defect — not
something to quietly correct on the way to the report.

## Step 1 — Read the previous report FIRST

Before any tool call:

```sh
find docs/reports/security -maxdepth 2 -name '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].md' \
  | awk -F/ '{print $NF"\t"$0}' | sort | tail -1 | cut -f2
```

Read whatever it prints. You need its findings so each one can be marked NEW, ONGOING
or CLOSED, and you need its ACCEPTED list so nothing already accepted comes back as new.
If it prints nothing, there is no earlier report — say so, this is a baseline scan.

**Record the path it printed.** Step 5 names it in the report. A diff nobody can trace
to its baseline is not auditable.

The command is the one PULSE uses and the same three things are load-bearing. Do not
simplify it: it searches two levels deep, the date-shaped pattern keeps `README.md` out
of the running, and sorting is on the basename so a report in a subdirectory cannot
outrank a newer one at the top level. Today's own report is **not** excluded — you read
before you write, so an existing `<today>.md` is an earlier run's report and is the
closest prior there is. Reports displaced by a re-run live under `superseded/` with a
`.<n>` suffix the pattern will not match, so they never return as a baseline.

Also read the department's standing notes, which are not a report and will not appear
above:

```sh
cat docs/reports/security/README.md 2>/dev/null
```

It carries open items recorded outside a run — a standing assertion someone left failing,
a control lapse noticed mid-week — and anything in it must be reflected in this report or
explicitly closed.

## Step 2 — Read the collector output

```sh
cat "docs/reports/security/.data/$(TZ=Asia/Manila date +%F).json"
```

If it is missing, run the collector first — `npm run report:security`, or
`npx tsx scripts/reports/security.ts` until the script is registered. It costs nothing,
takes no credentials, and re-running it is safe: it moves the day's earlier run into
`.data/superseded/` rather than overwriting it.

**Always pass `TZ=Asia/Manila`.** The collector names its file with the Manila calendar
date. A bare `date +%F` agrees only as long as the machine happens to be set to PH time.

What the JSON gives you:

| Field | What it is |
|---|---|
| `table` | The finished POSTURE table with deltas. **Paste it verbatim.** |
| `summaries` | Seven one-line summaries, in report order. Paste them verbatim. |
| `tables.*` | Eight rendered detail tables — rls, routes, privacy, secrets, supplyChain, controls, executors, detection. |
| `raw.*` | The structured findings behind every table, including `absentMeans` for each control and `blindReason` for each blind detection row. |
| `previousKey` | Which data file the deltas are measured against. `null` on a baseline run. |
| `collectedAt` | Timestamp of this collector run. Goes in the SOURCE footer. |

**A value of `not read` is not a zero and must never be reported as one.** The advisory
rows come from `npm audit`, which needs the network. When they read `not read`, say the
audit did not run — never "no known vulnerabilities".

## Step 3 — What the collector cannot decide

The collector answers everything a regex can answer. Three things it cannot, which are
your actual work.

**1. Whether a `gap` matters.** `raw.rls`, `raw.routes` and `raw.controls` carry
verdicts, not severities. See Step 4.

**2. Business-logic abuse.** `raw.controls` confirms the seat cap trigger exists, the
price is recomputed server-side, and coupons are single-redemption. It cannot tell you
whether the *combination* of class join requests, seat caps, and block pricing leaves a
path to paid content without paying. That needs someone reasoning about the product,
which is you. Each week, pick **one** flow and walk it end to end — checkout, join
request, coupon redemption, class rep transfer — and say which one you walked. Rotating
one flow per week beats a shallow pass over all four.

**3. Whether anything is being attacked right now.** Detection escalation E6 is
permanently blind: there is no alerting. The closest available signal is:

| Call | Gets |
|---|---|
| `get_runtime_errors` (`since: 7d`) | New error clusters — an exploit that breaks something |
| `get_runtime_logs` (`since: 7d`, `group_by: statusCode`) | 401/403/429 volume |

**`group_by` ignores the `since` window on this hosting tier** — `1h` and `7d` return
identical counts with no warning. Whatever it returns is roughly the last hour. Never
present it as a weekly figure and never compare it to a weekly baseline. It is a
point-in-time reading and saying so costs one clause.

Deployment state, caching, capacity and build health are **Operations'**. You have no
tool that sees them and you must not report on them.

## Step 4 — Severity discipline

This is the job. Work through it before writing anything.

**The collector's words are not severities.** `gap`, `review`, `MISSING`, `BLIND` and
`unclassified` describe what the check found. They say nothing about urgency. Translating
`gap` straight to P0 is the single most damaging habit available to this department.

Start from the rubric, then argue yourself up or down:

| Collector output | Starting point | Move it up if | Move it down if |
|---|---|---|---|
| RLS `gap` on USER_DATA | P1 | The table holds identity or payment data, or an anon policy makes it writable | Nothing reads the table yet, or it is unreachable through any route |
| RLS `review` | P3 | Combined with a route gap on the same data | The class is a deliberate design choice already argued once |
| Route missing `auth` | P1 | The route returns paid content or mutates entitlement | Middleware covers it, and `raw.middleware.coverage` says so |
| Route missing `rateLimit` | P2 | The route costs money per call or reaches a third party | The route is read-only and cheap |
| Route `unclassified` | P2 | It is a new route with no guards at all | It is a rename of a route that already had an expectation |
| Secret `client-reachable` | **P0** | — | **Never.** Rotate the value first, fix the code second |
| Env var `unclassified` | P3 | It looks like a credential | It is a platform flag |
| Advisory high/critical | P2 | The package is a direct production dependency and reachable at runtime | It is dev-tree only and never ships |
| `Unapproved install scripts` | P2 | The package is new this week | It is a transitive build tool with a plausible reason |
| Control `MISSING` | P1 | Its `absentMeans` describes lost authentication, lost payment verification, or lost isolation | The control moved files and the registry is stale — that is registry maintenance, not a finding |
| Control `unknown` | P3 | It has been unknown for two runs | It is the first run after a rename |
| Erasure residue | P2 | The residue table holds direct identifiers | The table is in the retention register — then it is not residue at all |
| Detection `BLIND` with `blindReason` | ACCEPTED | Something happened that it failed to catch | — |

**Rules that override the rubric:**

- **The escalation list below is the only thing that justifies interrupting.** Everything
  else is planned work, and saying so plainly is the job.
- **A finding whose exploitation requires access you already assume is compromised is not
  a finding.** "An attacker with the service-role key could read the table" is a
  restatement of what that key is for.
- **A finding you cannot describe an attacker doing is a P3 at most,** and probably a
  note. If you cannot finish the sentence "someone could, in practice, …", you are
  rating a theory.
- **Never invent urgency from a delta alone.** A count moving from 3 to 4 is a fact.
  Whether it matters depends on which one moved, and `raw` tells you.
- **An ACCEPTED finding never reappears as NEW.** It reopens only when its trigger fires,
  and you state which trigger fired.
- **The council may re-rank you, and that is expected.** Security's severities are
  re-ranked in council more than any other department's, because business context lives
  elsewhere: LEDGER knows what gates revenue, VANTAGE knows what users actually touch.
  Rate on the security facts you have, state the assumption your rating rests on in the
  "Why <sev>" line, and let the council correct it. Do not pre-emptively inflate a
  severity to survive a re-rank, and do not deflate one to look calm.

## Step 5 — Write the report

Write `docs/reports/security/<YYYY-MM-DD>.md`, where the date is the **Manila** calendar
date (`TZ=Asia/Manila date +%F`) so the report and the collector's data file carry the
same date.

**If that file already exists, move it aside before you write** — it is an earlier report
from today and the only record of the findings it opened:

```sh
d=$(TZ=Asia/Manila date +%F); f=docs/reports/security/$d.md
if [ -e "$f" ]; then
  mkdir -p docs/reports/security/superseded
  n=1; while [ -e "docs/reports/security/superseded/$d.$n.md" ]; do n=$((n+1)); done
  mv "$f" "docs/reports/security/superseded/$d.$n.md"
  echo "superseded -> docs/reports/security/superseded/$d.$n.md"
fi
```

Never overwrite a published report. The `.<n>` suffix keeps the archived copy out of
Step 1's date-shaped pattern so it can never come back as a baseline.

Use exactly this layout:

```
WARDEN · SECURITY                                 <YYYY-MM-DD> · weekly
═══════════════════════════════════════════════════════════════════
VERDICT   One line. Is anything exposed, and the single thing that moved.

<the collector JSON's `table` field, pasted verbatim>

POSTURE
<the seven `summaries` lines, pasted verbatim>

FINDINGS · vs <the Step 1 path, or "baseline · no earlier report">
 [P1] NEW      <title>
 [P2] ONGOING  <title>                                   (week <n>)
 [ok] CLOSED   <title>

ACCEPTED (<n>)  not re-litigated · reopens on trigger
 · <finding>                          → reopens if <trigger>

───────────────────────────────────────────────────────────────────
DETAIL · <severity> · <title>

  What      <the weakness, in terms of capability>
  Evidence  <file:line, a control id, or a metric with its delta>
  Impact    <who or what is affected>
  Why <sev> <what makes this the current severity, not higher or lower>

  A  <accept>          <cost of inaction>
  B  <minimal>         <effort>
  C  <full fix>        <effort, trade>

  → <choice, with the reasoning in a sentence>

───────────────────────────────────────────────────────────────────
FLOW WALKED  <the one business-logic flow you traced this week, and the result>

───────────────────────────────────────────────────────────────────
SOURCE       collector run <the collector JSON's `collectedAt`>
             baseline <BASELINE_PLAN path> · <n> controls checked
RUN          collect <n>s · interpret not read · turns not read
COST         <$n or "not read">
CUMULATIVE   <paste the output of `npm run report:cost` verbatim>
```

`SOURCE` carries `collectedAt` copied verbatim. The data file's name holds only the
Manila date, so it cannot identify *which* run produced these numbers — `collectedAt`
can, and it is what separates "this report is wrong" from "this report was superseded".

`collect <n>s` is `collectMs` **divided by 1000 and rounded**. It is milliseconds. Writing
it literally turns a real reading into a figure implying hours.

Interpret time and turn count are things you cannot measure about yourself from inside a
session, so they are always **`not read`**. COST follows the same rule. Never estimate
either.

`CUMULATIVE` comes from `npm run report:cost` and is pasted verbatim. Never hand-sum the
cost ledger.

Rules:

- **Detail for the top finding only, plus every P0 and P1.** P2 and below stay one-liners.
  A report nobody finishes reading has failed, and in this department that failure is the
  one that matters most.
- **Every finding from the previous report appears**, even if only to be CLOSED.
- **Option A is always "do nothing", argued honestly.** For a solo founder, not acting is
  usually correct — and for a security backlog it is correct more often than anywhere else,
  because most of these are theoretical and all of them cost time that could be spent
  shipping.
- **Paste, never retype.** The `table`, the `summaries`, and the eight `tables.*` entries
  go in as they came out.

## Step 6 — Record the cost

Append one line to `docs/reports/cost-ledger.jsonl`:

```json
{"timestamp":"<ISO>","department":"security","costUsd":null,"inputTokens":null,"outputTokens":null,"cacheReadTokens":null,"cacheCreationTokens":null,"collectMs":<from the collector JSON>,"interpretMs":null,"turns":null,"findingCount":<n>}
```

Use `null` for anything you cannot measure. Never estimate a cost.

## Step 7 — Report in chat

The file is the archive. The chat summary is the deliverable:

1. **Verdict** — is anything exposed, yes or no. First line, not buried.
2. **What changed** — the deltas that moved and any finding opened or closed. If nothing
   moved, say "no change since <date>" plainly and stop.
3. **Anything urgent**, or an explicit "nothing needs action this week".

**Say the reassuring thing when it is true.** "Nothing needs action this week" is a
complete and valuable report. Padding it into paragraphs of qualified concern is how this
department loses its reader.

## Escalation — what is actually P0

Only these justify interrupting other work:

1. A table readable or writable without RLS containing user data
2. A secret reachable from the client bundle
3. Identity or entitlement forgeable — device cookie or admin session
4. Sandbox escape, or unbounded resource consumption in code execution
5. Payment state settable without a verified webhook
6. Any actively exploited issue, regardless of theoretical severity

Item 6 is the one you almost certainly cannot see. There is no alerting; `get_runtime_errors`
shows an exploit only if it happens to break something. **A clean report is not evidence
that nothing is happening**, and any report that implies otherwise is overstating what was
checked.

Everything else is planned work. Label it as such.

## Disclosure — the rule that outranks the others

`docs/reports/` is gitignored, permanently, and this repository is **public**. A security
report in a public repo is a published attack surface.

- **Never copy a finding, a control id with its state, a table name, a route path with a
  missing guard, or an environment variable name into any tracked file.** That includes
  commit messages, the plan files, `docs/reports/security/README.md`'s tracked siblings,
  and anything under `.claude/`.
- **Never write an exploit path, a payload, or a proof of concept anywhere**, including
  the gitignored report. Describe capability: "the session could be minted without the
  secret", not the steps.
- **A commit message never names what was found.** `fix(auth): tighten session
  verification` is right; naming the weakness it closed is a disclosure with a permanent
  public URL.
- If a standing assertion in `npm test` fails, **do not paste its output into a commit or
  a PR.** Record it in `docs/reports/security/README.md`, which is gitignored.
- When a finding is fixed, the fix commit and the report are separate acts. The report
  says what was closed; the commit says what changed.

## Common mistakes

| Mistake | Fix |
|---|---|
| Translating a collector `gap` straight to P0 | Step 4. `gap` is a finding, not a severity. |
| Reporting `not read` advisories as zero | An audit that did not run is not an all-clear. |
| Writing the report without reading the previous one | Step 1. The diff is the product. |
| Re-reporting something the June baseline already fixed | The controls are checked every run; only a *lapse* is a finding. |
| Re-arguing an ACCEPTED finding | Only its trigger reopens it. Name the trigger. |
| Rating a theory | If you cannot finish "someone could, in practice, …", it is a note. |
| Presenting `group_by` counts as a weekly figure | The window is ignored on this tier. It is roughly the last hour. |
| Reporting deployment, cache or capacity | Operations'. You have no tool that sees them. |
| Inflating a severity to survive council re-ranking | State your assumption and let the council correct it. |
| Naming a finding in a commit message | Disclosure. The commit is public forever. |
| Skipping the business-logic walk because nothing changed | It is the one check no regex performs. One flow, every week. |
| Computing or retyping a delta by hand | Paste the collector's `table` verbatim. |
| Writing `collectMs` straight into the RUN row | It is milliseconds. Divide by 1000 and round. |
| Padding "nothing needs action" into a paragraph | Say it in one line. That is the whole point of the persona. |
```

- [ ] **Step 2: Verify the agent is registered**

Run: `ls .claude/agents/`
Expected: `warden.md` alongside `pulse.md` and its siblings.

**Restart the session before dispatching WARDEN.** Agent definitions load at session
start, so a subagent dispatched after a mid-session edit runs the old instructions. This
already cost Operations a whole verification run — see the handoff's §6 — and the failure
mode is confusing precisely because the file on disk is correct.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/warden.md
git commit -m "feat(reports): add the WARDEN security department agent"
```

---

### Task 12: Department conventions, ignore verification, and the erasure standing assertion

**Files:**
- Create: `docs/reports/security/README.md` (**gitignored — never committed**)
- Modify: `lib/reports/privacyPosture.test.ts` — append one standing assertion

**Interfaces:**
- Consumes: `extractDeletionTargets`, `inventoryIdentityTables` from Task 4; `buildSchema` from Task 2.
- Produces: nothing new. This task closes the two forward references made earlier in this plan.

Three small things that the rest of the plan depends on and that have no natural home elsewhere.

**The ignore rule is verified rather than assumed.** Global Constraints asserts that `docs/reports/security/` needs no new `.gitignore` entry because the existing `docs/reports/` rule already covers it. That is the kind of claim that is true until someone reorders the file, and the cost of it being wrong is a published attack surface. Step 1 checks it against `git` itself rather than by reading the pattern.

**The department README is where findings live between runs.** Tasks 3, 5, 6 and 8 all instruct the implementer to record a failing standing assertion there rather than in a commit message. That file has to exist, and it has to be provably unreachable by git.

**The erasure extraction gets the standing assertion Task 4 promised.** `extractDeletionTargets` deliberately over-matches — it will accept any single-string helper call — and Task 4 argues that over-matching is the safe direction because it produces a missed residue rather than a false one. That argument holds only while the extractor still finds *something*. The failure it cannot survive is the opposite one: a refactor of `lib/deleteAccount.ts` that renames the helper, after which the extractor returns nothing, the residue silently becomes "every identity table", and the check reports a catastrophe that is really a parser regression. **That is the case this assertion catches**, and it is deliberately an assertion about the checker rather than about the result — it asserts that deletion touches at least one real table, never which tables are or are not covered.

- [ ] **Step 1: Verify the ignore rule covers the department directory**

Run:

```sh
git check-ignore -v --no-index \
  docs/reports/security/README.md \
  docs/reports/security/2026-08-08.md \
  docs/reports/security/.data/2026-08-08.json
```

Expected: three lines, each naming `.gitignore` and the `docs/reports/` rule. Every path must be matched.

If any path is unmatched, **stop and fix `.gitignore` before writing anything else in this task.** Do not add a `docs/reports/security/` entry as a belt-and-braces measure — a second rule covering the same paths means a later edit can remove the first one without anything failing, which is how the guarantee quietly weakens.

- [ ] **Step 2: Create the department README**

Create `docs/reports/security/README.md`:

```markdown
# Security department — standing notes

**This file is gitignored and must stay that way.** It holds findings between runs.
Nothing in it is ever copied into a tracked file, a commit message, or a PR description.

## What lives here

- **Open items recorded outside a run** — a standing assertion left failing, a control
  lapse noticed mid-week, anything found before the next WARDEN report can pick it up.
- **The reason a standing assertion is currently failing**, so the next person does not
  have to rediscover it, and so nobody "fixes" the test by weakening it.
- **Decisions taken between runs** that WARDEN should reflect rather than re-derive.

WARDEN reads this file in Step 1 of every run and must either reflect each item in the
report or explicitly close it.

## Conventions

- **Never weaken a standing assertion to make a build green.** The assertions in
  `rlsPosture.test.ts`, `routeGuards.test.ts`, `secretsPosture.test.ts` and
  `securityBaseline.test.ts` assert the *absence* of gaps. A passing run publishes
  nothing; a failing run is a finding. Record it here and leave it failing.
- **Rotate before you fix.** If a secret was exposed, rotating the value comes first and
  the code change second. A fixed code path does not un-publish a value.
- **A fix commit never names what it fixed.** `fix(auth): tighten session verification`
  is right. The repository is public and a commit message is permanent.
- **The reports in this directory are the only place findings are written down.** Never
  overwrite one; WARDEN archives an existing same-day report under `superseded/`.

## Open items

_(none recorded — first run has not happened yet)_
```

- [ ] **Step 3: Verify the README is unreachable by git**

Run: `git status --porcelain docs/reports/`

Expected: no output. If the README appears, Step 1 was misread — stop and re-check.

- [ ] **Step 4: Append the erasure standing assertion**

Append to `lib/reports/privacyPosture.test.ts`, after the existing describe blocks:

```typescript
describe("standing assertion: deletion targets still resolve", () => {
  it("finds at least one real table in lib/deleteAccount.ts", () => {
    const repo = join(__dirname, "..", "..");
    const migrationsDir = join(repo, "supabase", "migrations");
    const files = readdirSync(migrationsDir)
      .filter((name) => name.endsWith(".sql"))
      .sort()
      .map((name) => ({ name, sql: readFileSync(join(migrationsDir, name), "utf8") }));

    const known = new Set(buildSchema(files).map((table) => table.name));
    const targets = extractDeletionTargets(
      readFileSync(join(repo, "lib", "deleteAccount.ts"), "utf8")
    ).filter((name) => known.has(name));

    // Asserts the extractor still works, never which tables it covers.
    //
    // extractDeletionTargets over-matches on purpose, which is safe: an extra
    // name produces a missed residue rather than a false one. The failure it
    // cannot survive is the opposite — a rename in lib/deleteAccount.ts that
    // makes it match nothing, after which the residue silently becomes every
    // identity table and the report describes a catastrophe that is really a
    // parser regression. One resolved table is enough to prove it still reads.
    expect(targets.length).toBeGreaterThan(0);
  });
});
```

This needs `readdirSync`, `readFileSync`, `join` and `buildSchema` imported at the top of the file; Task 4's version imports none of them. Add:

```typescript
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSchema } from "./migrationSchema";
```

- [ ] **Step 5: Run the full suite**

Run: `npm test && npm run typecheck && npm run lint`

Expected: all three pass.

The standing assertions in Tasks 3, 5, 6 and 8 run here too, which is the point — they are the build-time half of the detection coverage assessed in Task 9, and escalations E1 and E2 have no other signal at all. **If one of them fails, apply the rule this plan has stated four times: do not weaken it, do not commit the output, record it in the README from Step 2.**

- [ ] **Step 6: Run the collector end to end**

Run: `npx tsx scripts/reports/security.ts`

Expected: a data file path, and `git status --porcelain docs/reports/` still empty afterwards.

- [ ] **Step 7: Commit**

```bash
git add lib/reports/privacyPosture.test.ts
git commit -m "test(reports): assert deletion-target extraction still resolves"
```

Only the test file is committed. The README from Step 2 is gitignored and `git add` will refuse it — that refusal is the guarantee working, not an obstacle to route around with `-f`.

---

## The council

Security benefits from the council more than any other department, and the spec says why: **its severities are the ones most often re-ranked by business context it does not hold.**

The spec's own worked example is this department's. WARDEN rates a device-cookie forgery path P1 — low-value data, nothing exposed. LEDGER points out that device identity is what gates paid content, so a forgery path is a revenue leak, and the finding is promoted to P0 **by the combination**. Neither department reaches that alone: WARDEN cannot see what gates revenue, and LEDGER cannot see that identity is forgeable.

That has a direct consequence for how WARDEN is written, and Task 11 encodes it: **rate on the security facts, state the assumption the rating rests on in the "Why <sev>" line, and let the council correct it.** A department that pre-emptively inflates severities to survive re-ranking destroys the signal the council needs, and one that deflates them to look calm does the same in the other direction. The "Why <sev>" line is not commentary — it is the handle the council grabs.

The council needs two or more departments reporting in one invocation and is nearly free when they are, because every report is already in context. It is not built by this plan and cannot be: it belongs to the invocation layer, not to any one department.

## What could not be verified

Written to be flagged rather than guessed at, in the order an implementer will hit them.

**No code in this plan has been run.** Every module, test and script here was written by reading the repository, not by executing anything. Three specific consequences:

- **The test counts are estimates.** Each task ends with `Expected: PASS — <n> tests`. Those are counted from the test bodies as written; a `describe` restructured during implementation changes them. **Correct the number to whatever vitest actually reports rather than making the suite match the plan.** A plan's arithmetic is not evidence.
- **The regex signals in Tasks 8 and 9 were written against the real files but never executed against them.** A pattern that reads correctly can still miss on whitespace, a line break inside a call, or a formatter's opinion. Expect the first `securityBaseline.test.ts` run to report a control or two `MISSING` that are in fact present. **Fix the pattern — but if a pattern needs loosening more than once, that control is testing the wrong thing and should be rewritten or dropped.** "Loosen until green" is precisely how a control becomes decorative while still rendering as `present`, which is worse than not having it.
- **The collector has never been run**, so the payload shape in Task 10 Step 4 is asserted, not observed. The metric count (31) and table count (8) are counted from the source as written.

**`lib/reports/previousRun.ts` does not exist yet.** It is Finance plan Task 1 and a hard dependency, and the collector imports it against the documented signature `readPreviousRun(outDir, currentFilename) → { key, metrics } | null`. If Finance shipped a different shape — `date` instead of `key` is the likely divergence, since that is what `scripts/reports/ops.ts` calls it inline today — Task 10 needs the field name adjusted in two places. **Adjust the collector, not `previousRun.ts`:** Ops and Finance already consume it, and changing a shared module to suit the newest caller is how a dependency becomes three dependencies.

**Whether the June 2026 baseline was ever completed as written.** This is the honest limit on the baseline assessment given in Task 8, and it is worth stating separately because it changes what the first WARDEN run means.

The full assessment is in Task 8 and is not repeated here; the verdict is that `docs/superpowers/plans/2026-06-15-security-hardening.md` is **substantial enough to serve as provenance, and not substantial enough to serve as a checkable baseline** — twelve tasks in about 3 KB, naming the control and the file for each, but recording intentions ("add X") rather than end states, carrying at least one literal that has since been tightened, and containing one item whose subject the subscription pivot replaced outright. Task 8 closes that gap by transcribing all twelve into controls that assert properties.

What cannot be verified is the step before that: **the plan file's checkboxes are all still unchecked.** Every `- [ ]` in it is unmarked, so the document does not record its own completion. The controls in Task 8 are therefore the *only* evidence that any given baseline item shipped — which is fine, and arguably better than a checkbox, but it means a `MISSING` control on the first run is genuinely ambiguous. It could be a regression since June, or an item that was planned and never built. **Do not report a first-run `MISSING` as a regression.** Report it as "not currently present", check the git history for the file, and let the second run establish the trend. Getting this wrong in week one is the exact shape of crying wolf that Task 11's persona exists to prevent, and it would happen on the department's very first report.

**Three real findings were observed while writing this plan and are deliberately not described in it.** Two were recorded in *Disclosure discipline* at the top of this file: one lives in `supabase/migrations/20260623_enable_rls.sql`, one lives in `lib/deleteAccount.ts` together with the identity columns declared across `supabase/migrations/`. A third was observed while writing Tasks 6 through 10 and lives in `package-lock.json`. All three are within the scope of checks this plan builds — Tasks 3, 4 and 7 respectively — and all three will surface automatically on the first WARDEN run.

**Their details, values and counts are withheld from this tracked file pending that first private run.** That is not caution for its own sake: this file is public, and a plan that says "here is the check, and here is what it found" is a disclosure with a permanent URL. Do not go looking for them in order to write them down. The collector will produce them and the private report is where they belong.

There is also one **cross-layer observation** spanning `lib/auth/adminSession.ts` and `middleware.ts` that Task 5's `cookieScopeConflicts` is built to surface and that the collector wires up in Task 10. Whether it fails open or closed is a judgement the check deliberately does not make — the module reports the mismatch and leaves the severity to WARDEN, because the answer differs by direction. Details withheld on the same terms.

**Environment-dependent behaviour that was confirmed by hand once and not more than once:**

- `git check-ignore -q --no-index <path>` returns 0 for an ignored path whether or not the path exists on disk. This is what makes the `.env` check non-vacuous on a fresh clone, and it was verified against the git on this machine only. A different git version is not expected to differ, but it was not tested.
- **`npm audit` needs the network**, and node on this machine lives under nvm at a path absent from a clean environment's `PATH`. A collector run from a stripped environment will produce `not read` advisory rows for a reason that has nothing to do with security. That is the correct output, but it is worth recognising rather than debugging.
- **`npm query` with the `:attr()` selector** was exercised at plan time and returns the documented array shape. It is a newer npm surface than the rest of what this collector uses, and `classifyInstallScripts` treats any unexpected shape as `readable: false` rather than as an empty result — a distinction that matters and that is tested.

**The Vercel MCP grants in Task 11's frontmatter were not exercised.** WARDEN is granted `get_runtime_errors` and `get_runtime_logs` and nothing else. Whether a subagent with exactly that grant list can call them was not tested; PULSE holds a superset and works. If they fail, WARDEN's Step 3 degrades to "not read" for detection escalation E6, which is already permanently blind — so the failure is survivable and must be reported rather than worked around.

**Nothing here was tested against a second run.** Every delta in the POSTURE table is `—` on a baseline run. The first report that exercises `diffMetrics` against real prior data is the second one, a week later, and that is where a metric-label typo or a changed row set will show up as a silently broken delta rather than an error.

## Deferred from this plan

The spec gives Security eleven sub-functions. This plan implements all eleven, but four land partial, and one piece of integration is excluded by instruction. Stated plainly rather than left to be discovered.

**The `/report` routing and the npm script are excluded by instruction, not by judgement.** `.claude/skills/report/SKILL.md` needs a `security` routing row and `package.json` needs `"report:security": "tsx scripts/reports/security.ts"`. Both are handled once, centrally, in a single integration pass covering all three new departments — touching them from three plans is how a merge conflict becomes a routing table with two rows for the same department. **Until that pass lands the collector runs as `npx tsx scripts/reports/security.ts`**, and `.claude/agents/warden.md` names both forms so it works either way.

**Supply chain: no reachability analysis.** `npm audit` reports the dependency tree, not the call graph. A critical advisory in a package that is installed but never imported on a live path rates very differently from one in a package every request touches, and this plan gives WARDEN no way to tell them apart beyond `isDirect` and the dev/prod flag. Real reachability needs either a bundle analysis or a tool this project does not have, and the honest interim is Task 11's rubric line — move an advisory up when the package is a direct production dependency, down when it is dev-tree only — applied by hand. Revisit if the advisory count ever gets large enough that hand-sorting stops being viable.

**Secrets: the client-reachability closure is static and has one known hole.** `clientReachable` follows imports, so it catches a server-only variable read from a module a client component imports. It does **not** catch a value read on the server and passed to a client component as a prop, because that is a data flow rather than an import edge, and following it needs type information the collector does not have. This is a real gap and it is named here rather than papered over. Two things reduce it: the `NEXT_PUBLIC_` naming check is independent of the closure and catches the most common form, and a prop-passed secret is visible in the rendered payload, which is a different check entirely and belongs to a review rather than a weekly diff.

**Sandbox and code execution: source inspection only.** Everything Task 8's `EXECUTION` group asserts is a property of the source — the limits are declared, the teardown is in a `finally`, the caps exist. **Nothing here attempts to escape anything, and nothing should.** Confirming that a limit actually binds means running hostile code against a live sandbox, which needs an isolated environment, a decision about blast radius, and an appetite for finding out the answer is no. That is a deliberate, scheduled exercise, not something to bolt onto a weekly report. The plan's position is that a declared limit is worth checking weekly and a demonstrated limit is worth checking rarely, and it builds the first.

**Detection: the coverage is assessed, not improved.** Task 9 establishes that escalation E6 — anything actively exploited — is permanently blind because no alerting exists. **This plan does not build alerting**, and that is the right call at this stage: alerting is a project with its own operating cost, and a threshold on 401 volume with nobody reading it is worse than nothing. The blind row is recorded with a reopen trigger so it is reported as a standing accepted risk rather than rediscovered every week, and the trigger is written to fire on the thing that should actually change the answer — the first incident that ran undetected for more than a day, or revenue reaching the point where an hour of exposure costs more than the alerting would.

**Privacy: the legal posture is not assessed.** Task 4 answers what personal data exists, where, and whether deletion reaches it. The spec also asks about PH Data Privacy Act posture given that the users are students and some may be minors. That is a legal judgement about consent, parental consent thresholds, and lawful basis — not a property of the schema, and not something a weekly regex should pretend to rate. It belongs in a periodic review with the privacy policy open, and the mechanism this plan contributes is `RETENTION_REGISTER`, which forces every deliberate retention to name the policy section that authorises it. That at least makes the legal question *askable* against a concrete list.

**Cost accounting is structurally incomplete, exactly as it is for every department.** WARDEN writes `costUsd: null` for its own run because a subagent cannot measure its own token consumption from inside a session. Real accounting needs headless `claude -p --output-format json`, which is an invocation-layer change. The ledger line is still appended — `collectMs` and `findingCount` are real — so cost-per-finding becomes answerable the moment the invocation layer can supply the rest.

**Nothing here reads the platform firewall.** Vercel's WAF, rate-limiting rules, and attack-mode state are a genuine part of this product's security posture and no tool granted to WARDEN can see them. They are not in the spec's data sources either. Named here so their absence is a known gap rather than an assumed pass.

## Verification

After all tasks, confirm the department works end to end:

- [ ] `npx tsx scripts/reports/security.ts` writes JSON to `docs/reports/security/.data/<today>.json`
- [ ] That run completes without any Supabase credential in the environment
- [ ] `grep -nE "reportsEnv|supabaseAdmin|createClient|SERVICE_ROLE" scripts/reports/security.ts` prints nothing
- [ ] The JSON carries 31 metrics, 8 rendered tables, and 7 summary lines
- [ ] No metric label exceeds 30 characters
- [ ] The advisory rows read a number when the network is up, and `not read` when it is down — never `0` in the second case
- [ ] `previousKey` is `null` on the first run
- [ ] A second run the same day archives the first to `.data/superseded/<date>.1.json` rather than overwriting it
- [ ] A run the following day populates LAST RUN with real deltas
- [ ] `/report security` produces a report at `docs/reports/security/<today>.md` — **after the central integration pass adds the routing row**
- [ ] That report's POSTURE table is the collector's `table` field verbatim, with no number retyped
- [ ] Every finding carries a severity, a "Why <sev>" line, and options A/B/C with A argued honestly
- [ ] The report names one business-logic flow walked this week
- [ ] `docs/reports/cost-ledger.jsonl` has one line per run with `department: "security"`
- [ ] `git status --porcelain docs/reports/` is empty
- [ ] `git check-ignore -v --no-index docs/reports/security/2026-08-08.md` matches the `docs/reports/` rule
- [ ] No commit message from any task names a finding, a table, a route, a control id, or an environment variable
- [ ] `npm test && npm run typecheck && npm run lint` all pass
- [ ] The four standing assertions run as part of `npm test` and assert absence, so a passing suite publishes nothing
