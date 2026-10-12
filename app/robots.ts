import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/appOrigin";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private and operational surfaces out of search results.
      disallow: ["/api/", "/admin", "/account", "/playground"],
    },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
