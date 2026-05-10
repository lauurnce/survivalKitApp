"use client";

import { useEffect } from "react";
import { logSessionEntry } from "@/lib/analytics";

// Mounted once in the root layout: records the visit's `enter` event, with
// its referrer and UTM attribution, on whichever page the visit lands on.
// lib/analytics dedupes it to one per tab session.
export function SessionEntryTracker() {
  useEffect(() => {
    void logSessionEntry();
  }, []);
  return null;
}
