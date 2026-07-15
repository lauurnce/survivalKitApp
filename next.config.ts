import type { NextConfig } from "next";

// Content-Security-Policy is NOT set here for normal page routes — middleware.ts
// generates a fresh per-request nonce and sets script-src there (nonce-based CSP
// requires a value that changes every request, which this static config can't
// produce). Next.js gives a middleware-set header priority over a matching
// next.config.ts header, so leaving CSP out of securityHeaders below avoids two
// conflicting policies landing on the same response. /pyodideWorker.js is the
// one path that keeps its CSP here (see pyodideWorkerHeaders) — middleware
// deliberately excludes it from its own CSP so this narrower, eval-permitting
// policy stays authoritative there.
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
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/auth-js", "@vercel/sandbox"],
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
