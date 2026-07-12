import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private and operational surfaces out of search results.
      disallow: ["/api/", "/admin", "/account", "/playground"],
    },
    sitemap: "https://survival-kit-app.vercel.app/sitemap.xml",
  };
}
