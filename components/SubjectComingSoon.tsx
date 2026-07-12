"use client";

import { useState } from "react";
import { getDeviceId, getClientDeviceSignals } from "@/lib/device";

interface Props {
  subjectTitle: string;
  yearLabel: string;
}

export function SubjectComingSoon({ subjectTitle, yearLabel }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [needsCapstone, setNeedsCapstone] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || needsCapstone === null) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          device_id: getDeviceId(),
          source: "coming_soon",
          needs_capstone: needsCapstone,
          subject_title: subjectTitle,
          year_label: yearLabel,
          ...getClientDeviceSignals(),
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const toggleBase =
    "font-mono text-label-sm uppercase tracking-[0.12em] px-4 py-2 border transition-colors duration-150";
  const active = "border-ink bg-ink text-paper";
  const inactive = "border-ink-faint/40 text-ink-muted hover:border-ink hover:text-ink";

  if (submitted) {
    return (
      <div className="max-w-sm py-12 flex flex-col gap-4">
        <h2 className="font-serif text-display-md text-ink leading-none">You&apos;re in.</h2>
        <p className="font-sans text-sm text-ink-muted leading-relaxed">
          Thanks! We&apos;ll prioritize <span className="text-ink">{subjectTitle}</span> and notify you when content is ready.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm py-12 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
          Coming Soon
        </span>
        <h2 className="font-serif text-display-md text-ink leading-none">
          {subjectTitle}
        </h2>
        <p className="font-sans text-sm text-ink-muted leading-relaxed">
          Content for this subject is being written. Leave your info and we&apos;ll notify you when it&apos;s ready.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
        />
        <input
          type="email"
          placeholder="your@email.com"
          aria-label="Email address"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
        />

        <div className="flex flex-col gap-2">
          <p className="font-sans text-xs text-ink-muted">
            Are you working on a capstone or thesis project?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNeedsCapstone(true)}
              className={`${toggleBase} ${needsCapstone === true ? active : inactive}`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setNeedsCapstone(false)}
              className={`${toggleBase} ${needsCapstone === false ? active : inactive}`}
            >
              No
            </button>
          </div>
        </div>

        {error && (
          <p className="font-sans text-xs text-accent">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={!name || !email || needsCapstone === null || loading}
          className="self-start font-mono text-label-sm uppercase tracking-[0.12em] bg-ink text-paper px-6 py-2 hover:bg-navy transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : "Notify me"}
        </button>

        <p className="font-sans text-[10px] text-ink-faint/70 leading-relaxed">
          By submitting, you agree to our{" "}
          <a href="/privacy" className="underline hover:text-ink-muted transition-colors">
            Privacy Policy
          </a>
          . We collect your name and email solely to notify you when content is ready.
        </p>
      </form>
    </div>
  );
}
