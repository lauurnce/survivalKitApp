"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

// The server action returns { error?: string } on failure, or redirects on
// success. useActionState wires it directly to the form, so submission works
// via native form POST even before/without client hydration (progressive
// enhancement) — no fragile client-side onClick wrapper.
type State = { error?: string };
type Action = (state: State, formData: FormData) => Promise<State>;

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent px-4 py-2 font-medium text-paper transition-opacity disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: Action;
  next: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const title = mode === "login" ? "Log in" : "Create account";
  const pendingLabel = mode === "login" ? "Signing in…" : "Creating account…";

  return (
    <form className="mx-auto mt-24 max-w-sm space-y-4 px-6" action={formAction}>
      <h1 className="font-serif text-3xl text-ink">{title}</h1>
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
        <span className="flex items-center justify-between">
          Password
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="text-xs text-ink-faint hover:text-ink transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-ink"
        />
        {mode === "signup" && (
          <span className="mt-1 block text-xs text-ink-faint">
            At least 8 characters.
          </span>
        )}
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <SubmitButton label={title} pendingLabel={pendingLabel} />
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
