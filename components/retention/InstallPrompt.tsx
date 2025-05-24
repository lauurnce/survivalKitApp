"use client";

import { useEffect, useState } from "react";
import { logEvent } from "@/lib/analytics";
import { readRecentLessons } from "@/lib/retention/recentLessons";
import {
  detectInstallPlatform,
  readDismissedAt,
  shouldOfferInstall,
  writeDismissedAt,
  type InstallPlatform,
} from "@/lib/retention/installPrompt";

// The non-standard event Chromium fires when a site is installable.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  try {
    return (
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

// "Save BSIT Kit to your home screen" for a device that has read two or
// more lessons (rules: lib/retention/installPrompt.ts). Android gets the
// browser's own install dialog; iPhone Safari, which has none, gets the
// two-tap instructions. Nothing renders for anyone else.
export function InstallPrompt({ className = "" }: { className?: string }) {
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const detected = detectInstallPlatform(navigator.userAgent);
    const base = {
      platform: detected,
      standalone: isStandalone(),
      lessonsRead: readRecentLessons().length,
      dismissedAt: readDismissedAt(),
      now: Date.now(),
    };
    // Browser-only facts (UA, storage, display mode): set after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detected);
    setVisible(shouldOfferInstall({ ...base, canPrompt: false }));

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(shouldOfferInstall({ ...base, canPrompt: true }));
    };
    const onInstalled = () => setVisible(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (visible) void logEvent("install_prompt_shown");
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    writeDismissedAt(Date.now());
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "dismissed") dismiss();
    else setVisible(false);
  };

  return (
    <aside
      aria-label="Save to home screen"
      className={`max-w-wide border border-ink-faint p-5 flex flex-col gap-3 ${className}`}
    >
      <p className="font-serif text-xl text-ink">Keep your lessons one tap away</p>
      <p className="font-sans text-sm text-ink-muted">
        {platform === "ios-safari" ? (
          <>
            Tap <span className="text-ink">Share</span>, then{" "}
            <span className="text-ink">Add to Home Screen</span>. Lessons you have opened also work
            with no signal.
          </>
        ) : (
          <>Add BSIT Kit to your home screen. Lessons you have opened also work with no signal.</>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-6">
        {platform !== "ios-safari" && deferred && (
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-2 bg-navy text-paper font-sans text-sm uppercase tracking-widest px-5 py-3 hover:bg-ink transition-colors duration-150"
          >
            Add to home screen
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="font-sans text-sm uppercase tracking-widest text-ink-muted hover:text-ink transition-colors duration-150"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
