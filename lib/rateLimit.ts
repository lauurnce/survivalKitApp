import { NextRequest } from "next/server";

// In-memory, per-IP sliding-window rate limiter. Mirrors the pattern already
// used across the public POST routes (events, progress, waitlist, run), but as
// a shared helper so new endpoints stay consistent. Each limiter instance owns
// its own bounded map.
const MAX_MAP_SIZE = 10_000;

export interface RateLimiter {
  check(key: string): boolean; // true => limited (reject)
}

export function createRateLimiter(maxPerWindow: number, windowMs = 60_000): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string): boolean {
      const now = Date.now();

      // Prune the map if it grows too large, to bound memory.
      if (hits.size >= MAX_MAP_SIZE) {
        for (const [k, ts] of hits) {
          if (ts.every((t) => now - t >= windowMs)) hits.delete(k);
          if (hits.size < MAX_MAP_SIZE * 0.8) break;
        }
      }

      const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (timestamps.length >= maxPerWindow) return true;
      timestamps.push(now);
      hits.set(key, timestamps);
      return false;
    },
  };
}

// Prefer x-real-ip (set by Vercel, not client-spoofable). Fall back to the LAST
// x-forwarded-for hop (the one added by our proxy), never the first
// (client-controlled), then to a constant so a missing header can't bypass.
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}
