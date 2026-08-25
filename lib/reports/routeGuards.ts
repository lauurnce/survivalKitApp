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
  { kind: "validation", label: "isValid helper", pattern: /\bisValid[A-Za-z]*\s*\(/ },
  {
    kind: "validation",
    label: "normalizeClassCode",
    pattern: /\bnormalizeClassCode\s*\(/,
  },
  {
    kind: "validation",
    label: "constant allowlist membership",
    pattern: /\b[A-Z][A-Z0-9_]{2,}\.includes\s*\(/,
  },
  { kind: "validation", label: "typeof guard", pattern: /typeof\s+[\w.[\]]+\s*!==\s*["']\w+["']/ },
  { kind: "validation", label: "allowlist set", pattern: /\b[A-Z_]*(VALID|ALLOWED)[A-Z_]*\b/ },
  {
    kind: "validation",
    label: "guarded body parse",
    pattern: /await\s+req\.json\(\)[\s\S]{0,200}status:\s*400/,
  },
  {
    kind: "validation",
    label: "value-domain guard rejects input",
    pattern: /[\w.]+\s*!==\s*["'][a-z_]+["'][\s\S]{0,120}status:\s*400/,
  },

  { kind: "signature", label: "verifyPaymongoWebhook", pattern: /\bverifyPaymongoWebhook\s*\(/ },
  {
    kind: "signature",
    label: "CRON_SECRET bearer check",
    pattern: /CRON_SECRET/,
  },
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
  "/api/cron/email": { auth: ["signature"], rateLimit: false, validation: false, note: "Triggered by the platform scheduler and authenticated by a fail-closed CRON_SECRET bearer check rather than a session; there is no client input to validate." },
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
// Wide enough for "per-instance", the longest value the RATE column carries —
// a narrower cell pushes that row past the rule and breaks the table's
// alignment for exactly the rows a reader is most likely to compare.
const CELL_WIDTH = 12;
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
