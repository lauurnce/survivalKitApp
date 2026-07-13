import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-muted": "rgb(var(--color-ink-muted) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-dark": "rgb(var(--color-accent-dark) / <alpha-value>)",
        navy: "rgb(var(--color-navy) / <alpha-value>)",
        taupe: "rgb(var(--color-taupe) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2rem, 5vw, 4rem)", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.5rem, 3.5vw, 2.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "label-sm": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.12em" }],
        "label-md": ["0.75rem", { lineHeight: "1", letterSpacing: "0.1em" }],
      },
      maxWidth: {
        prose: "68ch",
        wide: "88ch",
      },
      spacing: {
        "section": "6rem",
        "section-sm": "3rem",
      },
    },
  },
  plugins: [],
};

export default config;
