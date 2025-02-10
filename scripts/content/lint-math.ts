/**
 * npm run content:lint — render every section body through the reader's
 * markdown/KaTeX pipeline and report anything a reader would see broken.
 * The rules live in ./lintMath.ts.
 *
 * Two sources:
 *   (default)        every row of `sections` in the database named by
 *                    .env.local. READ-ONLY: a single paginated select with the
 *                    service-role key, so gated reviewer bodies are included.
 *   --files <dir>…   files on disk: every .md file, and every `$md$…$md$`
 *                    body in a .sql seed (supabase/seeds). No credentials
 *                    needed, so CI can run it.
 *
 * Options:
 *   --out <file>     also write the markdown report to <file>
 *   --json <file>    also write the raw results as JSON
 *
 * Exits 1 when any issue is found, so it can gate CI.
 *
 * tsx transpiles to CommonJS, so no top-level await.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parseEnvFile } from "../../lib/reports/reportsEnv";
import { lintBody, type LintIssue } from "./lintMath";

const REPO_ROOT = join(__dirname, "..", "..");
const PAGE = 1000;

interface Target {
  /** Section id, or file path in --files mode. */
  id: string;
  label: string;
  body: string;
}

interface Result extends Target {
  issues: LintIssue[];
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

function walkContent(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walkContent(p);
    return /\.(md|sql)$/.test(p) ? [p] : [];
  });
}

// Seeds quote every section body as a $md$…$md$ dollar-quoted string.
const SQL_BODY = /\$md\$([\s\S]*?)\$md\$/g;

function fileTargets(dirs: string[]): Target[] {
  return dirs.flatMap(walkContent).sort().flatMap((p) => {
    const rel = relative(REPO_ROOT, p);
    const text = readFileSync(p, "utf8");
    if (p.endsWith(".md")) return [{ id: rel, label: rel, body: text }];
    return [...text.matchAll(SQL_BODY)].map((m) => {
      const line = text.slice(0, m.index).split("\n").length;
      return { id: `${rel}:${line}`, label: `${rel}:${line} (body starts here)`, body: m[1] };
    });
  });
}

interface SectionRow {
  id: string;
  heading: string;
  kind: string;
  sort_order: number;
  body_md: string;
  modules: { title: string; subjects: { title: string } | null } | null;
}

async function dbTargets(): Promise<Target[]> {
  const env = parseEnvFile(readFileSync(join(REPO_ROOT, ".env.local"), "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error(".env.local needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows: SectionRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from("sections")
      .select("id, heading, kind, sort_order, body_md, modules(title, subjects(title))")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`select sections: ${error.message}`);
    rows.push(...((data ?? []) as unknown as SectionRow[]));
    if (!data || data.length < PAGE) break;
  }

  return rows.map((r) => ({
    id: r.id,
    label: `${r.modules?.subjects?.title ?? "?"} › ${r.modules?.title ?? "?"} › ${r.heading} (${r.kind}, ${r.body_md.length} chars)`,
    body: r.body_md,
  }));
}

function formatReport(source: string, results: Result[], total: number): string {
  const broken = results.filter((r) => r.issues.length > 0);
  const counts = new Map<string, number>();
  for (const r of broken) for (const i of r.issues) counts.set(i.rule, (counts.get(i.rule) ?? 0) + 1);

  const out = [
    "# Content lint results",
    "",
    `Source: ${source}. Checked ${total} bodies; ${broken.length} have issues.`,
    "",
  ];
  if (counts.size) {
    out.push("| rule | issues |", "|---|---|");
    for (const [rule, n] of [...counts].sort()) out.push(`| ${rule} | ${n} |`);
    out.push("");
  }
  for (const r of broken) {
    out.push(`## ${r.label}`, "", `id: \`${r.id}\``, "");
    for (const i of r.issues) {
      out.push(`- **${i.rule}**${i.line ? ` (line ${i.line})` : ""}: ${i.message}`);
      if (i.excerpt) out.push(`  - \`${i.excerpt.replace(/`/g, "'")}\``);
    }
    out.push("");
  }
  return out.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const fileMode = args.includes("--files");
  const dirs: string[] = [];
  if (fileMode) {
    for (const a of args.slice(args.indexOf("--files") + 1)) {
      if (a.startsWith("--")) break;
      dirs.push(a);
    }
  }
  if (fileMode && dirs.length === 0) dirs.push(join(REPO_ROOT, "content"));

  const targets = fileMode ? fileTargets(dirs.map((d) => resolve(d))) : await dbTargets();
  const results: Result[] = targets.map((t) => ({ ...t, issues: lintBody(t.body) }));
  const source = fileMode ? `files under ${dirs.join(", ")}` : "database `sections.body_md` (read-only select)";
  const report = formatReport(source, results, targets.length);

  const out = argValue(args, "--out");
  if (out) writeFileSync(out, report);
  const json = argValue(args, "--json");
  if (json) {
    const broken = results.filter((r) => r.issues.length).map(({ id, label, body, issues }) => ({ id, label, length: body.length, issues, body }));
    writeFileSync(json, JSON.stringify(broken, null, 2));
  }

  console.log(report);
  if (results.some((r) => r.issues.length)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 2;
});
