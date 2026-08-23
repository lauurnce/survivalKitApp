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
      { label: "expected mode derived from env", pattern: /getExpectedLivemode/ },
      { label: "mismatch compared", pattern: /livemode\s*!==\s*expectedLivemode/ },
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
