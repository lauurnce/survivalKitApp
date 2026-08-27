import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { signingSecretCandidates } from "@/lib/auth/signingSecrets";

// Nonce-based CSP for scripts: 'unsafe-inline' on script-src would defeat most
// of CSP's XSS value (any injected <script> would execute freely). A fresh
// nonce per request lets the one legitimate inline script (the dark-mode
// bootstrap in app/layout.tsx) run while nothing else can. style-src keeps
// 'unsafe-inline' — React's style={{}} prop compiles to inline style
// attributes with no nonce support, and CSS-only injection is a much
// narrower attack surface than script injection.
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const devEval = isDev ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    // 'wasm-unsafe-eval' permits WebAssembly compilation (Pyodide, sql.js)
    // WITHOUT enabling JS eval()/new Function(). The Pyodide worker itself
    // gets a separate, narrowly-scoped CSP in next.config.ts.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${devEval} https://cdn.jsdelivr.net`,
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "font-src 'self' https://cdn.jsdelivr.net",
    "worker-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co https://cdn.jsdelivr.net https://sql.js.org",
    "img-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

// The proxy (formerly middleware.ts) runs in the Edge runtime — use Web Crypto
// API (not Node's crypto module)
async function hmacValid(
  secret: string,
  payload: string,
  sigBytes: BufferSource,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payload),
  );
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    // Fail closed on a short or missing primary before anything else runs.
    // The shared resolver below enforces the same floor on every candidate
    // (including any *_PREVIOUS), but this explicit check keeps the
    // proxy-side guarantee independent of exception handling (PR #14).
    const primary = process.env.ADMIN_SESSION_SECRET;
    if (!primary || primary.length < 32 || !token) return false;

    // Primary first; during a rotation window the previous secret is the
    // fallback that keeps existing sessions valid (see lib/auth/signingSecrets).
    const candidates = signingSecretCandidates(
      "ADMIN_SESSION_SECRET",
      "ADMIN_SESSION_SECRET_PREVIOUS",
    );

    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;

    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    // base64url → base64 → bytes
    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    let isValid = false;
    for (const secret of candidates) {
      if (await hmacValid(secret, payload, sigBytes)) {
        isValid = true;
        break;
      }
    }
    if (!isValid) return false;

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decoded.exp === "number" && Date.now() < decoded.exp;
  } catch {
    return false;
  }
}

// Public routes that don't need auth session refresh — skipping getUser() saves ~200-400ms
const PUBLIC_PATH_PREFIXES = [
  "/",
  "/year",
  "/search",
  "/playground",
  "/privacy",
  "/for-blocks",
  "/unlock", // unlock page handles its own subscription check
  "/api/card/progress", // OG card endpoint — public, no auth
  "/api/quiz", // quiz API handles its own auth
  "/api/quiz/", // quiz API handles its own auth
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function proxy(req: NextRequest) {
  // Web Crypto (Edge Runtime) — 16 random bytes, base64-encoded, per request.
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));

  // Forward the nonce as a request header so Server Components (layout.tsx)
  // can read it via next/headers and stamp it onto the inline script tag.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-csp-nonce", nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // /pyodideWorker.js keeps its own narrowly-scoped, eval-permitting CSP set
  // in next.config.ts (needed for Safari's lack of 'wasm-unsafe-eval' support)
  // — don't overwrite it with the nonce-based page policy.
  if (req.nextUrl.pathname !== "/pyodideWorker.js") {
    res.headers.set("Content-Security-Policy", buildCsp(nonce));
  }

  const { pathname } = req.nextUrl;

  // Skip auth session refresh on public routes — saves ~200-400ms per request
  if (!isPublicPath(pathname)) {
    // Refresh the Supabase auth session cookie on protected requests.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (toSet) =>
            toSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options),
            ),
        },
      },
    );
    await supabase.auth.getUser();
  }

  // Guard all /admin routes except the login page itself
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("admin_session")?.value ?? "";
    const valid = await verifyAdminToken(token);
    if (!valid) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Defense-in-depth for the admin API surface: each /api/admin/* route
  // already calls getAdminSession() itself, so this isn't currently a live
  // bypass — but it means a future route added without remembering that
  // check would be silently unauthenticated with no safety net at this
  // layer. /login (issues the session) and /logout (must work even with an
  // expired/invalid session, to let the cookie be cleared) are exempt.
  const isAdminApi =
    pathname.startsWith("/api/admin") &&
    pathname !== "/api/admin/login" &&
    pathname !== "/api/admin/logout";
  if (isAdminApi) {
    const token = req.cookies.get("admin_session")?.value ?? "";
    const valid = await verifyAdminToken(token);
    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
