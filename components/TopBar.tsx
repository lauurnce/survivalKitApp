"use client";

import Link from "next/link";
import { ThemeIcon, toggleTheme } from "@/components/ThemeToggle";
import { useSession } from "@/hooks/useSession";

// Session is resolved client-side (useSession) so the (main) layout can stay
// static: the prerendered HTML always says "Log in", and a signed-in reader
// sees it switch to "My Account" once /api/me answers.
export function TopBar() {
  const { signedIn } = useSession();
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="w-9 h-9 flex items-center justify-center border border-ink-faint/30 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
      >
        <ThemeIcon />
      </button>
      <Link
        href={signedIn ? "/account" : "/login"}
        data-tour="landing-login"
        className="h-9 flex items-center border border-ink-faint/30 bg-paper px-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
      >
        {signedIn ? "My Account" : "Log in"}
      </Link>
    </div>
  );
}