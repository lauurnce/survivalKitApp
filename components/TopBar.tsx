"use client";

import Link from "next/link";
import { ThemeIcon, toggleTheme } from "@/components/ThemeToggle";

interface TopBarProps {
  userId: string | null;
}

export function TopBar({ userId }: TopBarProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="w-9 h-9 flex items-center justify-center border border-ink-faint/30 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-150 rounded-xl"
      >
        <ThemeIcon />
      </button>
      <Link
        href={userId ? "/account" : "/login"}
        data-tour="landing-login"
        className="h-9 flex items-center border border-ink-faint/30 bg-paper px-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-paper transition-colors duration-150 rounded-xl"
      >
        {userId ? "My Account" : "Log in"}
      </Link>
    </div>
  );
}