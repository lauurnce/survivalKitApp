/**
 * Silent-tracker detection for the ops (PULSE) collector.
 *
 * The public reader/read counters are written fire-and-forget by /api/events
 * through the record_visit RPC (lib/readCounting.ts). If that path breaks — a
 * revoked grant, a changed RPC signature, a limiter that fails closed, a
 * tracker that stops mounting — nothing errors for the visitor and the
 * numbers on /year simply freeze. That happened once already (Sep 2026, the
 * rate limiter failing closed), and it was noticed by the owner, not by a
 * report.
 *
 * Every counted read touches counter_log.last_read_at (a new row, or a repeat
 * read after record_visit's 10-minute window). So "lessons were opened in the
 * last 24h, yet no counter_log row was touched" means the tracker is silent.
 *
 * Counts only, never rows: head:true count queries, no device ids.
 */

import type { Metric } from "./metrics";

export const READ_COUNTER_WINDOW_HOURS = 24;

export interface ReadCounterCounts {
  /** module_open events in the window. Null when not read. */
  lessonOpens: number | null;
  /** counter_log rows whose last_read_at falls in the window. Null when not read. */
  counterTouches: number | null;
}

export interface ReadCounterSignal extends ReadCounterCounts {
  windowHours: number;
  /** Null when either count is unknown — never a guessed "ok". */
  flagged: boolean | null;
}

export function readCounterSignal(counts: ReadCounterCounts): ReadCounterSignal {
  const { lessonOpens, counterTouches } = counts;
  return {
    ...counts,
    windowHours: READ_COUNTER_WINDOW_HOURS,
    flagged:
      lessonOpens === null || counterTouches === null
        ? null
        : lessonOpens > 0 && counterTouches === 0,
  };
}

/** Rows for the PULSE health table. Labels are stable across runs. */
export function readCounterMetrics(signal: ReadCounterSignal): Metric[] {
  return [
    { label: `Lesson opens ${signal.windowHours}h`, value: signal.lessonOpens },
    { label: `Reader counter updates ${signal.windowHours}h`, value: signal.counterTouches },
    {
      label: "Reader counter silent",
      value: signal.flagged === null ? null : signal.flagged ? "FLAG" : "ok",
    },
  ];
}
