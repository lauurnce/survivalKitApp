"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

// Errors from a non-JSON body (a proxy's 429 page, a 5xx) used to throw in
// res.json() and surface as "Network error" (QA GT-21). Read it defensively.
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // not JSON: fall through
  }
  if (res.status === 429) return "Too many attempts. Try again in a few minutes.";
  return res.status >= 500 ? "Server error — try again" : "Invalid password";
}

/** `next` is already validated server-side by safeAdminNext. */
export function AdminLoginForm({ next }: { next: string }) {
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError(await errorMessage(res));
        setPassword("");
      }
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <p className="label mb-2">Admin Access</p>
        <h1 className="font-serif text-display-md text-ink mb-4">Enter password</h1>

        {error && (
          <p className="font-sans text-xs text-accent border border-accent/30 px-3 py-2">
            {error}
          </p>
        )}

        <label htmlFor={passwordId} className="sr-only">
          Admin password
        </label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="border border-ink-faint bg-transparent px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ink transition-colors"
          autoFocus
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="border border-ink text-ink font-sans text-xs uppercase tracking-widest px-6 py-3 hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
