const MOBILE_RE = /Android|iPhone|iPad|Mobile/i;

export function getDeviceType(userAgent: string): "mobile" | "desktop" {
  return MOBILE_RE.test(userAgent) ? "mobile" : "desktop";
}
