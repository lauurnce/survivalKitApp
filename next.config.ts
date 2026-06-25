import type { NextConfig } from "next";

// Next.js dev mode (react-refresh / HMR) evaluates code via eval(), which the
// hardened production CSP forbids. Allow 'unsafe-eval' ONLY in development so
// the dev server hydrates; production keeps the strict policy (no eval).
const isDev = process.env.NODE_ENV !== "production";
const devEval = isDev ? " 'unsafe-eval'" : "";

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
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'wasm-unsafe-eval' permits WebAssembly compilation (Pyodide, sql.js) WITHOUT
      // enabling JavaScript eval()/new Function(). 'unsafe-eval' is intentionally NOT
      // here — the only code that still needs it (the Pyodide worker on Safari, which
      // lacks wasm-unsafe-eval support) gets a narrowly-scoped policy on
      // /pyodideWorker.js below, so no page document permits JS eval.
      `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${devEval} https://cdn.jsdelivr.net`,
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "font-src 'self' https://cdn.jsdelivr.net",
      // Pyodide runs in a Web Worker; sql.js loads its wasm from its CDN.
      "worker-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net https://sql.js.org",
      "img-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
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
