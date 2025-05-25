"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "@/lib/analytics";
import { parseLessonPath } from "@/lib/retention/recentLessons";

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

/**
 * Ask the worker to keep a copy of this lesson. Needed because the first
 * lesson loads before the worker controls the tab, and lesson-to-lesson
 * moves are client-side fetches the worker never sees as page loads. The
 * worker skips lessons it already has, so this costs one page download per
 * new lesson at most.
 */
export function saveLessonForOffline(
  pathname: string,
  nav: Navigator = navigator,
  isProduction = process.env.NODE_ENV === "production",
): boolean {
  if (!isProduction || !("serviceWorker" in nav) || !parseLessonPath(pathname)) return false;
  nav.serviceWorker.ready
    .then((reg) => reg.active?.postMessage({ type: "SAVE_LESSON", url: pathname }))
    .catch(() => {});
  return true;
}

export function ServiceWorkerRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) saveLessonForOffline(pathname);
  }, [pathname]);

  useEffect(() => {
    registerServiceWorker();
    // Fires however the install happened: our prompt or the browser menu.
    const onInstalled = () => void logEvent("pwa_installed");
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);
  return null;
}
