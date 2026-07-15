import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
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

const SITE_URL = "https://survival-kit-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set by middleware.ts per request; required to run under the nonce-based
  // CSP script-src (see middleware.ts for why 'unsafe-inline' isn't used).
  const nonce = (await headers()).get("x-csp-nonce") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          nonce={nonce}
          // First visit follows the device's dark-mode setting; an explicit
          // toggle choice (stored under 'theme') always wins afterwards.
          // localStorage can throw in private browsing — fall back to system.
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=null;try{t=localStorage.getItem('theme');}catch(e){}var dark=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
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
            <a href="/privacy" className="font-sans text-[11px] text-ink-faint hover:text-ink-muted transition-colors">
              Privacy Policy
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
