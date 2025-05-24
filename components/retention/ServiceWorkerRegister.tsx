"use client";

import { useEffect } from "react";
import { logEvent } from "@/lib/analytics";

export const SERVICE_WORKER_URL = "/sw.js";

/**
 * Registers public/sw.js, which keeps opened lessons readable offline.
 * Production only: in `next dev` a worker caching pages would serve stale
 * builds. Waits for `load` so registration never competes with the page's
 * own requests on a slow connection.
 */
export function registerServiceWorker(
  nav: Navigator = navigator,
  isProduction = process.env.NODE_ENV === "production",
): boolean {
  if (!isProduction || !("serviceWorker" in nav)) return false;
  const register = () => {
    nav.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/" }).catch(() => {
      // Blocked (private mode, some in-app browsers): the site works as before.
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
  return true;
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
    // Fires however the install happened: our prompt or the browser menu.
    const onInstalled = () => void logEvent("pwa_installed");
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);
  return null;
}
