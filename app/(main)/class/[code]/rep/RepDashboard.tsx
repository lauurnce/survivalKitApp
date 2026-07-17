"use client";

import { useCallback, useEffect, useState } from "react";
import { BackLink } from "@/components/BackLink";

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

export function RepDashboard({ code }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<string | null>(null);
  const [decideError, setDecideError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/class/${code}/rep`);
      if (!res.ok) {
        setError(res.status === 403 ? "This isn't your class dashboard." : "Class not found.");
        return;
      }
      setData(await res.json());
    } catch {
      setError("Something went wrong loading your dashboard.");
    }
  }, [code]);

  useEffect(() => {
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
    const url = `${window.location.origin}/class/${code}/join`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — nothing more we can do here
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-paper px-6 py-12">
        <p className="font-sans text-ink-muted">{error}</p>
      </main>
    );
  }
  if (!data) return null;

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
              {new Date(data.summary.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={copyInviteLink}
          className="w-full mb-8 rounded-xl border border-taupe/30 px-4 py-3 font-sans text-sm font-medium text-ink hover:bg-taupe/10"
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>

        {decideError && (
          <p className="mb-4 font-sans text-sm text-red-500">{decideError}</p>
        )}

        {data.pending.length > 0 && (
          <div className="mb-8">
            <h3 className="font-sans text-sm uppercase tracking-wide text-ink-muted mb-3">
              Pending requests ({data.pending.length})
            </h3>
            <div className="space-y-2">
              {data.pending.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-taupe/20 px-4 py-3"
                >
                  <span className="font-sans text-sm text-ink-muted">
                    Request · {new Date(p.createdAt).toLocaleTimeString()}
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
