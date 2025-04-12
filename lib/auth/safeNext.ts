// Where to send someone after they sign up or log in.
//
// `next` arrives from the query string (/signup?next=…) and from a hidden form
// field, so it is attacker-controlled. Only a same-origin, relative path is
// ever honoured; anything else falls back to the account page. Query string
// and hash are kept, so a return like "/year/…/modules/…?print=1" survives.

export const DEFAULT_NEXT = "/account";

// Placeholder origin used only to let the URL parser resolve the path the way
// a browser would. Never emitted.
const BASE = "https://next.invalid";

// The auth pages themselves are never a useful destination: sending a freshly
// signed-in student back to /login just shows them the form again.
const AUTH_PATHS = new Set(["/login", "/signup"]);

const MAX_LENGTH = 2048;

function isUnsafeShape(v: string): boolean {
  // "//host" is protocol-relative; "/\host" is read as "//host" by browsers,
  // which treat a backslash as a slash in http(s) URLs. Backslashes and
  // whitespace/control characters are rejected anywhere: browsers strip tabs
  // and newlines from URLs, so "/\t/evil.com" would become "//evil.com".
  return (
    !v.startsWith("/") ||
    v.startsWith("//") ||
    v.includes("\\") ||
    /[\u0000- \u007f]/.test(v)
  );
}

/** Repeatedly percent-decode (bounded) so "/%2F%2Fevil.com" and doubly
 *  encoded forms are judged by what they could eventually become. */
function decodeFully(v: string): string | null {
  let current = v;
  for (let i = 0; i < 3; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      return null; // malformed escape: refuse rather than guess
    }
    if (decoded === current) return current;
    current = decoded;
  }
  return current;
}

/**
 * A safe internal return path, or `fallback` (default "/account").
 * Accepts the raw value from FormData or searchParams.
 */
export function safeNextPath(raw: unknown, fallback: string = DEFAULT_NEXT): string {
  if (typeof raw !== "string") return fallback;
  const v = raw;
  if (!v || v.length > MAX_LENGTH || v === "null" || v === "undefined") return fallback;
  if (isUnsafeShape(v)) return fallback;

  let url: URL;
  try {
    url = new URL(v, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;

  // Judge the path by what it decodes to as well, so "/%2F%2Fevil.com",
  // "/%5Cevil.com" and doubly-encoded forms are refused even though a
  // well-behaved browser would keep them on this origin — a proxy or a later
  // decode step might not. Only the path: an encoded space in a query value
  // is ordinary.
  const decodedPath = decodeFully(url.pathname);
  if (decodedPath === null || isUnsafeShape(decodedPath)) return fallback;
  if (AUTH_PATHS.has(url.pathname)) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

/** Same check for a searchParams value, which may be repeated (string[]). */
export function safeNextParam(raw: string | string[] | undefined, fallback: string = DEFAULT_NEXT): string {
  return safeNextPath(Array.isArray(raw) ? raw[0] : raw, fallback);
}

const ADMIN_HOME = "/admin";

/**
 * Where to send the admin after logging in: a safe internal path inside
 * /admin (QA GT-21), else the admin home. The login page itself is never a
 * destination.
 */
export function safeAdminNext(raw: string | string[] | undefined): string {
  const path = safeNextParam(raw, ADMIN_HOME);
  const pathname = path.split(/[?#]/, 1)[0];
  const inAdmin = pathname === ADMIN_HOME || pathname.startsWith(`${ADMIN_HOME}/`);
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  return inAdmin && !isLogin ? path : ADMIN_HOME;
}
