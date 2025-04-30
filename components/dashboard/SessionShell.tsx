"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NavRail } from "@/components/dashboard/NavRail";
import { useSession } from "@/hooks/useSession";
import { hasDashboardReferrer } from "@/lib/navigation";
import { signOutAction } from "@/app/(auth)/actions";

// Client-side pieces of the dashboard shell for prerendered pages (/year,
// /year/[yearId]/subjects, /resources). Those pages are the same HTML for every
// visitor, so whether to show the rail, its progress, and the log-out button
// are all decided here after hydration rather than during render.

/** Nav rail that is always shown; progress fills in once the session loads. */
export function SessionNavRail() {
  const { ready, signedIn, overallDone, overallTotal } = useSession({ overview: true });
  // Until the session resolves, keep the ring (it fills in) rather than
  // flashing a log-in prompt at a signed-in reader.
  return <NavRail overallDone={overallDone} overallTotal={overallTotal} signedIn={!ready || signedIn} />;
}

function DashboardNavRailInner({ children }: { children?: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { ready, signedIn, overallDone, overallTotal } = useSession({ overview: true });
  const fromDashboard = hasDashboardReferrer(searchParams);
  if (!signedIn && !fromDashboard) return null;
  return (
    <>
      <NavRail overallDone={overallDone} overallTotal={overallTotal} signedIn={!ready || signedIn} />
      {children}
    </>
  );
}

/**
 * Nav rail (plus `children`, e.g. a section tour) shown only to signed-in
 * readers or anyone who arrived through the dashboard (?from=dashboard).
 * Anonymous visitors browsing from the landing page never see it.
 */
export function DashboardNavRail({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardNavRailInner>{children}</DashboardNavRailInner>
    </Suspense>
  );
}

/** "Log out" for signed-in readers; renders nothing for everyone else. */
export function SessionLogoutButton() {
  const { signedIn } = useSession();
  if (!signedIn) return null;
  return (
    <form action={signOutAction}>
      <button className="text-xs text-ink-muted underline">Log out</button>
    </form>
  );
}

/** Mounts `children` only for a signed-in reader. */
export function SignedInOnly({ children }: { children: React.ReactNode }) {
  const { signedIn } = useSession();
  return signedIn ? <>{children}</> : null;
}

/** Mounts `children` once the session has resolved as signed out. */
export function SignedOutOnly({ children }: { children: React.ReactNode }) {
  const { ready, signedIn } = useSession();
  return ready && !signedIn ? <>{children}</> : null;
}
