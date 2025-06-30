"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { logEvent } from "@/lib/analytics";
import { buildUnlockHref, modulePath } from "@/lib/subscribeRedirect";
import { usePrintAccess, type PrintAccess } from "@/components/PrintAccess";
import {
  consumePrintAfterUnlock,
  consumePrintParam,
  rememberPrintAfterUnlock,
  waitForPrintReady,
} from "@/lib/printReady";

interface Ids {
  yearId: string;
  subjectId: string;
  moduleId: string;
}

interface Props extends Ids {
  subjectTitle: string;
}

export const PRINT_GATE_TITLE = "Sign up to download this lesson";
export function printGateBody(subjectTitle: string): string {
  return `Downloading and printing lessons is for ${subjectTitle} subscribers. Sign up free or log in first, and you'll come straight back to this lesson.`;
}

export function printUnpaidTitle(subjectTitle: string): string {
  return `Downloading lessons is part of the ${subjectTitle} unlock`;
}
export function printUnpaidBody(subjectTitle: string): string {
  return `Unlock ${subjectTitle} to print or save any of its lessons as a PDF. After checkout you'll come back here and the download will start.`;
}
export const PRINT_UNPAID_CTA = "Unlock to download →";

/** Where the sign-up gate sends the student, and what brings the dialog back. */
export function printReturnPath({ yearId, subjectId, moduleId }: Ids): string {
  return `${modulePath(yearId, subjectId, moduleId)}?print=1`;
}

/**
 * The unpaid gate's link into /unlock. `from` is the plain module path: the
 * checkout return validator (lib/subscribeRedirect.ts parseModuleRoute)
 * rejects any query string, so a `?print=1` there would send the payer to
 * /account instead of back to this lesson. The print intent travels in
 * sessionStorage instead (rememberPrintAfterUnlock).
 */
export function printUnlockHref({ yearId, subjectId, moduleId }: Ids): string {
  return buildUnlockHref({ yearId, subjectId, from: modulePath(yearId, subjectId, moduleId) });
}

type Gate = "signup" | "unpaid" | null;

// "Print / Save as PDF" on the module reader. The browser's print dialog
// covers both on every platform (Android/iOS/desktop offer "Save as PDF"), and
// app/globals.css carries the @media print stylesheet.
//
// Downloading is part of the subject unlock:
// - signed out: a sign-up prompt, returning here with ?print=1;
// - signed in without this subject: an unlock prompt into /unlock;
// - a subject plan for this subject, or a year plan for its year: the dialog,
//   once any paid bodies still on their way have landed.
// The page is prerendered and the same for everyone, so who is reading is only
// known after hydration (components/PrintAccess.tsx); a click that lands before
// the answer waits for it rather than guessing.
export function PrintButton(props: Props) {
  const { yearId, subjectId, moduleId, subjectTitle } = props;
  const { access, probe } = usePrintAccess(yearId, subjectId);
  const [gate, setGate] = useState<Gate>(null);
  const waitingForAccess = useRef(false);
  const closeGate = useCallback(() => setGate(null), []);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const printWhenReady = useCallback(() => {
    void waitForPrintReady().then(() => {
      if (mounted.current) window.print();
    });
  }, []);

  const proceed = useCallback(
    (decided: Exclude<PrintAccess, "loading">) => {
      if (decided === "entitled") {
        printWhenReady();
      } else if (decided === "signed-out") {
        setGate("signup");
        void logEvent("print_gate_shown", { year_id: yearId, subject_id: subjectId, module_id: moduleId });
      } else {
        // No print_gate_shown here: /api/events stores no event properties, so
        // it could not be told apart from the sign-up prompt. print_click
        // still records the attempt.
        setGate("unpaid");
      }
    },
    [yearId, subjectId, moduleId, printWhenReady],
  );

  function handleClick() {
    void logEvent("print_click", { year_id: yearId, subject_id: subjectId, module_id: moduleId });
    if (access === "loading") {
      waitingForAccess.current = true;
      return;
    }
    proceed(access);
  }

  useEffect(() => {
    if (access === "loading" || !waitingForAccess.current) return;
    waitingForAccess.current = false;
    proceed(access);
  }, [access, proceed]);

  // Coming back to print, once access is known:
  // - ?print=1 from the sign-up gate's sign-up/log-in: print if entitled,
  //   otherwise show the unlock prompt (an account alone does not unlock it);
  // - the intent the unlock prompt parked before checkout: print once the
  //   payment is confirmed, and do nothing if it never was.
  // Both markers are cleared on first read, so a reload or a shared link
  // never re-triggers them.
  const returnHandled = useRef(false);
  useEffect(() => {
    if (access === "loading" || returnHandled.current) return;
    returnHandled.current = true;
    const fromSignup = consumePrintParam();
    const fromUnlock = consumePrintAfterUnlock(modulePath(yearId, subjectId, moduleId));
    if (access === "entitled" && (fromSignup || fromUnlock)) {
      printWhenReady();
    } else if (access === "unpaid" && fromSignup) {
      // A one-shot reaction to the URL marker, read once access is known —
      // not state derivable during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGate("unpaid");
    }
  }, [access, yearId, subjectId, moduleId, printWhenReady]);

  const locked = access === "unpaid";

  return (
    <>
      {probe}
      <button
        type="button"
        onClick={handleClick}
        aria-haspopup={access === "entitled" ? undefined : "dialog"}
        className="print:hidden inline-flex items-center gap-2 border border-paper/30 px-3 py-2 font-mono text-label-sm uppercase tracking-[0.12em] text-taupe hover:text-paper hover:border-paper/60 transition-colors duration-150"
      >
        {locked ? (
          <svg
            aria-hidden="true"
            data-testid="print-lock"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="7" width="10" height="7.5" rx="1" />
            <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6V1.5h8V6M4 12H2.5A1 1 0 0 1 1.5 11V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H12" />
            <path d="M4 9.5h8v5H4z" />
          </svg>
        )}
        Print / Save as PDF
        {locked && <span className="sr-only"> (locked)</span>}
      </button>
      {gate === "signup" && (
        <GateDialog
          title={PRINT_GATE_TITLE}
          body={printGateBody(subjectTitle)}
          onClose={closeGate}
          actions={[
            { label: "Sign up free", href: `/signup?next=${encodeURIComponent(printReturnPath(props))}`, primary: true },
            { label: "Log in", href: `/login?next=${encodeURIComponent(printReturnPath(props))}` },
          ]}
        />
      )}
      {gate === "unpaid" && (
        <GateDialog
          title={printUnpaidTitle(subjectTitle)}
          body={printUnpaidBody(subjectTitle)}
          onClose={closeGate}
          actions={[
            {
              label: PRINT_UNPAID_CTA,
              href: printUnlockHref(props),
              primary: true,
              onClick: () => rememberPrintAfterUnlock(modulePath(yearId, subjectId, moduleId)),
            },
          ]}
        />
      )}
    </>
  );
}

interface GateAction {
  label: string;
  href: string;
  primary?: boolean;
  onClick?: () => void;
}

function GateDialog({
  title,
  body,
  actions,
  onClose,
}: {
  title: string;
  body: string;
  actions: GateAction[];
  onClose: () => void;
}) {
  const titleId = useId();
  const bodyId = useId();
  const primary = useRef<HTMLAnchorElement>(null);

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
          {title}
        </h2>
        <p id={bodyId} className="mt-3 text-sm text-ink-muted">
          {body}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {actions.map((action) => (
            <a
              key={action.label}
              ref={action.primary ? primary : undefined}
              href={action.href}
              onClick={action.onClick}
              className={
                action.primary
                  ? "block w-full bg-accent px-4 py-2.5 text-center font-medium text-paper transition-opacity hover:opacity-90"
                  : "block w-full border border-taupe px-4 py-2.5 text-center text-ink transition-colors hover:border-ink"
              }
            >
              {action.label}
            </a>
          ))}
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
