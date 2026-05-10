import { connection } from "next/server";

// Pass-through layout that pins a segment to request-time rendering.
//
// Every page outside STATIC_CSP_ROUTES (lib/csp.ts) is served the per-request
// nonce CSP by proxy.ts. Next.js can only stamp that nonce onto its scripts
// while rendering a request, so a prerendered page there would ship scripts
// without it and every one of them would be blocked. Client-component pages
// can't export `dynamic`, so their segments mount this layout instead.
export async function RequestTimeLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return <>{children}</>;
}
