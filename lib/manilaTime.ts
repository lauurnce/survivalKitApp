// Manila clock and calendar for anything the dashboard shows as a time or a
// date. The server runs in UTC and the browser runs wherever the reader is, so
// formatting without a fixed zone gives "Good morning" at 2 PM, end dates a day
// early, and server/client hydration mismatches. Users and billing are in the
// Philippines, so every human-facing date is pinned to Asia/Manila and a fixed
// locale. The output is the same on the server and in any browser.

export const MANILA_TZ = "Asia/Manila";
const LOCALE = "en-US";

/** Hour of day (0-23) on the Manila clock at `now`. */
export function manilaHour(now: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat(LOCALE, {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: MANILA_TZ,
  }).format(now);
  return Number(hour);
}

/** Dashboard greeting for the Manila time of day. */
export function greetingFor(now: Date = new Date()): string {
  const hour = manilaHour(now);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export type ManilaDateStyle = "long" | "short" | "dateTime";

const STYLES: Record<ManilaDateStyle, Intl.DateTimeFormatOptions> = {
  long: { month: "long", day: "numeric", year: "numeric" }, // December 1, 2026
  short: { month: "short", day: "numeric", year: "numeric" }, // Dec 1, 2026
  dateTime: { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }, // Dec 1, 2026, 7:30 AM
};

/**
 * Formats an ISO timestamp on the Manila calendar. Returns null when the value
 * doesn't parse, so callers decide what to show instead of "Invalid Date".
 */
export function formatManilaDate(iso: string, style: ManilaDateStyle = "long"): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(LOCALE, { ...STYLES[style], timeZone: MANILA_TZ }).format(d);
}
