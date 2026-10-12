// The one place the app's public origin is decided.
//
// Production answers on two hosts: the custom domain (canonical) and the
// original *.vercel.app host. Anything that is read later, out of the request's
// context — emails, sitemap, robots, metadataBase, the share card — uses the
// canonical origin. Anything that sends the visitor straight back to us in the
// same browser session — PayMongo success/cancel redirects — must land on the
// host they came from, because the device cookie and Supabase session are
// host-scoped: a payer bounced from tryi2i.com to vercel.app arrives with no
// cookie and sees a locked page they just paid for.

export const DEFAULT_APP_ORIGIN = "https://tryi2i.com";

// The original deployment host. Still serves production and still has live
// links pointing at it, so checkout from it must keep working.
export const VERCEL_APP_ORIGIN = "https://survival-kit-app.vercel.app";

const PRODUCTION_ORIGINS = [
  DEFAULT_APP_ORIGIN,
  // Resolves, but 307s to the apex today. Allowed so a request that does
  // originate there returns to the same host rather than being bounced.
  "https://www.tryi2i.com",
  VERCEL_APP_ORIGIN,
];

const DEVELOPMENT_ORIGINS = ["http://localhost:3000"];

// Normalise to a bare origin (scheme + host + port), or null if unusable.
function toOrigin(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * The canonical public origin, without a trailing slash. Overridable with
 * NEXT_PUBLIC_APP_ORIGIN (an invalid value is ignored, not trusted).
 */
export function canonicalOrigin(): string {
  return toOrigin(process.env.NEXT_PUBLIC_APP_ORIGIN) ?? DEFAULT_APP_ORIGIN;
}

/** Origins allowed to start a checkout and receive its redirects. */
export function allowedOrigins(): ReadonlySet<string> {
  const set = new Set<string>([canonicalOrigin(), ...PRODUCTION_ORIGINS]);
  if (process.env.NODE_ENV !== "production") {
    for (const o of DEVELOPMENT_ORIGINS) set.add(o);
  }
  return set;
}

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  return typeof origin === "string" && allowedOrigins().has(origin);
}

/**
 * The request's own origin when it is allowlisted, else the canonical one.
 * Pass the raw `Origin` header; it is compared exactly, never parsed leniently,
 * so a look-alike host can never become a redirect target.
 */
export function resolveRequestOrigin(requestOrigin: string | null | undefined): string {
  return isAllowedOrigin(requestOrigin) ? (requestOrigin as string) : canonicalOrigin();
}

/** Absolute URL on the canonical origin for an app path like "/account". */
export function canonicalUrl(path: string): string {
  return `${canonicalOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
