"use client";
import { useState, useTransition } from "react";

type Action = (fd: FormData) => Promise<{ error?: string }>;

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: Action;
  next: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const title = mode === "login" ? "Log in" : "Create account";

  return (
    <form
      className="mx-auto mt-24 max-w-sm space-y-4 px-6"
      action={(fd) =>
        start(async () => {
          const r = await action(fd);
          if (r?.error) setError(r.error);
        })
      }
    >
      <h1 className="font-serif text-3xl text-ink dark:text-ink">{title}</h1>
      <input type="hidden" name="next" value={next} />
      <label className="block text-sm text-ink-muted">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm text-ink-muted">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-ink"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-accent px-4 py-2 font-medium text-paper disabled:opacity-60"
      >
        {pending ? "…" : title}
      </button>
      <p className="text-sm text-ink-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <a
              className="text-accent underline"
              href={`/signup?next=${encodeURIComponent(next)}`}
            >
              Sign up
            </a>
          </>
        ) : (
          <>
            Have an account?{" "}
            <a
              className="text-accent underline"
              href={`/login?next=${encodeURIComponent(next)}`}
            >
              Log in
            </a>
          </>
        )}
      </p>
    </form>
  );
}
