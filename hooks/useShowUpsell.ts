"use client";

import { useSyncExternalStore } from "react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { hasPaymentMarker } from "@/lib/paymentMarker";

// Supabase's SSR client keeps the session in a JS-readable cookie named
// sb-<project-ref>-auth-token (chunked as .0, .1… when large). Its presence is
// only a hint — /api/subscription-status still decides — but it is readable
// synchronously at hydration, before any request returns.
const AUTH_COOKIE = /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/;

function hasAuthCookie(): boolean {
  try {
    return AUTH_COOKIE.test(document.cookie);
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};
const serverFalse = () => false;

/**
 * Whether the "unlock / buy" surfaces for (yearId, subjectId) may show.
 *
 * Never for a reader whose access is known, or whose payment is being
 * confirmed (?payment=success, the poll, or its timeout). While the first
 * check is in flight they stay up only for a reader who looks signed out —
 * that is the prerendered locked view — so a signed-in subscriber never sees
 * the upsell flash before the status lands.
 */
export function useShowUpsell(yearId: string, subjectId: string): boolean {
  const { subscribed, polling, unlocked, pollTimedOut } = useSubscriptionStatus(yearId, subjectId);
  // Server snapshot false: the static HTML is the signed-out, no-marker view;
  // the client value takes over right after hydration without a mismatch.
  const signedIn = useSyncExternalStore(noSubscribe, hasAuthCookie, serverFalse);
  const returning = useSyncExternalStore(noSubscribe, hasPaymentMarker, serverFalse);

  if (subscribed === true || polling || unlocked || pollTimedOut) return false;
  if (returning) return false;
  if (subscribed === false) return true;
  return !signedIn;
}
