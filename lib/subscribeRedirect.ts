import { isUuid } from "./validation";

interface BuildSuccessUrlParams {
  origin: string;
  yearId: string;
  subjectId: string | null;
  returnPath?: string | null;
}

interface ModuleRoute {
  yearId: string;
  subjectId: string;
  moduleId: string;
}

// Split a candidate path into module-route parts, or null if it isn't one.
// Anything with a query, fragment, backslash, extra segment, or non-UUID id
// fails here — this shape check is the whole open-redirect defense, so it
// stays deliberately strict and character-exact.
//
// Shape only: it cannot tell whether the module actually lives under the
// subject in the path. Callers with a database handy must check that too.
export function parseModuleRoute(path: unknown): ModuleRoute | null {
  if (typeof path !== "string") return null;

  // Expect exactly: ["", "year", <uuid>, "subjects", <uuid>, "modules", <uuid>]
  const parts = path.split("/");
  if (parts.length !== 7) return null;
  const [empty, yearKw, pathYear, subjectsKw, pathSubject, modulesKw, pathModule] = parts;
  if (empty !== "" || yearKw !== "year" || subjectsKw !== "subjects" || modulesKw !== "modules") {
    return null;
  }
  if (!isUuid(pathYear) || !isUuid(pathSubject) || !isUuid(pathModule)) return null;

  return { yearId: pathYear, subjectId: pathSubject, moduleId: pathModule };
}

// The one place the module-route template is written. It lives beside
// parseModuleRoute on purpose: a builder that drifts from the validator sends
// every payer to /account instead of back to the reviewer they just bought.
export function modulePath(yearId: string, subjectId: string, moduleId: string): string {
  return `/year/${yearId}/subjects/${subjectId}/modules/${moduleId}`;
}

// Build the post-payment redirect URL. Returns the exact module page the payer
// came from (so the locked reviewers there can auto-poll and unlock in place),
// but ONLY if returnPath is a well-formed module route whose year/subject match
// the plan being purchased. Anything else falls back to the subjects list. This
// prevents open-redirects and stops a payer from returning to content they did
// not pay for. The ?payment=success marker is what triggers the unlock poll.
export function buildSuccessUrl({
  origin,
  yearId,
  subjectId,
  returnPath,
}: BuildSuccessUrlParams): string {
  const fallback = `${origin}/account?payment=success`;
  const route = parseModuleRoute(returnPath);
  if (!route) return fallback;

  // Year must match the purchased plan.
  if (route.yearId !== yearId) return fallback;
  // For a subject plan, the subject must match too. (Year plans unlock the whole
  // year, so any subject under the matching year is fine.)
  if (subjectId !== null && route.subjectId !== subjectId) return fallback;

  return `${origin}${returnPath}?payment=success`;
}

// Mirror of buildSuccessUrl for the cancelled/failed leg of PayMongo's
// redirect: same validation, same /account fallback, but deliberately WITHOUT
// the ?payment=success marker so a cancelled payment can never trip the
// module pages' unlock poll or the success banners.
export function buildFailedUrl({
  origin,
  yearId,
  subjectId,
  returnPath,
}: BuildSuccessUrlParams): string {
  const fallback = `${origin}/account`;
  const route = parseModuleRoute(returnPath);
  if (!route) return fallback;

  // Year must match the purchased plan.
  if (route.yearId !== yearId) return fallback;
  if (subjectId !== null && route.subjectId !== subjectId) return fallback;

  return `${origin}${returnPath}`;
}

// Vet the /unlock page's `from` query param before it becomes the checkout's
// returnPath. `from` arrives straight off the URL, so it must be a relative,
// same-origin module route for the very year and subject the page is selling —
// otherwise the caller falls back and buildSuccessUrl never sees it.
export function safeReturnPath(
  from: unknown,
  yearId: string,
  subjectId: string
): string | null {
  const route = parseModuleRoute(from);
  if (!route) return null;
  if (route.yearId !== yearId || route.subjectId !== subjectId) return null;
  return from as string;
}

interface BuildUnlockHrefParams {
  yearId: string;
  subjectId: string;
  /** The module path the reader is leaving, so payment can return them there. */
  from?: string | null;
}

// The single link into the pricing page. Every paywall CTA goes through here so
// /unlock always knows what it is selling and where to send the payer back to.
export function buildUnlockHref({ yearId, subjectId, from }: BuildUnlockHrefParams): string {
  const params = new URLSearchParams({ year: yearId, subject: subjectId });
  if (from) params.set("from", from);
  return `/unlock?${params.toString()}`;
}
