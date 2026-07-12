import type { MetadataRoute } from "next";

// Lets students install the app from the browser menu ("Add to Home Screen"),
// which is the cheapest recurring-visit channel we have on mobile.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BSIT Survival Kit",
    short_name: "BSIT Kit",
    description:
      "Module notes, programming guides, and reviewers with answer keys for BSIT students.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F3",
    theme_color: "#1A1A1A",
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
