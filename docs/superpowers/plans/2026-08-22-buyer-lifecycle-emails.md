# Buyer Lifecycle Emails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a receipt, a welcome, an expiry warning, and a win-back email to people who buy, so a purchase stops being a silent transaction and access stops expiring without warning.

**Architecture:** A Resend-backed outbox. The PayMongo webhook enqueues an `email_outbox` row and attempts an immediate send; a daily Vercel cron retries anything unsent and generates the scheduled expiry and win-back mail. The outbox exists because the webhook is idempotent on `linkId` — an inline-only send is lost forever when PayMongo's retry hits the dedupe branch and returns early.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (Postgres), Resend, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-22-buyer-lifecycle-emails-design.md`

## Global Constraints

- From address is exactly `BSIT Survival Kit <noreply@mail.lawrenceigen.me>`. Defined once, in `lib/email/client.ts`, never re-typed elsewhere.
- Every template returns **both** `html` and `text`. HTML-only mail is a deliverability liability.
- An email failure must **never** turn a successful payment into a failed webhook. All email work in the webhook is wrapped and swallowed.
- Tests never perform a live send. Resend is mocked everywhere.
- Test runner is `npm test` (Vitest). Tests are colocated as `*.test.ts` beside the module.
- Import via the `@/` alias, matching the rest of the codebase.
- Migrations are named `YYYYMMDDHHMMSS_description.sql` in `supabase/migrations/`.
- Commits carry **no** `Co-Authored-By` trailer (see `CLAUDE.md`).
- Money is in **centavos** throughout, matching `PLANS` in `lib/paymongo.ts`. Format for display only at the template boundary.
- **Node lives under nvm and is off the default PATH on this machine.** If `npm` is not found, source the nvm bin directory first — do not conclude Node is missing.

## Shared Interfaces

Every task implements against these exact signatures. Do not rename.

```ts
// lib/email/types.ts
export type EmailKind = "receipt" | "welcome" | "expiry_warning" | "winback";
export interface RenderedEmail { subject: string; html: string; text: string }

// lib/email/client.ts
export const FROM: string;
export interface SendResult { ok: boolean; id?: string; error?: string }
export function sendEmail(to: string, email: RenderedEmail): Promise<SendResult>;

// lib/email/templates/*.ts
export function receiptEmail(i: { planLabel: string; amountCentavos: number; accessEndsAt: Date; returnUrl: string }): RenderedEmail;
export function welcomeEmail(i: { planLabel: string; returnUrl: string }): RenderedEmail;
export function expiryWarningEmail(i: { planLabel: string; accessEndsAt: Date; renewUrl: string }): RenderedEmail;
export function winbackEmail(i: { planLabel: string; renewUrl: string }): RenderedEmail;

// lib/email/outbox.ts
export interface EnqueueInput {
  kind: EmailKind; userId: string; toEmail: string;
  payload: Record<string, unknown>; scopeKey: string; sendAfter?: Date;
}
export function enqueue(supabase: SupabaseClient, input: EnqueueInput): Promise<{ enqueued: boolean; deduped: boolean }>;
export function drain(supabase: SupabaseClient, limit?: number): Promise<{ sent: number; failed: number }>;
```

**Execution order.** Tasks 1, 2, 3, 7 are independent and may run in parallel. Task 4 needs 1 and 3. Tasks 5 and 6 need 4 and 2.

---

### Task 1: Resend client wrapper

**Files:**
- Create: `lib/email/types.ts`
- Create: `lib/email/client.ts`
- Test: `lib/email/client.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `FROM`, `SendResult`, `sendEmail(to, email)`, `EmailKind`, `RenderedEmail`.

- [ ] **Step 0: Install the SDK**

The Resend *integration* is provisioned separately by the user (it supplies
`RESEND_API_KEY`); the client library still has to be a dependency:

```bash
npm install resend
```
Expected: `resend` appears in `package.json` dependencies.

- [ ] **Step 1: Write the failing test**

```ts
// lib/email/client.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class { emails = { send: sendMock }; },
}));

beforeEach(() => { sendMock.mockReset(); process.env.RESEND_API_KEY = "re_test"; });

describe("sendEmail", () => {
  it("sends from the branded address and reports the id", async () => {
    sendMock.mockResolvedValue({ data: { id: "abc" }, error: null });
    const { sendEmail, FROM } = await import("./client");
    const r = await sendEmail("s@example.com", { subject: "S", html: "<p>H</p>", text: "H" });
    expect(FROM).toBe("BSIT Survival Kit <noreply@mail.lawrenceigen.me>");
    expect(r).toEqual({ ok: true, id: "abc" });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: FROM, to: "s@example.com", subject: "S", html: "<p>H</p>", text: "H" })
    );
  });

  it("returns ok:false instead of throwing when Resend errors", async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: "rate limited" } });
    const { sendEmail } = await import("./client");
    expect(await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" }))
      .toEqual({ ok: false, error: "rate limited" });
  });

  it("returns ok:false instead of throwing when the SDK throws", async () => {
    sendMock.mockRejectedValue(new Error("network down"));
    const { sendEmail } = await import("./client");
    expect(await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" }))
      .toEqual({ ok: false, error: "network down" });
  });

  it("returns ok:false when the API key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    vi.resetModules();
    const { sendEmail } = await import("./client");
    const r = await sendEmail("s@example.com", { subject: "S", html: "h", text: "t" });
    expect(r.ok).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/email/client.test.ts`
Expected: FAIL — cannot resolve `./client`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/email/types.ts
export type EmailKind = "receipt" | "welcome" | "expiry_warning" | "winback";
export interface RenderedEmail { subject: string; html: string; text: string }
```

```ts
// lib/email/client.ts
import { Resend } from "resend";
import type { RenderedEmail } from "./types";

// The one place the sender identity is written. mail.<domain> rather than the
// root so a spam complaint here never damages the apex domain's reputation.
export const FROM = "BSIT Survival Kit <noreply@mail.lawrenceigen.me>";

export interface SendResult { ok: boolean; id?: string; error?: string }

// Never throws. Callers sit on the payment path, where an email problem must
// never surface as a failed purchase — so failure is a value, not an exception.
export async function sendEmail(to: string, email: RenderedEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  try {
    const { data, error } = await new Resend(key).emails.send({
      from: FROM, to, subject: email.subject, html: email.html, text: email.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/email/client.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/email/types.ts lib/email/client.ts lib/email/client.test.ts
git commit -m "feat(email): add the Resend client wrapper"
```

---

### Task 2: The four email templates

**Files:**
- Create: `lib/email/templates/index.ts`
- Test: `lib/email/templates/index.test.ts`

**Interfaces:**
- Consumes: `RenderedEmail` from `lib/email/types.ts` (Task 1). If Task 1 has not landed, create `lib/email/types.ts` with the two exports shown in Shared Interfaces — it is three lines and identical in both tasks.
- Produces: `receiptEmail`, `welcomeEmail`, `expiryWarningEmail`, `winbackEmail`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/email/templates/index.test.ts
import { describe, it, expect } from "vitest";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail } from "./index";

const ENDS = new Date("2026-12-31T15:59:59Z");

describe("templates", () => {
  it("receipt states the amount in pesos and the access end date", () => {
    const e = receiptEmail({ planLabel: "Subject (semester)", amountCentavos: 9900, accessEndsAt: ENDS, returnUrl: "https://x.test/m" });
    expect(e.subject).toContain("₱99");
    expect(e.text).toContain("Subject (semester)");
    expect(e.text).toContain("https://x.test/m");
    expect(e.text).toMatch(/Dec(ember)? 31, 2026/);
  });

  it("every template returns non-empty html and text", () => {
    const all = [
      receiptEmail({ planLabel: "P", amountCentavos: 4900, accessEndsAt: ENDS, returnUrl: "https://x.test/a" }),
      welcomeEmail({ planLabel: "P", returnUrl: "https://x.test/b" }),
      expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c" }),
      winbackEmail({ planLabel: "P", renewUrl: "https://x.test/d" }),
    ];
    for (const e of all) {
      expect(e.subject.length).toBeGreaterThan(0);
      expect(e.html).toContain("<");
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.text).not.toContain("<p>");
    }
  });

  it("expiry warning names the deadline; winback speaks in the past tense", () => {
    expect(expiryWarningEmail({ planLabel: "P", accessEndsAt: ENDS, renewUrl: "https://x.test/c" }).text)
      .toMatch(/Dec(ember)? 31, 2026/);
    expect(winbackEmail({ planLabel: "P", renewUrl: "https://x.test/d" }).text.toLowerCase())
      .toContain("expired");
  });

  it("escapes HTML metacharacters in interpolated values", () => {
    const e = welcomeEmail({ planLabel: `Evil<script>alert(1)</script>`, returnUrl: "https://x.test/b" });
    expect(e.html).not.toContain("<script>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/email/templates/index.test.ts`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/email/templates/index.ts
import type { RenderedEmail } from "../types";

const PH_TZ = "Asia/Manila";

function peso(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function longDate(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: PH_TZ, month: "long", day: "numeric", year: "numeric" });
}

// Values are interpolated into HTML, and planLabel ultimately traces back to
// stored data. Escape rather than trust it.
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function layout(heading: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 16px">${esc(heading)}</h1>
${body}
<p style="margin:24px 0"><a href="${esc(ctaUrl)}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${esc(ctaLabel)}</a></p>
<p style="font-size:12px;color:#666;margin-top:32px">BSIT Survival Kit</p>
</div>`;
}

export function receiptEmail(i: { planLabel: string; amountCentavos: number; accessEndsAt: Date; returnUrl: string }): RenderedEmail {
  const amount = peso(i.amountCentavos), ends = longDate(i.accessEndsAt);
  return {
    subject: `Your ${amount} BSIT Survival Kit receipt`,
    text: `Payment received — thank you.\n\nPlan: ${i.planLabel}\nAmount: ${amount}\nAccess until: ${ends}\n\nPick up where you left off:\n${i.returnUrl}\n\nBSIT Survival Kit`,
    html: layout("Payment received", `<p>Thank you. Here is what you bought:</p>
<table style="font-size:14px;border-collapse:collapse"><tr><td style="padding:4px 16px 4px 0;color:#666">Plan</td><td>${esc(i.planLabel)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#666">Amount</td><td>${esc(amount)}</td></tr>
<tr><td style="padding:4px 16px 4px 0;color:#666">Access until</td><td>${esc(ends)}</td></tr></table>`,
      "Open your reviewers", i.returnUrl),
  };
}

export function welcomeEmail(i: { planLabel: string; returnUrl: string }): RenderedEmail {
  return {
    subject: "You're in — here's how to use it",
    text: `You unlocked ${i.planLabel}.\n\nEvery reviewer now shows its full answer key: worked solutions, code labs, and drills.\n\nStart here:\n${i.returnUrl}\n\nBSIT Survival Kit`,
    html: layout("You're in", `<p>You unlocked <strong>${esc(i.planLabel)}</strong>.</p>
<p>Every reviewer now shows its full answer key — worked solutions, code labs, and drills.</p>`,
      "Start reviewing", i.returnUrl),
  };
}

export function expiryWarningEmail(i: { planLabel: string; accessEndsAt: Date; renewUrl: string }): RenderedEmail {
  const ends = longDate(i.accessEndsAt);
  return {
    subject: `Your access ends ${ends}`,
    text: `Heads up — your ${i.planLabel} access ends on ${ends}.\n\nAfter that the answer keys lock again. Renew here:\n${i.renewUrl}\n\nBSIT Survival Kit`,
    html: layout("Your access is ending", `<p>Your <strong>${esc(i.planLabel)}</strong> access ends on <strong>${esc(ends)}</strong>.</p>
<p>After that the answer keys lock again.</p>`, "Renew access", i.renewUrl),
  };
}

export function winbackEmail(i: { planLabel: string; renewUrl: string }): RenderedEmail {
  return {
    subject: "Your reviewers are locked again",
    text: `Your ${i.planLabel} access has expired, so the answer keys are locked.\n\nEverything you studied is exactly where you left it. Renew here:\n${i.renewUrl}\n\nBSIT Survival Kit`,
    html: layout("Your access expired", `<p>Your <strong>${esc(i.planLabel)}</strong> access has expired, so the answer keys are locked.</p>
<p>Everything you studied is exactly where you left it.</p>`, "Renew access", i.renewUrl),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/email/templates/index.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/email/templates/
git commit -m "feat(email): add the four lifecycle email templates"
```

---

### Task 3: `email_outbox` table

**Files:**
- Create: `supabase/migrations/20260822000000_email_outbox.sql`
- Create: `supabase/migrations/20260822000000_email_outbox.test.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the `email_outbox` table that Task 4 reads and writes.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/20260822000000_email_outbox.sql
-- Durable queue for lifecycle email. Rows are written on the payment path and
-- drained by the daily cron, so a Resend outage delays mail instead of losing
-- it: the webhook is idempotent on paymongo_link_id and its retry returns
-- early, which means an inline-only send has no second chance.
create table if not exists email_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('receipt','welcome','expiry_warning','winback')),
  user_id uuid not null,
  to_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts int not null default 0,
  last_error text,
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- One email of a given kind per scope, ever. scope_key is the subscription or
-- payment the mail is about, so a second cron pass cannot re-enqueue a warning
-- it already queued. This index is what makes "sent once, never repeated" a
-- property of the schema rather than of the cron's arithmetic.
create unique index if not exists email_outbox_kind_scope_key
  on email_outbox (kind, user_id, (payload->>'scope_key'));

-- The drain query: pending rows that are due, oldest first.
create index if not exists email_outbox_pending_due
  on email_outbox (send_after) where status = 'pending';

alter table email_outbox enable row level security;
-- No policies: service-role only. The webhook and cron both use the service
-- client; nothing in the browser may read a queue of email addresses.
```

```markdown
<!-- supabase/migrations/20260822000000_email_outbox.test.md -->
# email_outbox

- Insert two rows with the same (kind, user_id, payload->>'scope_key') → second raises 23505.
- Insert same kind + user_id with a different scope_key → both succeed.
- `select` as anon → zero rows (RLS on, no policies).
- Insert with kind 'bogus' → check constraint violation.
- Insert with status 'bogus' → check constraint violation.
```

- [ ] **Step 2: Apply and verify the unique index actually bites**

Run:
```bash
npx supabase db push
```
Then, in the SQL editor, confirm the second insert fails with `23505`:
```sql
insert into email_outbox (kind, user_id, to_email, payload)
values ('receipt', gen_random_uuid(), 'a@b.test', '{"scope_key":"k1"}'::jsonb);
-- repeat with the SAME user_id → expect duplicate key value violates unique constraint
```
Expected: the second statement errors with `23505`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260822000000_email_outbox.sql supabase/migrations/20260822000000_email_outbox.test.md
git commit -m "feat(email): add the email_outbox queue table"
```

---

### Task 4: Outbox enqueue and drain

**Files:**
- Create: `lib/email/outbox.ts`
- Test: `lib/email/outbox.test.ts`

**Interfaces:**
- Consumes: `sendEmail`, `SendResult` (Task 1); `email_outbox` (Task 3).
- Produces: `enqueue(supabase, input)`, `drain(supabase, limit?)`, `EnqueueInput`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/email/outbox.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendEmail = vi.fn();
vi.mock("@/lib/email/client", () => ({ sendEmail: (...a: unknown[]) => sendEmail(...a) }));
vi.mock("@/lib/email/templates", () => ({
  receiptEmail: () => ({ subject: "r", html: "<p>r</p>", text: "r" }),
  welcomeEmail: () => ({ subject: "w", html: "<p>w</p>", text: "w" }),
  expiryWarningEmail: () => ({ subject: "e", html: "<p>e</p>", text: "e" }),
  winbackEmail: () => ({ subject: "b", html: "<p>b</p>", text: "b" }),
}));

let inserted: Record<string, unknown>[] = [];
let insertError: { code?: string; message: string } | null = null;
let pendingRows: Record<string, unknown>[] = [];
const updates: Record<string, unknown>[] = [];

function mockSupabase() {
  return {
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        if (!insertError) inserted.push(row);
        return Promise.resolve({ error: insertError });
      },
      select: () => ({
        eq: () => ({
          lte: () => ({ order: () => ({ limit: () => Promise.resolve({ data: pendingRows, error: null }) }) }),
        }),
      }),
      update: (patch: Record<string, unknown>) => ({
        eq: (_c: string, id: string) => { updates.push({ id, ...patch }); return Promise.resolve({ error: null }); },
      }),
    }),
  } as never;
}

beforeEach(() => {
  inserted = []; insertError = null; pendingRows = []; updates.length = 0; sendEmail.mockReset();
});

describe("enqueue", () => {
  it("writes a pending row carrying the scope key", async () => {
    const { enqueue } = await import("./outbox");
    const r = await enqueue(mockSupabase(), {
      kind: "receipt", userId: "u1", toEmail: "a@b.test", payload: { planLabel: "P" }, scopeKey: "pay_1",
    });
    expect(r).toEqual({ enqueued: true, deduped: false });
    expect(inserted[0]).toMatchObject({ kind: "receipt", user_id: "u1", to_email: "a@b.test", status: "pending" });
    expect((inserted[0].payload as Record<string, unknown>).scope_key).toBe("pay_1");
  });

  it("treats a unique violation as a dedup, not an error", async () => {
    insertError = { code: "23505", message: "duplicate key" };
    const { enqueue } = await import("./outbox");
    expect(await enqueue(mockSupabase(), {
      kind: "receipt", userId: "u1", toEmail: "a@b.test", payload: {}, scopeKey: "pay_1",
    })).toEqual({ enqueued: false, deduped: true });
  });
});

describe("drain", () => {
  it("marks a row sent when the send succeeds", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 0, payload: {} }];
    sendEmail.mockResolvedValue({ ok: true, id: "abc" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 1, failed: 0 });
    expect(updates[0]).toMatchObject({ id: "e1", status: "sent" });
  });

  it("records the error and increments attempts on failure", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 1, payload: {} }];
    sendEmail.mockResolvedValue({ ok: false, error: "rate limited" });
    const { drain } = await import("./outbox");
    expect(await drain(mockSupabase())).toEqual({ sent: 0, failed: 1 });
    expect(updates[0]).toMatchObject({ id: "e1", status: "pending", attempts: 2, last_error: "rate limited" });
  });

  it("gives up permanently at 5 attempts", async () => {
    pendingRows = [{ id: "e1", kind: "receipt", to_email: "a@b.test", attempts: 4, payload: {} }];
    sendEmail.mockResolvedValue({ ok: false, error: "still down" });
    const { drain } = await import("./outbox");
    await drain(mockSupabase());
    expect(updates[0]).toMatchObject({ id: "e1", status: "failed", attempts: 5 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/email/outbox.test.ts`
Expected: FAIL — cannot resolve `./outbox`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/email/outbox.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/client";
import { receiptEmail, welcomeEmail, expiryWarningEmail, winbackEmail } from "@/lib/email/templates";
import type { EmailKind, RenderedEmail } from "./types";

const MAX_ATTEMPTS = 5;

export interface EnqueueInput {
  kind: EmailKind; userId: string; toEmail: string;
  payload: Record<string, unknown>; scopeKey: string; sendAfter?: Date;
}

// scope_key rides inside payload so the schema's unique index can reach it
// without a dedicated column.
export async function enqueue(
  supabase: SupabaseClient, input: EnqueueInput
): Promise<{ enqueued: boolean; deduped: boolean }> {
  const { error } = await supabase.from("email_outbox").insert({
    kind: input.kind,
    user_id: input.userId,
    to_email: input.toEmail,
    payload: { ...input.payload, scope_key: input.scopeKey },
    status: "pending",
    send_after: (input.sendAfter ?? new Date()).toISOString(),
  });
  if (error) {
    if ((error as { code?: string }).code === "23505") return { enqueued: false, deduped: true };
    throw new Error(error.message);
  }
  return { enqueued: true, deduped: false };
}

function render(kind: EmailKind, p: Record<string, unknown>): RenderedEmail {
  const planLabel = String(p.planLabel ?? "your plan");
  const ends = p.accessEndsAt ? new Date(String(p.accessEndsAt)) : new Date();
  const url = String(p.url ?? "https://survival-kit-app.vercel.app/account");
  switch (kind) {
    case "receipt": return receiptEmail({ planLabel, amountCentavos: Number(p.amountCentavos ?? 0), accessEndsAt: ends, returnUrl: url });
    case "welcome": return welcomeEmail({ planLabel, returnUrl: url });
    case "expiry_warning": return expiryWarningEmail({ planLabel, accessEndsAt: ends, renewUrl: url });
    case "winback": return winbackEmail({ planLabel, renewUrl: url });
  }
}

// Sends every due pending row. Never throws: the cron reports counts, and a
// permanently failing row parks at status 'failed' where it stays queryable.
export async function drain(supabase: SupabaseClient, limit = 50): Promise<{ sent: number; failed: number }> {
  const { data } = await supabase
    .from("email_outbox").select("*")
    .eq("status", "pending")
    .lte("send_after", new Date().toISOString())
    .order("send_after", { ascending: true })
    .limit(limit);

  let sent = 0, failed = 0;
  for (const row of data ?? []) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    const result = await sendEmail(String(row.to_email), render(row.kind as EmailKind, payload));
    const attempts = Number(row.attempts ?? 0) + 1;
    if (result.ok) {
      sent++;
      await supabase.from("email_outbox").update({ status: "sent", attempts, sent_at: new Date().toISOString() }).eq("id", row.id);
    } else {
      failed++;
      await supabase.from("email_outbox").update({
        status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
        attempts, last_error: result.error ?? "unknown",
      }).eq("id", row.id);
    }
  }
  return { sent, failed };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/email/outbox.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/email/outbox.ts lib/email/outbox.test.ts
git commit -m "feat(email): add outbox enqueue and drain"
```

---

### Task 5: Webhook enqueues receipt and welcome

**Files:**
- Modify: `app/api/webhooks/paymongo/route.ts` (the device-subscription branch, after the `recordPayment` try/catch near line 250-270)
- Modify: `app/api/webhooks/paymongo/route.test.ts`

**Interfaces:**
- Consumes: `enqueue` (Task 4); `PLANS`, `resolvePlan`, `periodEndFor` (existing, `lib/paymongo.ts`).
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing test**

Add to `app/api/webhooks/paymongo/route.test.ts`. The critical assertion is the second one — it is the whole reason the outbox exists.

```ts
it("enqueues a receipt and a welcome for a payer with an account", async () => {
  // Arrange a paid link whose remarks carry user:<uuid>, POST it, then:
  expect(enqueueMock.mock.calls.map((c) => c[1].kind).sort()).toEqual(["receipt", "welcome"]);
  expect(enqueueMock.mock.calls[0][1].scopeKey).toBe("link_test_1");
});

it("still returns 200 and grants access when enqueueing throws", async () => {
  enqueueMock.mockRejectedValue(new Error("db is down"));
  const res = await POST(makePaidRequest());
  expect(res.status).toBe(200);
  expect(recorded).toHaveLength(1); // the payment was still recorded
});

it("skips email for a payment with no user_id rather than throwing", async () => {
  const res = await POST(makePaidRequestWithoutUser());
  expect(res.status).toBe(200);
  expect(enqueueMock).not.toHaveBeenCalled();
});
```

Mock the module alongside the existing `vi.mock` calls at the top of the file:

```ts
const enqueueMock = vi.fn().mockResolvedValue({ enqueued: true, deduped: false });
vi.mock("@/lib/email/outbox", () => ({ enqueue: (...a: unknown[]) => enqueueMock(...a) }));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/webhooks/paymongo/route.test.ts`
Expected: FAIL — `enqueueMock` never called.

- [ ] **Step 3: Write minimal implementation**

Insert immediately before the final `return NextResponse.json({ ok: true });` of the device-subscription branch:

```ts
  // Lifecycle email. Wrapped whole: a payment that succeeded must never be
  // reported as failed because mail could not be queued. PayMongo would retry,
  // hit recordPayment's dedupe, and return before ever reaching this block.
  if (userId) {
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      const toEmail = authUser?.user?.email;
      if (toEmail) {
        const accessEndsAt = periodEndFor(plan).toISOString();
        const shared = {
          userId, toEmail, scopeKey: linkId,
          payload: {
            planLabel: PLANS[plan].description.replace("BSIT Survival Kit — ", ""),
            amountCentavos: paidAmount,
            accessEndsAt,
            url: `https://survival-kit-app.vercel.app/account`,
          },
        };
        await enqueue(supabase, { ...shared, kind: "receipt" });
        await enqueue(supabase, { ...shared, kind: "welcome" });
      }
    } catch (err) {
      console.error("Lifecycle email enqueue failed:", err instanceof Error ? err.message : err);
    }
  }
```

Add the import at the top: `import { enqueue } from "@/lib/email/outbox";`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/webhooks/paymongo/route.test.ts`
Expected: PASS, including all pre-existing tests in the file.

- [ ] **Step 5: Commit**

```bash
git add app/api/webhooks/paymongo/route.ts app/api/webhooks/paymongo/route.test.ts
git commit -m "feat(email): enqueue receipt and welcome from the payment webhook"
```

---

### Task 6: Daily cron — drain, expiry warnings, win-back

**Files:**
- Create: `app/api/cron/email/route.ts`
- Create: `app/api/cron/email/route.test.ts`
- Create: `vercel.json`

**Interfaces:**
- Consumes: `enqueue`, `drain` (Task 4).
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing test**

```ts
// app/api/cron/email/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const drainMock = vi.fn().mockResolvedValue({ sent: 0, failed: 0 });
const enqueueMock = vi.fn().mockResolvedValue({ enqueued: true, deduped: false });
vi.mock("@/lib/email/outbox", () => ({
  drain: (...a: unknown[]) => drainMock(...a),
  enqueue: (...a: unknown[]) => enqueueMock(...a),
}));

let subs: Record<string, unknown>[] = [];
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: () => ({ select: () => ({ gte: () => ({ lte: () => Promise.resolve({ data: subs, error: null }) }) }) }),
    auth: { admin: { getUserById: () => Promise.resolve({ data: { user: { email: "a@b.test" } } }) } },
  }),
}));

beforeEach(() => { drainMock.mockClear(); enqueueMock.mockClear(); subs = []; process.env.CRON_SECRET = "s3cret"; });

const authed = () => new Request("http://x/api/cron/email", { headers: { authorization: "Bearer s3cret" } });

describe("GET /api/cron/email", () => {
  it("rejects an unauthenticated caller", async () => {
    const { GET } = await import("./route");
    expect((await GET(new Request("http://x/api/cron/email"))).status).toBe(401);
    expect(drainMock).not.toHaveBeenCalled();
  });

  it("drains the outbox when authenticated", async () => {
    const { GET } = await import("./route");
    expect((await GET(authed())).status).toBe(200);
    expect(drainMock).toHaveBeenCalled();
  });

  it("enqueues an expiry warning for a subscription ending in 4 days", async () => {
    const end = new Date(Date.now() + 4 * 864e5);
    subs = [{ id: "s1", user_id: "u1", subject_id: null, current_period_end: end.toISOString() }];
    const { GET } = await import("./route");
    await GET(authed());
    const kinds = enqueueMock.mock.calls.map((c) => c[1].kind);
    expect(kinds).toContain("expiry_warning");
    expect(enqueueMock.mock.calls[0][1].scopeKey).toBe("s1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/cron/email/route.test.ts`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 3: Write minimal implementation**

```ts
// app/api/cron/email/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { drain, enqueue } from "@/lib/email/outbox";

export const runtime = "nodejs";

const DAY = 24 * 60 * 60 * 1000;
const WARN_DAYS = 4;    // spec: 4 days before period end
const WINBACK_DAYS = 3; // spec: 3 days after expiry

// Scans a one-day window around each target so a once-daily cron cannot skip a
// subscription by landing a few hours off. The outbox's unique index on
// (kind, user_id, scope_key) is what keeps an overlapping window from sending twice.
async function scan(
  supabase: ReturnType<typeof createServerClient>,
  kind: "expiry_warning" | "winback",
  offsetMs: number,
) {
  const target = Date.now() + offsetMs;
  const { data } = await supabase
    .from("subscriptions").select("id, user_id, subject_id, current_period_end")
    .gte("current_period_end", new Date(target - DAY / 2).toISOString())
    .lte("current_period_end", new Date(target + DAY / 2).toISOString());

  let queued = 0;
  for (const sub of data ?? []) {
    if (!sub.user_id) continue;
    const { data: authUser } = await supabase.auth.admin.getUserById(String(sub.user_id));
    const toEmail = authUser?.user?.email;
    if (!toEmail) continue;
    try {
      const r = await enqueue(supabase, {
        kind, userId: String(sub.user_id), toEmail, scopeKey: String(sub.id),
        payload: {
          planLabel: sub.subject_id ? "Subject access" : "All subjects",
          accessEndsAt: sub.current_period_end,
          url: "https://survival-kit-app.vercel.app/account",
        },
      });
      if (r.enqueued) queued++;
    } catch (err) {
      console.error(`${kind} enqueue failed for ${sub.id}:`, err instanceof Error ? err.message : err);
    }
  }
  return queued;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServerClient();
  const warned = await scan(supabase, "expiry_warning", WARN_DAYS * DAY);
  const winback = await scan(supabase, "winback", -WINBACK_DAYS * DAY);
  const drained = await drain(supabase);
  return NextResponse.json({ ok: true, warned, winback, ...drained });
}
```

```json
{
  "crons": [{ "path": "/api/cron/email", "schedule": "0 1 * * *" }]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/cron/email/route.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/email/ vercel.json
git commit -m "feat(email): add the daily lifecycle email cron"
```

---

### Task 7: Require sign-in before checkout

**Files:**
- Modify: `app/api/subscribe/route.ts` (after `const userId = await getCurrentUserId();`, ~line 80)
- Modify: `app/api/subscribe/route.test.ts`
- Modify: `app/(main)/unlock/page.tsx` (CTA when signed out)

**Interfaces:**
- Consumes: `getCurrentUserId` (existing, `lib/auth/currentUser.ts`).
- Produces: nothing downstream.

- [ ] **Step 1: Write the failing test**

```ts
it("refuses to create a payment link for a signed-out caller", async () => {
  getCurrentUserIdMock.mockResolvedValue(null);
  const res = await POST(makeSubscribeRequest({ yearId: YEAR, deviceId: DEVICE }));
  expect(res.status).toBe(401);
  expect(await res.json()).toMatchObject({ error: expect.stringContaining("sign in") });
  expect(createPaymongoLinkMock).not.toHaveBeenCalled();
});

it("creates the link for a signed-in caller", async () => {
  getCurrentUserIdMock.mockResolvedValue("11111111-1111-1111-1111-111111111111");
  const res = await POST(makeSubscribeRequest({ yearId: YEAR, deviceId: DEVICE }));
  expect(res.status).toBe(200);
  expect(createPaymongoLinkMock).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/api/subscribe/route.test.ts`
Expected: FAIL — signed-out request returns 200, not 401.

- [ ] **Step 3: Write minimal implementation**

Immediately after `const userId = await getCurrentUserId();`:

```ts
  // An account is required to buy. Without one there is no email address, so a
  // payer would get no receipt and no expiry warning — and their purchase would
  // be stranded on a single device with no way to recover it.
  if (!userId) {
    return NextResponse.json(
      { error: "Please sign in to continue — we'll email your receipt and keep your unlock on every device." },
      { status: 401 }
    );
  }
```

Then in `app/(main)/unlock/page.tsx`, when there is no current user, render a sign-in link in place of the buy CTA, carrying the return path:

```tsx
<Link href={`/login?next=${encodeURIComponent(returnHref)}`}>
  Sign in to unlock
</Link>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/api/subscribe/route.test.ts`
Expected: PASS. Fix any pre-existing test in the file that assumed anonymous checkout by giving it a signed-in user.

- [ ] **Step 5: Commit**

```bash
git add app/api/subscribe/route.ts app/api/subscribe/route.test.ts "app/(main)/unlock/page.tsx"
git commit -m "feat(checkout): require sign-in before creating a payment link"
```

---

### Task 8: Full verification

- [ ] **Step 1: Whole suite**

Run: `npm test`
Expected: PASS. Baseline before this work was ~698 tests; the new files add roughly 20.

- [ ] **Step 2: Types and lint**

Run: `npm run typecheck && npm run lint`
Expected: both clean.

- [ ] **Step 3: Confirm the environment**

```bash
vercel env ls | grep -i resend
```
Expected: `RESEND_API_KEY` present. Also confirm `CRON_SECRET` is set — Task 6's route returns 401 for every caller without it, which would silently disable all scheduled mail.

- [ ] **Step 4: Commit any fixes**

```bash
git commit -am "test: fix fallout from the lifecycle email work"
```

## Deferred — needs the user, not an agent

1. `vercel integration add resend/resend-email --no-claim` — interactive on CLI 58.5.1.
2. Verify `mail.lawrenceigen.me` in the Resend dashboard and add the DKIM/SPF records (domain is on Vercel nameservers).
3. Confirm the Vercel plan tier. Hobby allows one cron per day, which this design tolerates; the CLI returned `plan: None`.
