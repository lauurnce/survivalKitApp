// Waiting for the reader to be print-ready before opening the print dialog
// on a return trip (?print=1).
//
// A subscriber's reviewer bodies arrive client-side after hydration
// (components/ModuleSections.tsx). While that is still possible, the reader
// renders a hidden [data-reader-unlock="pending"] marker; printing before it
// clears would print the locked view of a page they paid for.

export const PENDING_SELECTOR = '[data-reader-unlock="pending"]';

export function waitForPrintReady(
  { timeoutMs = 5000, intervalMs = 150, doc = document }: { timeoutMs?: number; intervalMs?: number; doc?: Document } = {},
): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      if (!doc.querySelector(PENDING_SELECTOR) || Date.now() - started >= timeoutMs) {
        // One more frame so the swapped-in bodies are laid out before print.
        requestAnimationFrame(() => resolve());
        return;
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}

/** True when the URL asks for the print dialog; strips the marker either way. */
export function consumePrintParam(): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get("print") !== "1") return false;
  url.searchParams.delete("print");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

// Print-after-unlock: the unpaid print prompt sends the reader to /unlock and
// on through checkout, and the payment comes back to the plain module path
// (lib/subscribeRedirect.ts accepts no query on a return path, so ?print=1
// cannot ride along). The intent is parked in this tab's sessionStorage
// instead, which survives the round trip to the payment page.
export const PRINT_AFTER_UNLOCK_KEY = "bsit:print-after-unlock";
/** An intent older than this is from an abandoned checkout, not this return. */
export const PRINT_AFTER_UNLOCK_TTL_MS = 60 * 60 * 1000;

export function rememberPrintAfterUnlock(path: string, now: number = Date.now()): void {
  try {
    sessionStorage.setItem(PRINT_AFTER_UNLOCK_KEY, JSON.stringify({ path, at: now }));
  } catch {
    // Storage blocked: the reader just presses the button again after paying.
  }
}

/**
 * True when this tab parked a print-after-unlock intent for `path` within the
 * TTL. Clears any parked intent either way, so it fires at most once and a
 * reader who backed out of checkout is not prompted on a later visit.
 */
export function consumePrintAfterUnlock(path: string, now: number = Date.now()): boolean {
  try {
    const raw = sessionStorage.getItem(PRINT_AFTER_UNLOCK_KEY);
    if (raw === null) return false;
    sessionStorage.removeItem(PRINT_AFTER_UNLOCK_KEY);
    const parsed = JSON.parse(raw) as { path?: unknown; at?: unknown };
    return (
      parsed.path === path &&
      typeof parsed.at === "number" &&
      now - parsed.at >= 0 &&
      now - parsed.at <= PRINT_AFTER_UNLOCK_TTL_MS
    );
  } catch {
    return false;
  }
}
