"use client";

import { useState } from "react";
import { getDeviceId } from "@/lib/device";

type WillingToPay = "yes" | "no" | "maybe";

export function WaitlistBanner() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [willingToPay, setWillingToPay] = useState<WillingToPay | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !willingToPay) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          device_id: getDeviceId(),
          source: "paywall",
          willing_to_pay: willingToPay,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-ink-faint/30 px-6 py-5 mt-4 max-w-sm">
        <p className="font-sans text-sm text-ink-muted">Thanks! We'll keep you posted.</p>
      </div>
    );
  }

  const toggleBtnBase =
    "font-mono text-label-sm uppercase tracking-[0.12em] px-4 py-2 border transition-colors duration-150";
  const activeBtn = "border-ink bg-ink text-paper";
  const inactiveBtn = "border-ink-faint/30 text-ink-muted hover:border-ink hover:text-ink";

  return (
    <form onSubmit={handleSubmit} className="border border-ink-faint/30 px-6 py-5 mt-4 max-w-sm flex flex-col gap-4">
      <p className="font-serif text-lg text-ink leading-tight">Want access to activities?</p>

      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
      />

      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="font-sans text-sm text-ink bg-transparent border-b border-ink-faint/40 pb-1 outline-none placeholder:text-ink-faint focus:border-ink transition-colors duration-150"
      />

      <div className="flex flex-col gap-2">
        <p className="font-sans text-xs text-ink-muted">Would you be willing to pay for full access?</p>
        <div className="flex gap-2">
          {(["yes", "no", "maybe"] as WillingToPay[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWillingToPay(opt)}
              className={`${toggleBtnBase} ${willingToPay === opt ? activeBtn : inactiveBtn}`}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="font-sans text-xs text-accent">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={!name || !email || !willingToPay || loading}
        className="self-start font-mono text-label-sm uppercase tracking-[0.12em] bg-navy text-paper px-6 py-2 hover:bg-ink transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : "Join waitlist"}
      </button>
    </form>
  );
}
