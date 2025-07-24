// Shared by app/api/cron/email/route.ts and its tests. Lives outside the
// route file because a Next.js route module may only export route handlers.

// Vercel fires a daily cron anywhere inside its scheduled hour, so two runs
// can sit up to ~25h apart. Each window overhangs a day by this much on both
// sides so consecutive windows always overlap; the outbox's unique index
// absorbs the double hit.
export const SCAN_SLACK_MS = 2 * 60 * 60 * 1000;

// Normalised so "…+00:00" from PostgREST and "…Z" give the same key.
export function expiryScopeKey(sub: { id: unknown; current_period_end: string }): string {
  return `${String(sub.id)}:${new Date(sub.current_period_end).toISOString()}`;
}
