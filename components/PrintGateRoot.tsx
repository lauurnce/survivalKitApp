"use client";

import { useSession } from "@/hooks/useSession";

export const PRINT_SIGNED_OUT_NOTICE = "Sign up free at tryi2i.com to download this lesson";

// Keeps a signed-out reader's Ctrl/Cmd+P from producing a usable printout.
//
// The reader page is prerendered once for every visitor, so its static HTML
// is the signed-out state: data-print-gate="locked". Only once useSession
// confirms a signed-in reader does it flip to "open". In print, a locked
// root hides the lesson and prints a single notice instead (app/globals.css,
// "Print gate"); on screen nothing changes either way.
export function PrintGateRoot({ children }: { children: React.ReactNode }) {
  const { ready, signedIn } = useSession();
  const open = ready && signedIn;
  return (
    <div className="print-gate-root" data-print-gate={open ? "open" : "locked"}>
      <div className="print-gate-notice" aria-hidden="true">
        <p className="font-mono text-label-md uppercase tracking-[0.1em]">BSIT Survival Kit</p>
        <p className="font-serif text-3xl">{PRINT_SIGNED_OUT_NOTICE}</p>
      </div>
      <div className="print-gate-content">{children}</div>
    </div>
  );
}
