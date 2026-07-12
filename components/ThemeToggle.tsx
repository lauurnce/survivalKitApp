"use client";

const SunIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {
    // private browsing / storage full — theme still applies for this visit
  }
}

// Both icons are always rendered and swapped purely via the `dark` class, so
// the button never flashes the wrong icon while React hydrates.
function ThemeIcon() {
  return (
    <>
      <span className="dark:hidden" aria-hidden="true">
        <MoonIcon />
      </span>
      <span className="hidden dark:inline" aria-hidden="true">
        <SunIcon />
      </span>
    </>
  );
}

// Fixed floating button — used on all pages except account dashboard
export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center border border-ink-faint/30 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
    >
      <ThemeIcon />
    </button>
  );
}

// Inline button — sits inside a flex row (account top bar)
export function ThemeToggleInline() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="w-8 h-8 flex items-center justify-center border border-ink-faint/30 bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
    >
      <ThemeIcon />
    </button>
  );
}
