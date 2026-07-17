"use client";

import { useEffect, useMemo, useState } from "react";
import { BackLink } from "@/components/BackLink";
import { getDeviceId } from "@/lib/device";
import { computePrice, INCLUDED_SEATS, MIN_SEATS, MAX_SEATS, PER_SEAT } from "./pricing";

export interface SubjectOption {
  id: string;
  title: string;
}

export interface YearOption {
  id: string;
  label: string;
  subjects: SubjectOption[];
}

interface Props {
  years: YearOption[];
}

export function ForBlocksCheckout({ years }: Props) {
  const [scope, setScope] = useState<"subject" | "all">("subject");
  const [seats, setSeats] = useState(INCLUDED_SEATS);
  const [yearId, setYearId] = useState(years[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedYear = years.find((y) => y.id === yearId);
  const subjectsForYear = selectedYear?.subjects ?? [];

  // Keep the subject selection valid whenever the year changes (or the
  // previously-selected subject no longer belongs to the current year).
  useEffect(() => {
    if (subjectsForYear.some((s) => s.id === subjectId)) return;
    setSubjectId(subjectsForYear[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearId]);

  const { base, extraSeats, extra, total, perHead } = useMemo(
    () => computePrice(scope, seats),
    [scope, seats]
  );

  const canPay = !loading && !!yearId && (scope === "all" || !!subjectId);

  async function handlePay() {
    if (!canPay) return;
    setLoading(true);
    setError(null);
    try {
      getDeviceId(); // ensures the signed device cookie exists before checkout
      const res = await fetch("/api/class/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          yearId,
          subjectId: scope === "subject" ? subjectId : undefined,
          seats,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-20">
      <div className="max-w-md mx-auto">
        <BackLink href="/" label="Back to home" className="text-ink-muted hover:text-ink mb-10" />

        <p className="label-sm mb-4">For Class Representatives</p>
        <h1 className="font-serif text-display-lg text-ink mb-6 leading-tight">
          Unlock a subject for your whole block
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setScope("subject")}
            className={`flex-1 rounded-xl py-3 text-sm font-sans font-semibold transition-colors ${
              scope === "subject" ? "bg-accent text-paper" : "border border-taupe/30 text-ink-muted"
            }`}
          >
            1 Subject
          </button>
          <button
            onClick={() => setScope("all")}
            className={`flex-1 rounded-xl py-3 text-sm font-sans font-semibold transition-colors ${
              scope === "all" ? "bg-accent text-paper" : "border border-taupe/30 text-ink-muted"
            }`}
          >
            All Subjects
          </button>
        </div>

        <div className="mb-6">
          <label className="label-sm mb-2 block" htmlFor="year-select">
            Year
          </label>
          <select
            id="year-select"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            className="w-full rounded-xl border border-taupe/30 bg-paper px-4 py-3 font-sans text-sm text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {scope === "subject" && (
          <div className="mb-6">
            <label className="label-sm mb-2 block" htmlFor="subject-select">
              Subject
            </label>
            <select
              id="subject-select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={subjectsForYear.length === 0}
              className="w-full rounded-xl border border-taupe/30 bg-paper px-4 py-3 font-sans text-sm text-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
            >
              {subjectsForYear.length === 0 && <option value="">No subjects available</option>}
              {subjectsForYear.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-7">
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-2">
            <span>Expected classmates (incl. you)</span>
            <span className="text-ink font-semibold">{seats} people</span>
          </div>
          <input
            type="range"
            min={MIN_SEATS}
            max={MAX_SEATS}
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value, 10))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs font-sans text-ink-faint mt-1">
            <span>{MIN_SEATS} (minimum)</span>
            <span>{MAX_SEATS}+</span>
          </div>
        </div>

        <div className="rounded-2xl border border-taupe/30 p-5 mb-6">
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-1">
            <span>Base ({INCLUDED_SEATS} people)</span>
            <span>₱{base}</span>
          </div>
          <div className="flex justify-between text-sm font-sans text-ink-muted mb-3">
            <span>+{extraSeats} extra × ₱{PER_SEAT}</span>
            <span>₱{extra}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-taupe/20 pt-3">
            <span className="font-sans text-sm text-ink">Total</span>
            <span className="font-serif text-3xl text-accent">₱{total.toLocaleString()}</span>
          </div>
          <p className="font-sans text-xs text-ink-faint mt-2">
            ≈ ₱{perHead.toFixed(1)}/person for the whole semester
          </p>
        </div>

        {error && (
          <p className="font-sans text-sm text-red-500 mb-4" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={!canPay}
          className="w-full rounded-xl bg-accent px-4 py-4 font-sans font-semibold text-paper transition-opacity disabled:opacity-50 hover:opacity-90"
        >
          {loading ? "Redirecting…" : "Pay with GCash / Card →"}
        </button>
        <p className="font-sans text-xs text-ink-faint text-center mt-3">
          You&apos;ll get a shareable join link right after payment.
        </p>
      </div>
    </main>
  );
}
