import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

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
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

// Middleware runs in Edge Runtime — use Web Crypto API (not Node's crypto module)
async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || !token) return false;

    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;

    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const keyBytes = new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // base64url → base64 → bytes
    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      new TextEncoder().encode(payload),
    );
    if (!isValid) return false;

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof decoded.exp === "number" && Date.now() < decoded.exp;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
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

  // Refresh the Supabase auth session cookie on every request.
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

  const { pathname } = req.nextUrl;

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
