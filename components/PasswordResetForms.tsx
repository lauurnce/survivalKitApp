"use client";
import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

// The two halves of "forgot password": asking for the email, and setting the
// new password once the emailed link has signed the student in. They follow
// AuthForm: server actions through useActionState, so both forms work as a
// plain POST before hydration, and the same page shell and field styles.
type State = { error?: string; notice?: string };
type Action = (state: State, formData: FormData) => Promise<State>;

const INPUT_CLASS = "mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-base text-ink";

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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="mb-10 flex flex-col gap-6">
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150 self-start"
        >
          <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
          <span>Log in</span>
        </Link>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>
      {children}
    </div>
  );
}

function Messages({ state }: { state: State }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      {state.notice && (
        <p role="status" className="text-sm text-ink">
          {state.notice}
        </p>
      )}
    </>
  );
}

export function ForgotPasswordForm({
  action,
  initialError,
}: {
  action: Action;
  /** Shown when the student arrives back here from an expired link. */
  initialError?: string;
}) {
  const [state, formAction] = useActionState(action, initialError ? { error: initialError } : {});
  // Controlled so a returned error doesn't wipe the address (see AuthForm).
  const [email, setEmail] = useState("");
  return (
    <Shell>
      <form className="space-y-4" action={formAction}>
        <h1 className="font-serif text-3xl text-ink">Reset your password</h1>
        <p className="text-sm text-ink-muted">
          Enter the email you signed up with and we&apos;ll send you a link to set a new password.
        </p>
        <label className="block text-sm text-ink-muted">
          Email
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={INPUT_CLASS}
          />
        </label>
        <Messages state={state} />
        <SubmitButton label="Send reset link" pendingLabel="Sending…" />
        <p className="text-sm text-ink-muted">
          Remembered it?{" "}
          <a className="text-accent underline" href="/login">
            Log in
          </a>
        </p>
      </form>
    </Shell>
  );
}

export function ResetPasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});
  const [showPassword, setShowPassword] = useState(false);
  const passwordId = useId();
  const confirmId = useId();
  const hintId = `${passwordId}-hint`;
  const type = showPassword ? "text" : "password";
  return (
    <Shell>
      <form className="space-y-4" action={formAction}>
        <h1 className="font-serif text-3xl text-ink">Set a new password</h1>
        <p className="text-sm text-ink-muted">Choose a new password for your account.</p>
        <div className="block text-sm text-ink-muted">
          <div className="flex items-center justify-between">
            <label htmlFor={passwordId}>New password</label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
              aria-controls={`${passwordId} ${confirmId}`}
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
              className="inline-flex min-h-6 min-w-6 items-center justify-center text-xs text-ink-faint hover:text-ink transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id={passwordId}
            name="password"
            type={type}
            required
            minLength={8}
            autoComplete="new-password"
            aria-describedby={hintId}
            className={INPUT_CLASS}
          />
          <span id={hintId} className="mt-1 block text-xs text-ink-faint">
            At least 8 characters.
          </span>
        </div>
        <div className="block text-sm text-ink-muted">
          <label htmlFor={confirmId}>Confirm new password</label>
          <input
            id={confirmId}
            name="confirmPassword"
            type={type}
            required
            minLength={8}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </div>
        <Messages state={state} />
        <SubmitButton label="Update password" pendingLabel="Updating…" />
      </form>
    </Shell>
  );
}

/** Shown on /reset-password when no recovery session is present. */
export function ResetLinkExpired({ message }: { message: string }) {
  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="font-serif text-3xl text-ink">Link expired</h1>
        <p role="alert" className="text-sm text-ink-muted">
          {message}
        </p>
        <a
          href="/forgot-password"
          className="block w-full rounded bg-accent px-4 py-2 text-center font-medium text-paper"
        >
          Send a new link
        </a>
      </div>
    </Shell>
  );
}
