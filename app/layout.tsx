import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "BSIT Survival Kit",
  description: "Your complete study companion for BSIT modules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-paper text-ink font-sans min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-ink-faint/20 px-6 py-4 md:px-16">
          <p className="font-sans text-[11px] text-ink-faint leading-relaxed">
            Study guide — original explanations. Content covers standard curriculum topics.
          </p>
        </footer>
      </body>
    </html>
  );
}
