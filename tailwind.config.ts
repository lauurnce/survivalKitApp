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
        paper: "#F7F5F3",
        ink: "#1A1F23",
        "ink-muted": "#6B6F75",
        "ink-faint": "#A8ADB5",
        accent: "#E0492B",
        "accent-dark": "#B83820",
        navy: "#1A1A1A",
        taupe: "#BDB9B2",
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
