/**
 * Finals reactivation email: count the audience, and optionally queue it.
 *
 *   npx tsx scripts/email/reactivation.ts                          # dry run (default)
 *   npx tsx scripts/email/reactivation.ts --enqueue --limit 40     # queue 40 rows
 *   npx tsx scripts/email/reactivation.ts --enqueue --limit 400 --per-day 40 --start 2026-11-24
 *
 * Dry run never writes and prints counts only: no emails, no user ids.
 *
 * --enqueue inserts rows into email_outbox and sends nothing itself. The daily
 * /api/cron/email drain sends them. Rows are spread --per-day at a time
 * (default and max 40) across consecutive days from --start (default now), so
 * each day's drain (capped at 50 rows) still has room for receipts, and the
 * total stays inside Resend's free tier (100/day, 3,000/month).
 *
 * Re-running is safe: users already queued for this campaign are skipped, and
 * the outbox's unique (kind, user_id, scope_key) index rejects any duplicate.
 *
 * Before --enqueue: apply migrations 20260905000000 and 20260905000001 to
 * production and set EMAIL_UNSUBSCRIBE_SECRET (>= 32 chars) on Vercel, or every
 * queued row will fail to render at drain time. The script refuses to enqueue
 * while email_unsubscribes is missing.
 *
 * Credentials come from .env.reports.local, like scripts/reports/*.
 * tsx transpiles to CommonJS, so no top-level await.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueue, REACTIVATION_CAMPAIGN } from "../../lib/email/outbox";
import {
  MAX_REACTIVATION_PER_DAY,
  scheduleFor,
  selectReactivationAudience,
  type AudienceUser,
} from "../../lib/email/reactivationAudience";
import { createReportsClient } from "../reports/supabaseAdmin";

interface Args {
  enqueue: boolean;
  limit: number | null;
  perDay: number;
  start: Date;
}

function parseArgs(argv: string[]): Args {
  const value = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const limitRaw = value("--limit");
  const perDayRaw = value("--per-day");
  const startRaw = value("--start");

  const limit = limitRaw === undefined ? null : Number(limitRaw);
  if (limit !== null && (!Number.isInteger(limit) || limit < 1)) throw new Error("--limit must be a positive integer");
  const perDay = perDayRaw === undefined ? MAX_REACTIVATION_PER_DAY : Number(perDayRaw);
  const start = startRaw === undefined ? new Date() : new Date(`${startRaw}T00:00:00+08:00`);
  if (Number.isNaN(start.getTime())) throw new Error("--start must be YYYY-MM-DD (PH date)");
  scheduleFor(0, perDay, start); // validates perDay

  const args = { enqueue: argv.includes("--enqueue"), limit, perDay, start };
  if (args.enqueue && args.limit === null) throw new Error("--enqueue needs an explicit --limit N");
  return args;
}

async function listAllUsers(client: SupabaseClient): Promise<AudienceUser[]> {
  const out: AudienceUser[] = [];
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) {
      out.push({
        id: u.id,
        email: u.email,
        emailConfirmedAt: u.email_confirmed_at,
        bannedUntil: (u as { banned_until?: string | null }).banned_until ?? null,
        createdAt: u.created_at,
      });
    }
    if (data.users.length < perPage) return out;
  }
}

async function idSet(
  label: string,
  query: PromiseLike<{ data: { user_id: string | null }[] | null; error: { message: string } | null }>
): Promise<Set<string>> {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return new Set((data ?? []).map((r) => r.user_id).filter((id): id is string => !!id));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const client = createReportsClient();
  const nowIso = new Date().toISOString();

  // email_unsubscribes arrives with migration 20260905000000. Until it is
  // applied a dry run can still count (nobody can have opted out of a list
  // that does not exist), but queueing mail is refused.
  const unsubRes = await client.from("email_unsubscribes").select("user_id");
  const unsubTableMissing = unsubRes.error?.code === "PGRST205";
  if (unsubRes.error && !unsubTableMissing) throw new Error(`email_unsubscribes: ${unsubRes.error.message}`);
  const unsubscribed = new Set((unsubRes.data ?? []).map((r: { user_id: string }) => r.user_id));

  const [users, bounced, activeBuyers, alreadyQueued] = await Promise.all([
    listAllUsers(client),
    // No bounce webhook exists yet; a row parked at 'failed' after the
    // outbox's 5 retries is the closest signal. Resend also suppresses hard
    // bounces on its side.
    idSet("email_outbox failed", client.from("email_outbox").select("user_id").eq("status", "failed")),
    idSet(
      "active subscriptions",
      client.from("subscriptions").select("user_id").eq("status", "active").gt("current_period_end", nowIso)
    ),
    idSet(
      "queued reactivation",
      client.from("email_outbox").select("user_id").eq("kind", "reactivation")
        .eq("payload->>scope_key", REACTIVATION_CAMPAIGN)
    ),
  ]);

  const { eligible, counts } = selectReactivationAudience({ users, unsubscribed, bounced, activeBuyers, alreadyQueued });

  console.log(`Finals reactivation (${REACTIVATION_CAMPAIGN}) — ${args.enqueue ? "ENQUEUE" : "dry run, nothing written"}`);
  console.log(`  auth accounts                ${counts.accounts}`);
  console.log(`  unconfirmed / no email       ${counts.unconfirmed}`);
  console.log(`  banned                       ${counts.banned}`);
  console.log(`  confirmed accounts           ${counts.confirmed}`);
  console.log(`  excluded: unsubscribed       ${counts.excludedUnsubscribed}${unsubTableMissing ? "  (email_unsubscribes not applied yet)" : ""}`);
  console.log(`  excluded: bounced/failed     ${counts.excludedBounced}`);
  console.log(`  excluded: active buyer       ${counts.excludedActiveBuyer}`);
  console.log(`  excluded: already queued     ${counts.excludedAlreadyQueued}`);
  console.log(`  eligible                     ${counts.eligible}`);
  const days = Math.ceil(counts.eligible / args.perDay);
  console.log(`  at ${args.perDay}/day the full list takes ${days} daily drain${days === 1 ? "" : "s"}`);

  if (!args.enqueue) return;

  if (unsubTableMissing) {
    throw new Error("Refusing to enqueue: apply migration 20260905000000_email_unsubscribes first.");
  }

  const batch = eligible.slice(0, args.limit!);
  let enqueued = 0, deduped = 0;
  for (const [i, u] of batch.entries()) {
    const r = await enqueue(client, {
      kind: "reactivation",
      userId: u.id,
      toEmail: u.email,
      scopeKey: REACTIVATION_CAMPAIGN,
      payload: { campaign: REACTIVATION_CAMPAIGN },
      sendAfter: scheduleFor(i, args.perDay, args.start),
    });
    if (r.enqueued) enqueued++;
    if (r.deduped) deduped++;
  }
  console.log(`  queued ${enqueued}, already present ${deduped}, over ${Math.ceil(batch.length / args.perDay)} day(s)`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
