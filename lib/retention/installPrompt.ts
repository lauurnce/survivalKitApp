// When to suggest "Add to home screen".
//
// Only to a device that has already read two or more lessons: asking a
// one-lesson drive-by reader is noise, and a home-screen icon is worth most
// to the student who is already coming back. Never inside an app (already
// installed), never inside Messenger/Facebook's in-app browser (it cannot
// install), and not again for three weeks after "Not now".

export const INSTALL_DISMISSED_KEY = "bsit_install_prompt_dismissed";
export const INSTALL_SNOOZE_DAYS = 21;
export const INSTALL_MIN_LESSONS = 2;

export type InstallPlatform = "android" | "ios-safari" | "in-app" | "other";

export function detectInstallPlatform(ua: string): InstallPlatform {
  if (/FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|Line\//i.test(ua)) return "in-app";
  if (/iPhone|iPad|iPod/i.test(ua)) {
    // Only Safari itself can add to the home screen on older iOS; Chrome
    // (CriOS), Firefox (FxiOS) and others report their own token.
    return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) ? "ios-safari" : "other";
  }
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export interface InstallPromptState {
  platform: InstallPlatform;
  /** Already running as an installed app. */
  standalone: boolean;
  /** Android: the browser handed us a beforeinstallprompt event. */
  canPrompt: boolean;
  lessonsRead: number;
  /** Epoch ms of the last "Not now", or null. */
  dismissedAt: number | null;
  now: number;
}

export function shouldOfferInstall(s: InstallPromptState): boolean {
  if (s.standalone || s.lessonsRead < INSTALL_MIN_LESSONS) return false;
  if (s.dismissedAt !== null && s.now - s.dismissedAt < INSTALL_SNOOZE_DAYS * 86_400_000) return false;
  if (s.platform === "ios-safari") return true;
  // Android and desktop Chromium: only when the browser says it can install.
  return s.platform !== "in-app" && s.canPrompt;
}

export function readDismissedAt(): number | null {
  try {
    const raw = localStorage.getItem(INSTALL_DISMISSED_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function writeDismissedAt(now: number): void {
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(now));
  } catch {
    // Storage blocked: the prompt may come back next visit. Acceptable.
  }
}
