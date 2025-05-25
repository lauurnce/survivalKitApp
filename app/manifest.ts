import type { MetadataRoute } from "next";
import { PWA_START_URL } from "@/lib/retention/pwa";

// Lets students install the app from the browser menu ("Add to Home Screen"),
// which is the cheapest recurring-visit channel we have on mobile. With the
// service worker (public/sw.js) and the 192/512 icons, Android Chrome now
// treats the site as installable and offers its own install prompt.
// start_url is UTM-tagged so home-screen launches are countable (see
// lib/retention/pwa.ts).

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BSIT Survival Kit",
    short_name: "BSIT Kit",
    description:
      "Module notes, programming guides, and reviewers with answer keys for BSIT students.",
    start_url: PWA_START_URL,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "en-PH",
    categories: ["education"],
    background_color: "#F7F5F3",
    theme_color: "#1A1A1A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Subjects by year", short_name: "Subjects", url: "/year?utm_source=pwa&utm_medium=shortcut" },
      { name: "Search", url: "/search?utm_source=pwa&utm_medium=shortcut" },
    ],
  };
}
