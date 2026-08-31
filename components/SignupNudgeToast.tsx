"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  /**
   * Where the sign-up CTA sends the reader — typically `/signup?next=<module path>`
   * so they land back on this module once the account is created, matching the
   * `?next=` pattern already used by /unlock's sign-in link.
   */
  signupHref: string;
}

/** Shown once per browser session unless permanently dismissed. */
const SESSION_SHOWN_KEY = "bsit_signup_nudge_shown";
/** Set only when the reader explicitly closes the toast; never cleared. */
const DISMISSED_KEY = "bsit_signup_nudge_dismissed";

function readFlag(storage: Storage, key: string): boolean {
  try {
    return storage.getItem(key) === "1";
  } catch {
    // Blocked storage (private browsing, etc.) — treat as "not set" rather
    // than crash the reader.
    return false;
  }
}

function writeFlag(storage: Storage, key: string): void {
  try {
    storage.setItem(key, "1");
  } catch {
    // Losing the flag just means the toast may reappear — never fatal.
  }
}

// A dismissible bottom toast nudging signed-out visitors reading already-free
// content to create an account. Progress ("Mark done") is currently tracked
// per-device via the bsit_device_id cookie and lost on a new browser/device,
// so the copy leads with that. Never blocks reading — it's a toast, not a
// gate — and the caller only renders it for signed-out visitors.
export function SignupNudgeToast({ signupHref }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Permanently dismissed on this device — never show again.
    if (readFlag(window.localStorage, DISMISSED_KEY)) return;
    // Already shown once this session (dismissed or not) — don't repeat it
    // on every free module the reader visits before closing the tab.
    if (readFlag(window.sessionStorage, SESSION_SHOWN_KEY)) return;

    writeFlag(window.sessionStorage, SESSION_SHOWN_KEY);
    // One-shot read of storage on mount, same pattern as UnlockSuccessToast.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  function dismiss() {
    setVisible(false);
    writeFlag(window.localStorage, DISMISSED_KEY);
  }

  if (!visible || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 bg-navy text-paper px-5 py-3 shadow-lg max-w-[calc(100%-2rem)]"
      >
        <span className="font-sans text-sm">
          Save your progress across devices — create a free account.
        </span>
        <a
          href={signupHref}
          className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent hover:text-paper transition-colors duration-150"
        >
          Sign up →
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="font-mono text-label-sm uppercase tracking-[0.12em] text-taupe hover:text-paper transition-colors duration-150"
        >
          Continue reading
        </button>
      </div>
    </div>,
    document.body
  );
}
