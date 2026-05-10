import type { NextConfig } from "next";
import { STATIC_CSP_ROUTES, buildStaticCsp } from "./lib/csp";

// Content-Security-Policy comes from two places:
// - Prerendered public pages (STATIC_CSP_ROUTES in lib/csp.ts) get the
//   nonce-free policy below. proxy.ts's matcher skips them entirely, so this is
//   the only CSP they ever receive.
// - Every other route gets a per-request nonce policy from proxy.ts (a value
//   that changes every request, which this static config can't produce).
// /pyodideWorker.js is the one path that keeps its own CSP here (see
// pyodideWorkerHeaders) — proxy deliberately leaves it alone so this narrower,
// eval-permitting policy stays authoritative there.
const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "Referrer-Policy",           value: "no-referrer" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

// The Pyodide worker compiles/executes WASM and, on Safari (no 'wasm-unsafe-eval'
// support), needs full 'unsafe-eval'. Scope that looser allowance to the worker
// script alone so the eval capability never extends to any page document.
const pyodideWorkerHeaders = [
  ...securityHeaders.filter((h) => h.key !== "Content-Security-Policy"),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",
      "connect-src 'self' https://cdn.jsdelivr.net",
      "worker-src 'self' blob:",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Stop leaking "X-Powered-By: Next.js" on every response — free framework
  // fingerprinting for an attacker with no benefit to us.
  poweredByHeader: false,
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/auth-js"],
  // The share-card OG route reads these at runtime with fs — without this,
  // Vercel's output tracing would omit them and the route 500s in prod only.
  outputFileTracingIncludes: {
    "/api/card/progress": ["./assets/fonts/**/*"],
  },
  async headers() {
    return [
      // Worker-specific CSP must come first so its Content-Security-Policy wins
      // for /pyodideWorker.js (Next.js merges header rules; the more specific
      // source is listed ahead of the catch-all).
      {
        source: "/pyodideWorker.js",
        headers: pyodideWorkerHeaders,
      },
      ...STATIC_CSP_ROUTES.flatMap(({ path, prefix }) =>
        (prefix ? [path, `${path}/:path*`] : [path]).map((source) => ({
          source,
          headers: [{ key: "Content-Security-Policy", value: buildStaticCsp() }],
        })),
      ),
      {
        // Exclude /pyodideWorker.js so the global CSP does not override the
        // worker-scoped one (Next.js lets a later matching rule win for a
        // duplicate header key).
        source: "/((?!pyodideWorker\\.js).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
