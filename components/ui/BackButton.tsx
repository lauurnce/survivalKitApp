"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** Fallback href if no history */
  fallbackHref?: string;
  /** Button label */
  label?: string;
  className?: string;
}

export function BackButton({ fallbackHref = "/account", label = "Back to dashboard", className = "" }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-faint/20 bg-paper text-ink hover:bg-ink-faint/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M13 6l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}