"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/BackLink";

export default function ClassJoinPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(
          json.error === "full"
            ? "This class is already full."
            : json.error === "not_found"
              ? "That code doesn't match an active class."
              : json.error === "rate_limited"
                ? "Too many attempts. Try again in a minute."
                : json.error === "invalid_code"
                  ? "That code doesn't look right — check for typos."
                  : "Something went wrong. Try again."
        );
        return;
      }
      router.push(`/year/${json.yearId}/subjects/${json.subjectId}/modules?joined=1`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-sm mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        <p className="label-sm mb-4">Class Rep</p>
        <h1 className="font-serif text-display-md text-ink mb-3 leading-tight">
          Join your class
        </h1>
        <p className="font-sans text-sm text-ink-muted mb-8">
          Ask your class rep for the 6-character code they got after the block
          sale, then enter it below to unlock the subject.
        </p>

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, 6));
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.length === 6 && !loading) handleJoin();
          }}
          placeholder="ABC234"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-taupe/30 bg-paper px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-ink placeholder:text-ink-faint focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          maxLength={6}
        />

        {error && (
          <p className="mt-3 font-sans text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || code.length !== 6}
          className="mt-6 w-full rounded-xl bg-ink px-4 py-3 font-sans font-medium text-paper transition-opacity disabled:opacity-40 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {loading ? "Joining…" : "Join class"}
        </button>
      </div>
    </main>
  );
}
