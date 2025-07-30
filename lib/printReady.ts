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
