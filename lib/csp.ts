// Content-Security-Policy pieces shared by proxy.ts (per-request nonce policy,
// buildCsp) and next.config.ts (nonce-free policy for prerendered public pages).
//
// Kept free of Node-only imports: proxy.ts bundles this, and next.config.ts
// imports it by relative path.

// First visit follows the device's dark-mode setting; an explicit toggle
// choice (stored under 'theme') always wins afterwards. localStorage can throw
// in private browsing — fall back to system.
//
// Rendered verbatim by app/layout.tsx. It carries no nonce: the root layout
// must not read request headers, or every route opts out of static rendering.
// The nonce policy allows it by hash instead, and lib/csp.test.ts recomputes
// that hash from this exact string, so editing one without the other fails CI.
export const THEME_BOOTSTRAP_SCRIPT =
  "(function(){var t=null;try{t=localStorage.getItem('theme');}catch(e){}var dark=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark){document.documentElement.classList.add('dark');}})();";

export const THEME_BOOTSTRAP_SHA256 = "sha256-w8wUPGvJh3XL0V6VFAUUvrFeIoUzmehluKNr7P8iVMU=";

// Public, identical-for-everyone content pages that are prerendered (static or
// ISR) and cached at the CDN. They can't carry a per-request nonce, so they get
// STATIC_CSP from next.config.ts and proxy.ts never runs on them (see its
// matcher). Every other page route keeps the per-request nonce policy and
// must render dynamically.
//
// `prefix: true` covers the path and everything below it.
export const STATIC_CSP_ROUTES: ReadonlyArray<{ path: string; prefix: boolean }> = [
  { path: "/", prefix: false },
  { path: "/faq", prefix: false },
  { path: "/privacy", prefix: false },
  { path: "/resources", prefix: false },
  { path: "/search", prefix: false },
  { path: "/for-blocks", prefix: false },
  { path: "/year", prefix: true },
];

export function isStaticCspPath(pathname: string): boolean {
  return STATIC_CSP_ROUTES.some(
    ({ path, prefix }) => pathname === path || (prefix && pathname.startsWith(path + "/")),
  );
}

// Routes proxy runs on whose HTML is rendered per request, so Next.js can
// stamp proxy's nonce on every script. One pattern per page in app/ outside
// STATIC_CSP_ROUTES, plus the API surface. lib/csp.test.ts walks app/ and
// fails if a page is missing here.
//
// Any other path proxy sees is a 404, and the root 404 is the prerendered,
// CDN-cached /_not-found page: its scripts carry no nonce, so under the
// nonce policy ('strict-dynamic' ignores 'self') none of them run and the
// page never hydrates (QA CR-02). Those responses get buildStaticCsp instead.
// A page missing from this list still works, just under the static policy.
const NONCE_PAGE_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/api(?:\/|$)/,
  /^\/(?:login|signup|playground|unlock)$/,
  /^\/account(?:\/(?:profile|roadmap))?$/,
  /^\/admin(?:\/(?:login|feedback))?$/,
  /^\/class\/[^/]+\/(?:join|rep)$/,
  /^\/quiz\/subject\/[^/]+$/,
];

/** True when proxy should send the per-request nonce policy for this path. */
export function usesNonceCsp(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return NONCE_PAGE_PATTERNS.some((re) => re.test(path));
}

// Every directive except script-src/script-src-attr matches buildCsp in
// proxy.ts (lib/csp.test.ts asserts they stay identical). The nonce policy is
// spelled out in proxy.ts itself because lib/reports/securityBaseline.ts
// checks that file for the nonce and frame-ancestors controls.
const NON_SCRIPT_DIRECTIVES = [
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "font-src 'self' https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net https://sql.js.org https://*.google-analytics.com",
  "img-src 'self' data: https://*.google-analytics.com",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// Policy for STATIC_CSP_ROUTES. A prerendered page is the same bytes for every
// visitor, so it cannot carry a nonce, and Next.js streams the page's RSC
// payload as inline <script>self.__next_f.push(...)</script> elements whose
// contents change on every ISR regeneration — no fixed hash list can cover
// them. Inline <script> ELEMENTS therefore have to be allowed here.
//
// What still holds, compared with the nonce policy:
// - script-src-attr 'none' blocks inline event handlers (onerror=, onclick=)
//   — the usual payload when markup is injected through innerHTML, which
//   never executes injected <script> elements anyway.
// - No 'strict-dynamic': scripts load only from 'self' and GA's host, so an
//   injected <script src="https://evil.example/..."> is still blocked.
// - object-src, frame-ancestors, base-uri and form-action are unchanged.
// - These pages reflect no request input into HTML (no cookies, headers or
//   searchParams during render), so there is no reflected-XSS path; their
//   content is admin-authored and rendered through React/react-markdown,
//   which escape HTML.
export function buildStaticCsp(isDev = process.env.NODE_ENV !== "production"): string {
  const devEval = isDev ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${devEval} https://www.googletagmanager.com`,
    "script-src-attr 'none'",
    ...NON_SCRIPT_DIRECTIVES,
  ].join("; ");
}
