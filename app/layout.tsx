import type { Metadata } from "next";
import { canonicalOrigin } from "@/lib/appOrigin";
import { viewportConfig } from "@/lib/viewport";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SessionEntryTracker } from "@/components/SessionEntryTracker";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/csp";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = canonicalOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // "./" resolves against each page's own pathname (query string dropped),
  // so every route inherits a self-referencing canonical on the custom domain
  // without per-page boilerplate, and /search?q=… variants collapse to
  // /search. A page that needs a different canonical overrides `alternates`.
  alternates: { canonical: "./" },
  title: {
    default: "BSIT Survival Kit",
    template: "%s — BSIT Survival Kit",
  },
  description:
    "Module notes, programming guides, and reviewers with answer keys for BSIT students — organized by year and subject.",
  openGraph: {
    type: "website",
    siteName: "BSIT Survival Kit",
    title: "BSIT Survival Kit",
    description:
      "Module notes, programming guides, and reviewers with answer keys for BSIT students — organized by year and subject.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "BSIT Survival Kit",
    description:
      "Module notes, programming guides, and reviewers with answer keys for BSIT students — organized by year and subject.",
  },
};

export const viewport = viewportConfig;

// Must stay free of request-time APIs (headers(), cookies()): any of them here
// opts every route in the app out of static rendering and CDN caching.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* No nonce: allowed by its sha256 under the nonce policy and by
            'unsafe-inline' under the static-page policy (lib/csp.ts). */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <SessionEntryTracker />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-navy focus:text-paper focus:px-4 focus:py-2 font-sans text-sm"
        >
          Skip to content
        </a>
        <div id="content" className="flex-1">{children}</div>
        <footer className="border-t border-ink-faint/20 px-6 py-4 md:px-16">
          <div className="max-w-wide mx-auto flex flex-wrap items-center justify-between gap-2">
            <p className="font-sans text-[11px] text-ink-faint leading-relaxed">
              Study guide — original explanations. Content covers standard curriculum topics.
            </p>
            <div className="flex items-center gap-4">
              <a href="/faq" className="font-sans text-[11px] text-ink-faint hover:text-ink-muted transition-colors">
                FAQ
              </a>
              <a href="/privacy" className="font-sans text-[11px] text-ink-faint hover:text-ink-muted transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
