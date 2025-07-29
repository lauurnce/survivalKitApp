"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logEvent } from "@/lib/analytics";
import { useSession } from "@/hooks/useSession";
import { consumePrintParam, waitForPrintReady } from "@/lib/printReady";

interface Props {
  yearId: string;
  subjectId: string;
  moduleId: string;
}

export const PRINT_GATE_TITLE = "Sign up free to download or print this lesson";
export const PRINT_GATE_BODY =
  "Downloading and printing lessons is free with an account. Sign up and you'll come straight back here with the print dialog open.";

/** Where the gate sends the student, and what brings the print dialog back. */
export function printReturnPath({ yearId, subjectId, moduleId }: Props): string {
  return `/year/${yearId}/subjects/${subjectId}/modules/${moduleId}?print=1`;
}

// "Print / Save as PDF" on the module reader. The browser's print dialog
// covers both on every platform (Android/iOS/desktop offer "Save as PDF"), so
// for a signed-in reader this just opens it; app/globals.css carries the
// @media print stylesheet. It prints what is on screen — a locked reader's
// printout has no paid bodies because the page never had them.
//
// A signed-out reader gets a sign-up prompt instead of the dialog. The page
// is prerendered and the same for everyone, so who is reading comes from
// useSession after hydration; a click that lands before that answer arrives
// waits for it rather than guessing.
export function PrintButton(props: Props) {
  const { yearId, subjectId, moduleId } = props;
  const { ready, signedIn } = useSession();
  const [gateOpen, setGateOpen] = useState(false);
  const waitingForSession = useRef(false);
  const closeGate = useCallback(() => setGateOpen(false), []);

  const proceed = useCallback((isSignedIn: boolean) => {
    if (isSignedIn) {
      window.print();
    } else {
      setGateOpen(true);
    }
  }, []);

  function handleClick() {
    void logEvent("print_click", { year_id: yearId, subject_id: subjectId, module_id: moduleId });
    if (!ready) {
      waitingForSession.current = true;
      return;
    }
    proceed(signedIn);
  }

  // Back from the gate's sign-up/log-in with ?print=1: open the dialog once,
  // for a signed-in reader, after the reader's content is in. The marker is
  // stripped from the URL as soon as the session is known, signed in or not,
  // so a reload or a shared link never re-triggers it.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || !consumePrintParam() || !signedIn) return;
    void waitForPrintReady().then(() => {
      if (mounted.current) window.print();
    });
  }, [ready, signedIn]);

  useEffect(() => {
    if (!ready || !waitingForSession.current) return;
    waitingForSession.current = false;
    proceed(signedIn);
  }, [ready, signedIn, proceed]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup={signedIn ? undefined : "dialog"}
        className="print:hidden inline-flex items-center gap-2 border border-paper/30 px-3 py-2 font-mono text-label-sm uppercase tracking-[0.12em] text-taupe hover:text-paper hover:border-paper/60 transition-colors duration-150"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6V1.5h8V6M4 12H2.5A1 1 0 0 1 1.5 11V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H12" />
          <path d="M4 9.5h8v5H4z" />
        </svg>
        Print / Save as PDF
      </button>
      {gateOpen && (
        <PrintSignupGate returnPath={printReturnPath(props)} onClose={closeGate} />
      )}
    </>
  );
}

function PrintSignupGate({ returnPath, onClose }: { returnPath: string; onClose: () => void }) {
  const titleId = useId();
  const bodyId = useId();
  const primary = useRef<HTMLAnchorElement>(null);
  const next = encodeURIComponent(returnPath);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    primary.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  // Portalled to <body>: the button sits inside the reader's navy header,
  // whose colour scope would otherwise invert the prompt's paper/ink tokens.
  return createPortal(
    <div
      className="print:hidden fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="w-full max-w-sm bg-paper p-6 text-ink shadow-xl"
      >
        <h2 id={titleId} className="font-serif text-2xl text-ink">
          {PRINT_GATE_TITLE}
        </h2>
        <p id={bodyId} className="mt-3 text-sm text-ink-muted">
          {PRINT_GATE_BODY}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            ref={primary}
            href={`/signup?next=${next}`}
            className="block w-full bg-accent px-4 py-2.5 text-center font-medium text-paper transition-opacity hover:opacity-90"
          >
            Sign up free
          </a>
          <a
            href={`/login?next=${next}`}
            className="block w-full border border-taupe px-4 py-2.5 text-center text-ink transition-colors hover:border-ink"
          >
            Log in
          </a>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 self-center text-xs text-ink-faint underline hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
