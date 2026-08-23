/**
 * Supabase's select ceiling, and the guard that keeps a truncated read from
 * becoming a wrong revenue figure.
 *
 * PostgREST enforces a server-side `max-rows` of 1000. Passing the cap is not
 * an error — the response simply stops at 1000 rows with no warning. A revenue
 * total summed from a truncated ledger is wrong, plausible, and undetectable,
 * which is the worst combination a finance report can produce.
 *
 * A result of exactly 1000 rows is indistinguishable from a truncated one, so
 * the guard fires at the cap rather than above it. That costs a false alarm on
 * a table holding exactly 1000 rows and buys certainty everywhere else.
 *
 * The fix when this fires is an aggregate RPC — computing the number in
 * Postgres and reading one row back — not a larger limit. Follow
 * supabase/migrations/20260629000000_admin_top_sections.sql.
 */

export const SELECT_ROW_CAP = 1000;

export function assertUnderCap(table: string, rowCount: number): void {
  if (rowCount < SELECT_ROW_CAP) return;

  throw new Error(
    `${table} returned ${rowCount} rows, at or past Supabase's ` +
      `${SELECT_ROW_CAP}-row select cap. The result may be silently truncated, ` +
      `so any figure derived from it would be wrong without looking wrong. ` +
      `Add a Postgres aggregate RPC for ${table} — see ` +
      `supabase/migrations/20260629000000_admin_top_sections.sql — and read ` +
      `the aggregate instead of the rows. Do not raise the limit.`
  );
}
