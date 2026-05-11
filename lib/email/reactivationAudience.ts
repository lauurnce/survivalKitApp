// Who gets the finals reactivation email. Pure, so the exclusion rules are
// testable without a database; scripts/email/reactivation.ts does the I/O.

export interface AudienceUser {
  id: string;
  email: string | null | undefined;
  emailConfirmedAt: string | null | undefined;
  /** Supabase sets this while an account is banned. */
  bannedUntil?: string | null;
  createdAt?: string;
}

export interface AudienceInputs {
  users: readonly AudienceUser[];
  /** Opted out via email_unsubscribes. */
  unsubscribed: ReadonlySet<string>;
  /** A previous email to them parked at status 'failed' (bounce proxy). */
  bounced: ReadonlySet<string>;
  /** Paying right now: an active subscription that has not ended. */
  activeBuyers: ReadonlySet<string>;
  /** Already have a row for this campaign in email_outbox. */
  alreadyQueued: ReadonlySet<string>;
  now?: Date;
}

export interface AudienceResult {
  /** Eligible users, oldest account first, so batches are deterministic. */
  eligible: { id: string; email: string }[];
  counts: {
    accounts: number;
    unconfirmed: number;
    banned: number;
    confirmed: number;
    excludedUnsubscribed: number;
    excludedBounced: number;
    excludedActiveBuyer: number;
    excludedAlreadyQueued: number;
    eligible: number;
  };
}

/**
 * Each confirmed account lands in exactly one bucket, first match wins:
 * unsubscribed, bounced, active buyer, already queued, else eligible. The
 * order puts the reasons we must never mail someone ahead of the ones we
 * merely choose not to, so the counts read as "why not" in priority order.
 */
export function selectReactivationAudience(input: AudienceInputs): AudienceResult {
  const now = (input.now ?? new Date()).getTime();
  const counts = {
    accounts: input.users.length,
    unconfirmed: 0,
    banned: 0,
    confirmed: 0,
    excludedUnsubscribed: 0,
    excludedBounced: 0,
    excludedActiveBuyer: 0,
    excludedAlreadyQueued: 0,
    eligible: 0,
  };
  const eligible: { id: string; email: string; createdAt: string }[] = [];

  for (const u of input.users) {
    if (!u.email || !u.emailConfirmedAt) { counts.unconfirmed++; continue; }
    if (u.bannedUntil && Date.parse(u.bannedUntil) > now) { counts.banned++; continue; }
    counts.confirmed++;
    if (input.unsubscribed.has(u.id)) { counts.excludedUnsubscribed++; continue; }
    if (input.bounced.has(u.id)) { counts.excludedBounced++; continue; }
    if (input.activeBuyers.has(u.id)) { counts.excludedActiveBuyer++; continue; }
    if (input.alreadyQueued.has(u.id)) { counts.excludedAlreadyQueued++; continue; }
    eligible.push({ id: u.id, email: u.email, createdAt: u.createdAt ?? "" });
  }

  eligible.sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  counts.eligible = eligible.length;
  return { eligible: eligible.map(({ id, email }) => ({ id, email })), counts };
}

/**
 * Drain runs once a day and sends at most 50 rows (lib/email/outbox.ts), and
 * Resend's free tier allows 100 sends a day. Capping reactivation at 40 a day
 * leaves the rest of each drain for receipts and access notices, which must
 * never wait behind a marketing batch.
 */
export const MAX_REACTIVATION_PER_DAY = 40;

/** send_after for the i-th queued row: perDay rows per day, starting at `start`. */
export function scheduleFor(i: number, perDay: number, start: Date): Date {
  if (!Number.isInteger(perDay) || perDay < 1 || perDay > MAX_REACTIVATION_PER_DAY) {
    throw new Error(`perDay must be an integer from 1 to ${MAX_REACTIVATION_PER_DAY}`);
  }
  return new Date(start.getTime() + Math.floor(i / perDay) * 24 * 60 * 60 * 1000);
}
