"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "delete my account";

function DeleteConfirmModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = confirmText.trim().toLowerCase() === CONFIRM_PHRASE && !pending;

  async function handleDelete() {
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong. Please try again or email us.");
        setPending(false);
        return;
      }
      // Account + session are gone server-side; send them home rather than
      // to a page that will just redirect to /login anyway.
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !pending) onClose(); }}
    >
      <div className="w-full max-w-md bg-paper border border-taupe/50 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-serif text-lg text-ink leading-snug">Delete your account</h2>
          <button
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-ink-muted leading-relaxed">
          This permanently deletes your profile and account login, and removes
          your name from your subscription and progress history. This cannot
          be undone.
        </p>
        <p className="text-xs text-ink-faint leading-relaxed">
          Payment records are kept (without your name attached) as required
          for dispute resolution and accounting. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink-muted">
            Privacy Policy
          </a>{" "}
          for details.
        </p>

        <label className="block text-sm text-ink-muted">
          Type <span className="font-mono text-ink">{CONFIRM_PHRASE}</span> to confirm
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={pending}
            autoComplete="off"
            className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink disabled:opacity-50"
          />
        </label>

        {error && <p role="alert" className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-lg border border-taupe/50 px-4 py-2.5 text-sm text-ink-muted hover:bg-taupe/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canSubmit}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-paper hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-red-500/80 underline underline-offset-2 hover:text-red-600"
      >
        Delete my account
      </button>
      {open && <DeleteConfirmModal onClose={() => setOpen(false)} />}
    </>
  );
}
