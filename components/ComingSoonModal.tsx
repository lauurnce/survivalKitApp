"use client";

import { useState } from "react";
import { getDeviceId, getClientDeviceSignals } from "@/lib/device";

interface Props {
  yearLabel: string;
  onClose: () => void;
}

export function ComingSoonModal({ yearLabel, onClose }: Props) {
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
          ...getClientDeviceSignals(),
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      setTimeout(onClose, 3000);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const toggleBtnBase =
    "font-mono text-label-sm uppercase tracking-[0.12em] px-4 py-2 border transition-colors duration-150";
  const activeBtn = "border-ink bg-ink text-paper";
  const inactiveBtn = "border-ink-faint/30 text-ink-muted hover:border-ink hover:text-ink";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        className="bg-navy text-paper mx-4 max-w-sm w-full p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">{yearLabel}</p>
            <h2 id="coming-soon-title" className="font-serif text-display-md text-paper leading-none">You&apos;re in.</h2>
            <p className="font-sans text-sm text-taupe leading-relaxed">
              Thanks! We&apos;ll let you know when content is ready.
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">{yearLabel}</p>
            <h2 id="coming-soon-title" className="font-serif text-display-md text-paper leading-none">
              Coming Soon
            </h2>
            <p className="font-sans text-sm text-taupe leading-relaxed">
              Content for this year is being written. Leave your email and we&apos;ll notify you when it&apos;s ready.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="font-sans text-sm text-paper bg-transparent border-b border-taupe/40 pb-1 outline-none placeholder:text-taupe/60 focus:border-paper transition-colors duration-150"
              />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-sans text-sm text-paper bg-transparent border-b border-taupe/40 pb-1 outline-none placeholder:text-taupe/60 focus:border-paper transition-colors duration-150"
              />

              <div className="flex flex-col gap-2">
                <p className="font-sans text-xs text-taupe">Are you working on a capstone or thesis project?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNeedsCapstone(true)}
                    className={`${toggleBtnBase} ${needsCapstone === true ? activeBtn : inactiveBtn}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeedsCapstone(false)}
                    className={`${toggleBtnBase} ${needsCapstone === false ? activeBtn : inactiveBtn}`}
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
                className="self-start font-mono text-label-sm uppercase tracking-[0.12em] bg-paper text-navy px-6 py-2 hover:bg-taupe transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Notify me"}
              </button>

              <p className="font-sans text-[10px] text-taupe/60 leading-relaxed">
                By submitting, you agree to our{" "}
                <a href="/privacy" className="underline hover:text-taupe transition-colors">
                  Privacy Policy
                </a>
                . We collect your name and email solely to notify you when content is ready.
              </p>
            </form>

            <button
              onClick={onClose}
              aria-label="Close"
              className="self-start font-sans text-sm uppercase tracking-widest text-taupe hover:text-paper transition-colors duration-150"
            >
              Close ×
            </button>
          </>
        )}
      </div>
    </div>
  );
}
