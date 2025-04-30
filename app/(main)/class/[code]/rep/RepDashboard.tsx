"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { withUtm } from "@/lib/utm";
import { formatManilaDate } from "@/lib/manilaTime";

interface DashboardData {
  summary: {
    seatsFilled: number;
    seatCap: number;
    expiresAt: string;
    subjectId: string | null;
    yearId: string;
    scope: "subject" | "all";
  };
  pending: { id: string; createdAt: string }[];
  roster: { ordinal: number; completed: number; total: number }[];
}

interface Props {
  code: string;
}

// Join requests only reach the rep through this page, so it re-checks while
// it's on screen. 30 s keeps a waiting classmate's wait short without
// hammering the route; hidden tabs don't poll at all.
const POLL_MS = 30_000;

// Same public contact address the privacy page lists.
const SUPPORT_EMAIL = "paneslawrence8@gmail.com";

type LoadErrorKind = "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "failed";

function errorKindForStatus(status: number): LoadErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  return "failed";
}

export function RepDashboard({ code }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<LoadErrorKind | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [decideError, setDecideError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState<string | null>(null);
  // Request ids already on screen when the dashboard first loaded; anything
  // else that shows up while it's open is badged "new".
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const dataRef = useRef<DashboardData | null>(null);

  // `background` is a poll: a failed poll keeps the dashboard that's already
  // on screen instead of swapping it for an error page.
  const load = useCallback(async ({ background = false }: { background?: boolean } = {}) => {
    try {
      const res = await fetch(`/api/class/${code}/rep`);
      if (!res.ok) {
        if (!background || !dataRef.current) setError(errorKindForStatus(res.status));
        return;
      }
      const next: DashboardData = await res.json();
      dataRef.current = next;
      setData(next);
      setSeen((prev) => prev ?? new Set(next.pending.map((p) => p.id)));
      setError(null);
    } catch {
      if (!background || !dataRef.current) setError("failed");
    }
  }, [code]);

  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === "visible") void load({ background: true });
    };
    const id = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [load]);

  useEffect(() => {
    // Fetch-on-mount: every setState in load() runs after its awaits, so no
    // synchronous cascading render occurs; the v6 rule can't see through the
    // helper indirection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function decide(requestId: string, decision: "approve" | "reject") {
    setDeciding(requestId);
    setDecideError(null);
    try {
      const res = await fetch(`/api/class/${code}/rep/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, decision }),
      });
      if (res.ok) {
        await load();
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.status === 409 && body?.error === "full") {
        setDecideError("Class is full — no seats left");
        return;
      }
      setDecideError("Something went wrong. Try again.");
    } catch {
      setDecideError("Something went wrong. Try again.");
    } finally {
      setDeciding(null);
    }
  }

  async function copyInviteLink() {
    // Tagged so a classmate arriving from the rep's group chat is countable
    // once the join page records attribution.
    const url = withUtm(`${window.location.origin}/class/${code}/join`, {
      source: "class_invite",
      medium: "referral",
      campaign: "class_rep",
    });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setManualLink(null);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (in-app browsers, insecure contexts): show the link
      // in a field the rep can select and copy by hand.
      setManualLink(url);
    }
  }

  if (error) {
    return <RepDashboardError code={code} kind={error} onRetry={() => void load()} />;
  }
  if (!data) {
    return (
      <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <p className="label-sm mb-4">Class Rep Dashboard</p>
          <p role="status" className="font-sans text-sm text-ink-muted">
            Loading your class…
          </p>
        </div>
      </main>
    );
  }

  const newCount = seen ? data.pending.filter((p) => !seen.has(p.id)).length : 0;

  const classAverage =
    data.roster.length > 0
      ? Math.round(
          (data.roster.reduce((sum, r) => sum + (r.total ? r.completed / r.total : 0), 0) /
            data.roster.length) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-2xl mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />
        <p className="label-sm mb-4">Class Rep Dashboard</p>
        <h1 className="font-serif text-display-lg text-ink mb-8">Your class</h1>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Seats filled</p>
            <p className="font-serif text-2xl text-ink">
              {data.summary.seatsFilled}
              <span className="text-sm text-ink-faint">/{data.summary.seatCap}</span>
            </p>
          </div>
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Class average</p>
            <p className="font-serif text-2xl text-accent">{classAverage}%</p>
          </div>
          <div className="rounded-xl border border-taupe/30 p-4">
            <p className="font-sans text-xs text-ink-faint mb-1">Expires</p>
            <p className="font-serif text-lg text-ink">
              {formatManilaDate(data.summary.expiresAt, "short")}
            </p>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className="w-full mb-8 rounded-xl border border-taupe/30 px-4 py-3 font-sans text-sm font-medium text-ink hover:bg-taupe/10"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
        {manualLink && (
          <label className="-mt-6 mb-8 block font-sans text-xs text-ink-muted">
            Couldn&apos;t copy automatically. Select the invite link and copy it:
            <input
              readOnly
              value={manualLink}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1 w-full rounded border border-taupe/30 bg-paper px-3 py-2 font-mono text-xs text-ink"
            />
          </label>
        )}

        {decideError && (
          <p className="mb-4 font-sans text-sm text-red-500">{decideError}</p>
        )}

        {data.pending.length > 0 && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-sans text-sm uppercase tracking-wide text-ink-muted mb-3">
              <span>Pending requests ({data.pending.length})</span>
              {newCount > 0 && (
                <span
                  aria-live="polite"
                  className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-paper"
                >
                  {newCount} new
                </span>
              )}
            </h3>
            <div className="space-y-2">
              {data.pending.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-taupe/20 px-4 py-3"
                >
                  <span className="font-sans text-sm text-ink-muted">
                    Request · {formatManilaDate(p.createdAt, "dateTime")}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={deciding === p.id}
                      onClick={() => decide(p.id, "approve")}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-sans font-semibold text-paper disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={deciding === p.id}
                      onClick={() => decide(p.id, "reject")}
                      className="rounded-lg border border-taupe/30 px-3 py-1.5 text-xs font-sans text-ink-muted disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-sans text-sm uppercase tracking-wide text-ink-muted mb-3">
            Roster ({data.roster.length})
          </h3>
          {data.roster.length === 0 && (
            <p className="font-sans text-sm text-ink-faint">
              No classmates yet. Share the invite link in your class group chat to get them in.
            </p>
          )}
          <div className="space-y-2">
            {data.roster.map((r) => {
              const pct = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
              return (
                <div key={r.ordinal} className="flex items-center gap-3 text-sm font-sans">
                  <span className="w-24 shrink-0 text-ink-faint">Classmate {r.ordinal}</span>
                  <div className="flex-1 h-2 rounded-full bg-taupe/20 overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-ink-muted">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

const ERROR_COPY: Record<LoadErrorKind, { title: string; body: string; retry: boolean }> = {
  // The rep is identified only by this browser's device cookie, so a new
  // phone, another browser or cleared site data all land here. Retry covers
  // the first-visit case where the device cookie hadn't been issued yet.
  unauthorized: {
    title: "Open this on your setup device",
    body:
      "Your class dashboard only opens on the device you used to set up the class. Open this link on that phone or browser. If you no longer have it or cleared its data, email us and we'll move the class to this device.",
    retry: true,
  },
  forbidden: {
    title: "This isn't your class dashboard.",
    body: "This link belongs to a class rep's dashboard. If you're a classmate, request to join instead.",
    retry: false,
  },
  not_found: {
    title: "Class not found.",
    body: "Check that the link matches the one from your class setup.",
    retry: false,
  },
  rate_limited: {
    title: "Too many requests",
    body: "Wait a moment, then try again.",
    retry: true,
  },
  failed: {
    title: "Couldn't load your class dashboard.",
    body: "Something went wrong on our end or with your connection.",
    retry: true,
  },
};

function RepDashboardError({
  code,
  kind,
  onRetry,
}: {
  code: string;
  kind: LoadErrorKind;
  onRetry: () => void;
}) {
  const copy = ERROR_COPY[kind];
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Move my class dashboard (${code}) to a new device`
  )}`;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-sm mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />
        <p className="label-sm mb-4">Class Rep Dashboard</p>
        <h1 role="alert" className="font-serif text-display-md text-ink mb-3 leading-tight">
          {copy.title}
        </h1>
        <p className="font-sans text-sm text-ink-muted mb-8">{copy.body}</p>
        <div className="flex flex-col gap-3">
          {copy.retry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-xl bg-ink px-4 py-3 font-sans font-medium text-paper hover:opacity-90"
            >
              Try again
            </button>
          )}
          {kind === "unauthorized" && (
            <a
              href={mailto}
              className="w-full rounded-xl border border-ink/20 px-4 py-3 text-center font-sans font-medium text-ink hover:bg-ink/5"
            >
              Email us to move the class
            </a>
          )}
          {kind === "forbidden" && (
            <Link
              href={`/class/${code}/join`}
              className="w-full rounded-xl bg-ink px-4 py-3 text-center font-sans font-medium text-paper hover:opacity-90"
            >
              Join this class instead
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
