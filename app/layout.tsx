import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
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
