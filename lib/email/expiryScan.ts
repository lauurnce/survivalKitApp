// Shared by app/api/cron/email/route.ts and its tests. Lives outside the
// route file because a Next.js route module may only export route handlers.

// Vercel fires a daily cron anywhere inside its scheduled hour, so two runs
// can sit up to ~25h apart. Each window overhangs a day by this much on both
// sides so consecutive windows always overlap; the outbox's unique index
// absorbs the double hit.
export const SCAN_SLACK_MS = 2 * 60 * 60 * 1000;
