/**
 * Credentials for report collectors.
 *
 * Collectors read production Supabase from `.env.reports.local` and nothing
 * else. `.env.local` deliberately carries no Supabase values, so that
 * `npm run dev` cannot write rows into `events`, `profiles`, or `user_feedback`
 * — that is the exact dataset Growth reports on, and local testing polluting it
 * would corrupt the department's own numbers.
 *
 * The file is parsed here rather than loaded through `process.loadEnvFile`
 * because that function does not override variables already present in the
 * environment. A stray exported NEXT_PUBLIC_SUPABASE_URL would silently win,
 * pointing the collector at a different database while the run looked normal
 * and every figure in the report was wrong.
 */

export const REPORTS_ENV_FILE = ".env.reports.local";

export interface ReportsCredentials {
  url: string;
  serviceRoleKey: string;
}

/** Minimal KEY=VALUE parser. No interpolation, no export keyword, no multiline. */
export function parseEnvFile(contents: string): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key) continue;

    // Only the FIRST equals separates key from value — service role keys and
    // JWTs routinely contain more.
    let value = line.slice(eq + 1).trim();
    const quoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);

    vars[key] = value;
  }

  return vars;
}

function require(vars: Record<string, string | undefined>, key: string): string {
  const value = vars[key]?.trim();
  if (!value) {
    throw new Error(
      `${key} is missing or empty. Report collectors read production Supabase ` +
        `credentials from ${REPORTS_ENV_FILE} at the repo root. Get them from the ` +
        `Supabase dashboard → Project Settings → API — \`vercel env pull\` cannot ` +
        `retrieve them, they are flagged Sensitive and come back as placeholders.`
    );
  }
  return value;
}

export function readReportsCredentials(
  vars: Record<string, string | undefined>
): ReportsCredentials {
  const url = require(vars, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = require(vars, "SUPABASE_SERVICE_ROLE_KEY");

  // A local Supabase has none of the production data. A report built against it
  // would be internally consistent and completely wrong, which is worse than a
  // report that refuses to run.
  if (!url.startsWith("https://")) {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must be an https production URL; got "${url}". ` +
        `Reports read production only.`
    );
  }

  return { url, serviceRoleKey };
}
