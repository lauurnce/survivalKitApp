"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Who is reading, resolved in the browser. Public pages are prerendered and
// identical for every visitor, so they can't read the session during render;
// the bits that depend on it (TopBar's account link, the dashboard nav rail,
// log out) ask /api/me after hydration instead.

export interface SessionInfo {
  /** False until /api/me answers — render the signed-out variant meanwhile. */
  ready: boolean;
  signedIn: boolean;
  /** The reader's own user id (for forms that attribute to it), else null. */
  userId: string | null;
  /** Dashboard progress for the nav rail; zero unless requested and signed in. */
  overallDone: number;
  overallTotal: number;
}

const SIGNED_OUT: SessionInfo = { ready: false, signedIn: false, userId: null, overallDone: 0, overallTotal: 0 };

interface MeResponse {
  signedIn?: boolean;
  userId?: string | null;
  overview?: { overallDone: number; overallTotal: number } | null;
}

// One request per (url, pathname): every consumer on a page shares it, and a
// client-side navigation (e.g. the redirect after signing in or out) asks again.
const inflight = new Map<string, Promise<SessionInfo>>();

function load(url: string, pathname: string): Promise<SessionInfo> {
  const key = `${url}|${pathname}`;
  let promise = inflight.get(key);
  if (!promise) {
    promise = fetch(url, { credentials: "same-origin", cache: "no-store" })
      .then((res): Promise<MeResponse> | MeResponse => (res.ok ? (res.json() as Promise<MeResponse>) : {}))
      .catch((): MeResponse => ({}))
      .then((data: MeResponse) => ({
        ready: true,
        signedIn: data.signedIn === true,
        userId: data.signedIn === true ? (data.userId ?? null) : null,
        overallDone: data.overview?.overallDone ?? 0,
        overallTotal: data.overview?.overallTotal ?? 0,
      }));
    // Keep only the latest navigation's answer per url.
    for (const k of inflight.keys()) if (k.startsWith(`${url}|`)) inflight.delete(k);
    inflight.set(key, promise);
  }
  return promise;
}

/** Test hook: forget every cached answer. */
export function resetSessionCache() {
  inflight.clear();
}

export function useSession({ overview = false }: { overview?: boolean } = {}): SessionInfo {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionInfo>(SIGNED_OUT);

  useEffect(() => {
    let cancelled = false;
    void load(overview ? "/api/me?overview=1" : "/api/me", pathname ?? "").then((s) => {
      if (!cancelled) setSession(s);
    });
    return () => {
      cancelled = true;
    };
  }, [overview, pathname]);

  return session;
}
