"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard behaviour for the account modals: focus moves into the dialog when
 * it opens (to `initialFocus`, else its first focusable control), Tab and
 * Shift+Tab wrap inside it, Escape asks to close, and focus returns to the
 * control that opened it when it unmounts. Pair with role="dialog" and
 * aria-modal on the panel.
 */
export function useModalDialog(
  panelRef: RefObject<HTMLElement | null>,
  onRequestClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
) {
  // Read through a ref so a new callback each render doesn't re-run the
  // effect, which would steal focus back to the first field on every keystroke.
  const closeRef = useRef(onRequestClose);
  useEffect(() => {
    closeRef.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const target = initialFocus?.current ?? panel.querySelector<HTMLElement>(FOCUSABLE);
    (target ?? panel).focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (!panel) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
    // Mount-only: the panel and initial-focus refs are stable for a modal's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
