import { describe, expect, it } from "vitest";
import { INSTALL_SNOOZE_DAYS, detectInstallPlatform, shouldOfferInstall, type InstallPromptState } from "./installPrompt";

const UA = {
  androidChrome: "Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36",
  messenger: "Mozilla/5.0 (Linux; Android 14; SM-A155F; wv) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36 [FB_IAB/MESSENGER;FBAV/480.0;]",
  iosSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  iosChrome: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1",
  desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0 Safari/537.36",
};

describe("detectInstallPlatform", () => {
  it("tells the platforms apart", () => {
    expect(detectInstallPlatform(UA.androidChrome)).toBe("android");
    expect(detectInstallPlatform(UA.messenger)).toBe("in-app");
    expect(detectInstallPlatform(UA.iosSafari)).toBe("ios-safari");
    expect(detectInstallPlatform(UA.iosChrome)).toBe("other");
    expect(detectInstallPlatform(UA.desktop)).toBe("other");
  });
});

describe("shouldOfferInstall", () => {
  const now = Date.UTC(2026, 9, 31);
  const base: InstallPromptState = {
    platform: "android",
    standalone: false,
    canPrompt: true,
    lessonsRead: 2,
    dismissedAt: null,
    now,
  };

  it("offers to a returning Android reader the browser can install for", () => {
    expect(shouldOfferInstall(base)).toBe(true);
  });

  it("waits for the second lesson", () => {
    expect(shouldOfferInstall({ ...base, lessonsRead: 1 })).toBe(false);
  });

  it("needs the browser's install event on Android", () => {
    expect(shouldOfferInstall({ ...base, canPrompt: false })).toBe(false);
  });

  it("offers iPhone Safari instructions without an event", () => {
    expect(shouldOfferInstall({ ...base, platform: "ios-safari", canPrompt: false })).toBe(true);
  });

  it("never offers inside Messenger, or once installed", () => {
    expect(shouldOfferInstall({ ...base, platform: "in-app" })).toBe(false);
    expect(shouldOfferInstall({ ...base, standalone: true })).toBe(false);
  });

  it("snoozes after Not now", () => {
    const day = 86_400_000;
    expect(shouldOfferInstall({ ...base, dismissedAt: now - 2 * day })).toBe(false);
    expect(shouldOfferInstall({ ...base, dismissedAt: now - (INSTALL_SNOOZE_DAYS + 1) * day })).toBe(true);
  });
});
