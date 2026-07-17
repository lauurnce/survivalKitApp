"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { getDeviceId } from "@/lib/device";

type ReqStatus = "idle" | "pending" | "approved" | "rejected";

interface ApprovedScope {
  subjectId: string | null;
  yearId: string;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes — a rep approving is a human action, give it room

interface Props {
  code: string;
}

export function ClassJoinRequest({ code }: Props) {
  const [status, setStatus] = useState<ReqStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<ApprovedScope | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    if (pollRef.current !== null) return;
    pollCountRef.current = 0;
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      try {
        const res = await fetch(`/api/class/${code}/request/status`);
        const data = await res.json();
        if (data.status === "approved") {
          clearPoll();
          setScope({ subjectId: data.subjectId ?? null, yearId: data.yearId });
          setStatus("approved");
          return;
        }
        if (data.status === "rejected") {
          clearPoll();
          setStatus("rejected");
          return;
        }
      } catch {
        // swallow — keep polling
      }
      if (pollCountRef.current >= MAX_POLLS) {
        clearPoll();
        setError("Still waiting — check back in a bit, or ask your rep directly.");
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => () => clearPoll(), []);

  async function handleRequest() {
    getDeviceId();
    setError(null);
    try {
      const res = await fetch(`/api/class/${code}/request`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "not_found"
            ? "That link doesn't match an active class."
            : data.error === "rate_limited"
              ? "Too many attempts. Try again in a minute."
              : "Something went wrong. Try again."
        );
        return;
      }
      if (data.status === "approved") {
        // The submission endpoint returns 'approved' immediately for a
        // returning classmate but doesn't carry scope — poll status once to
        // pick up subjectId/yearId for the redirect button below.
        try {
          const statusRes = await fetch(`/api/class/${code}/request/status`);
          const statusData = await statusRes.json();
          if (statusData.status === "approved") {
            setScope({ subjectId: statusData.subjectId ?? null, yearId: statusData.yearId });
          }
        } catch {
          // swallow — approved state still renders without the redirect button
        }
        setStatus("approved");
      } else {
        setStatus("pending");
        startPolling();
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
  }

  const startStudyingHref = scope
    ? scope.subjectId
      ? `/year/${scope.yearId}/subjects/${scope.subjectId}/modules`
      : `/year/${scope.yearId}`
    : null;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-sm mx-auto text-center">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        {status === "idle" && (
          <>
            <p className="label-sm mb-4">Class Rep</p>
            <h1 className="font-serif text-display-md text-ink mb-3 leading-tight">Join your class</h1>
            <p className="font-sans text-sm text-ink-muted mb-8">
              Tap below to request to join — your class rep approves each classmate.
            </p>
            <button
              onClick={handleRequest}
              className="w-full rounded-xl bg-ink px-4 py-3 font-sans font-medium text-paper hover:opacity-90"
            >
              Request to join →
            </button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full border-4 border-taupe/30 border-t-accent animate-spin" />
            <h1 className="font-serif text-display-md text-ink mb-2">Waiting for approval</h1>
            <p className="font-sans text-sm text-ink-muted">Your rep has been notified.</p>
          </>
        )}

        {status === "approved" && (
          <>
            <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-accent flex items-center justify-center text-paper text-2xl">
              ✓
            </div>
            <h1 className="font-serif text-display-md text-ink mb-2">You&apos;re in!</h1>
            <p className="font-sans text-sm text-ink-muted mb-6">Your subject is now unlocked.</p>
            {startStudyingHref && (
              <Link
                href={startStudyingHref}
                className="inline-block w-full rounded-xl bg-ink px-4 py-3 font-sans font-medium text-paper hover:opacity-90"
              >
                Start studying →
              </Link>
            )}
          </>
        )}

        {status === "rejected" && (
          <p className="font-sans text-sm text-ink-muted">
            Your request wasn&apos;t approved. Check with your class rep.
          </p>
        )}

        {error && <p className="mt-4 font-sans text-sm text-red-500">{error}</p>}
      </div>
    </main>
  );
}
