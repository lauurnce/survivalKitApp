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
    // Bottom-anchored, one slot above ModuleDoneToggle's "Nice! One more
    // down" prompt (fixed bottom-6, centered, z-40). This toast has no
    // auto-dismiss timer, so it must never share a position with something
    // that can appear while it is still up: that prompt only needs the device
    // cookie, so the signed-out reader this toast targets can trigger both.
    // The top of the viewport is taken by the fixed TopBar (theme + Log in,
    // z-50) and the reader's breadcrumb and back link, which a top-anchored
    // toast covered on phones. print:hidden keeps it off the PDF: the portal
    // lands in <body>, outside the reader's print gate.
    <div
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] print:hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 bg-inverse text-on-inverse px-5 py-3 shadow-lg max-w-[calc(100%-2rem)]"
      >
        <span className="font-sans text-sm">
          Save your progress across devices — create a free account.
        </span>
        <a
          href={signupHref}
          // The bright accent is under 4.5:1 on the inverse panel at this size,
          // so the link is on-inverse text with an accent underline.
          className="font-mono text-label-sm uppercase tracking-[0.12em] text-on-inverse underline decoration-accent decoration-2 underline-offset-4 hover:decoration-on-inverse transition-colors duration-150"
        >
          Sign up →
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="font-mono text-label-sm uppercase tracking-[0.12em] text-on-inverse/70 hover:text-on-inverse transition-colors duration-150"
        >
          Continue reading
        </button>
      </div>
    </div>,
    document.body
  );
}
