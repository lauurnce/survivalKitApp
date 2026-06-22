// Phones and tablets. Each alternative is a real, unambiguous device token.
// "Mobile" is matched as a whole word so a stray substring can't false-positive.
const MOBILE_RE =
  /(iPhone|iPod|iPad|Android|Windows Phone|webOS|BlackBerry|BB10|IEMobile|Opera Mini|Silk)|\bMobile\b/i;

export interface DeviceSignals {
  screenWidth?: number | null;
  maxTouchPoints?: number | null;
}

// A laptop/desktop has a wide viewport and no touch. This is far more reliable
// than UA parsing, which misreads touch laptops and Chromebooks as mobile.
const DESKTOP_MIN_WIDTH = 1024;

export function getDeviceType(
  userAgent: string,
  signals?: DeviceSignals
): "mobile" | "desktop" {
  const width = signals?.screenWidth;
  const touch = signals?.maxTouchPoints;

  const uaIsMobile = !!userAgent && MOBILE_RE.test(userAgent);

  // Trust real client measurements first — they're far more reliable than the UA.
  if (typeof width === "number" && width > 0) {
    // Narrow viewport is always a phone-sized device.
    if (width < DESKTOP_MIN_WIDTH) return "mobile";

    // Wide viewport: a non-touch screen is unambiguously a desktop. With touch
    // it could be a touch laptop OR a large tablet — only call it mobile when the
    // UA explicitly says it's a phone/tablet, otherwise treat as desktop. This
    // fixes touch laptops/Chromebooks being misread as mobile.
    if (touch == null || touch === 0) return "desktop";
    return uaIsMobile ? "mobile" : "desktop";
  }

  // No usable client signals — fall back to UA parsing.
  if (!userAgent) return "desktop";
  return uaIsMobile ? "mobile" : "desktop";
}
