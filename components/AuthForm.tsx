"use client";
import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { SchoolFields } from "./SchoolFields";
import { resetSessionCache } from "@/hooks/useSession";

// The server action returns { error?: string } on failure, or redirects on
// success. useActionState wires it directly to the form, so submission works
// via native form POST even before/without client hydration (progressive
// enhancement) — no fragile client-side onClick wrapper.
type State = { error?: string; notice?: string };
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
  // Controlled on purpose: React 19 resets a form's uncontrolled fields after
  // every action, including one that returns an error, which wiped the email
  // a student had just typed whenever signup said "password too weak". The
  // school combobox is already controlled; the password is left to reset.
  const [email, setEmail] = useState("");

  // useSession caches /api/me per pathname, and the auth pages render nothing
  // that asks it — so a page visited signed out kept its signed-out answer
  // across the sign-in. The redirect back to it (a client-side navigation)
  // then showed the reader as still signed out: TopBar said "Log in" and the
  // print gate re-appeared. Forget every answer while the student is here.
  useEffect(() => {
    resetSessionCache();
  }, []);
  const passwordId = useId();
  const passwordHintId = `${passwordId}-hint`;
  const title = mode === "login" ? "Log in" : "Create account";
  const pendingLabel = mode === "login" ? "Signing in…" : "Creating account…";

  // Signup carries the school + sector pair side by side; at max-w-sm the two
  // columns squeeze the sector buttons and wrap their hint onto three lines.
  const width = mode === "signup" ? "max-w-md" : "max-w-sm";

  return (
    <div className={`mx-auto mt-16 ${width} px-6`}>
      <div className="mb-10 flex flex-col gap-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150 self-start"
        >
          <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
          <span>Home</span>
        </Link>
        <span className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
          BSIT Survival Kit
        </span>
      </div>
    <form className="space-y-4" action={formAction}>
      <h1 className="font-serif text-3xl text-ink">{title}</h1>
      <p className="text-sm text-ink-muted">
        {mode === "login"
          ? "Pick up where you left off — your unlocks and progress are saved to your account."
          : "An account keeps your unlocks and progress across devices."}
      </p>
      <input type="hidden" name="next" value={next} />
      {/* Inputs set text-base (16px) explicitly: inheriting the label's
          text-sm made them 14px, and iOS Safari zooms into any field under
          16px on focus, then stays zoomed (QA FL-04). */}
      <label className="block text-sm text-ink-muted">
        Email
        <input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-base text-ink"
        />
      </label>
      <div className="block text-sm text-ink-muted">
        <div className="flex items-center justify-between">
          <label htmlFor={passwordId}>Password</label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            aria-controls={passwordId}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="inline-flex min-h-6 min-w-6 items-center justify-center text-xs text-ink-faint hover:text-ink transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id={passwordId}
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-describedby={mode === "signup" ? passwordHintId : undefined}
          className="mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-base text-ink"
        />
        {mode === "signup" && (
          <span id={passwordHintId} className="mt-1 block text-xs text-ink-faint">
            At least 8 characters.
          </span>
        )}
      </div>
      {/* Signup only: a returning student's school is already on their
          profile, and re-asking at login would be noise. */}
      {mode === "signup" && <SchoolFields idPrefix="signup" />}
      {state?.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      {state?.notice && (
        <p role="status" className="text-sm text-ink">
          {state.notice}
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
    </div>
  );
}
