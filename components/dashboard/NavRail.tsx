"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pct } from "@/lib/account";

interface NavRailProps {
  overallDone: number;
  overallTotal: number;
}

interface NavItem {
  label: string;
  href: string;
  /** How this item's active state is derived from the current pathname. */
  match: "exact" | "startsWith";
  icon: (props: { className?: string }) => React.JSX.Element;
}

// Donut geometry: viewBox 80×80, radius leaves room for the 8px stroke.
const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/account", match: "exact", icon: HouseIcon },
  { label: "Subjects", href: "/year", match: "startsWith", icon: BookIcon },
  { label: "Roadmap", href: "/account#roadmap", match: "exact", icon: MapIcon },
  { label: "Resources", href: "/resources", match: "startsWith", icon: FolderIcon },
  { label: "Profile", href: "/account/profile", match: "startsWith", icon: PersonIcon },
];

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.href.includes("#")) return false; // same-page anchor, never "active"
  if (item.match === "exact") return pathname === item.href;
  return pathname.startsWith(item.href);
}

/**
 * Primary navigation rail for the account dashboard. Renders as a single
 * `<nav>`: a fixed-width vertical rail on `lg+` screens (brand block, nav
 * list, progress ring), and a horizontal scrollable tab strip below that —
 * same markup, responsive classes only.
 */
export function NavRail({ overallDone, overallTotal }: NavRailProps) {
  const pathname = usePathname();
  const percent = pct(overallDone, overallTotal);

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 overflow-x-auto border-b border-taupe/30 bg-paper lg:sticky lg:top-0 lg:min-h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-r"
    >
      {/* Brand block — desktop only */}
      <Link
        href="/"
        className="hidden shrink-0 flex-col gap-1 border-b border-taupe/30 px-6 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent lg:flex"
      >
        <span className="font-serif text-2xl tracking-wide text-ink">BSIT</span>
        <span className="label-sm">Survival kit</span>
      </Link>

      {/* Nav items */}
      <ul className="flex shrink-0 items-stretch gap-1 px-2 py-2 lg:flex-col lg:gap-1 lg:px-3 lg:py-5">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Progress ring block — desktop only */}
      <div className="mt-auto hidden flex-col items-center gap-3 border-t border-taupe/30 px-6 py-6 lg:flex">
        <div
          role="img"
          aria-label={`Overall progress: ${percent}% complete — ${overallDone} of ${overallTotal} modules done`}
          className="relative h-[72px] w-[72px] shrink-0"
        >
          <svg viewBox="0 0 80 80" aria-hidden="true" className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-ink-faint/20"
            />
            {percent > 0 && (
              <circle
                cx="40"
                cy="40"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
                className="text-accent"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-base leading-none text-ink">
              {overallDone} / {overallTotal}
            </span>
          </div>
        </div>
        <span className="label-sm text-center">Modules done</span>
        <p className="text-center text-xs italic text-ink-muted font-serif">
          Across every year and subject you&apos;ve unlocked.
        </p>
      </div>
    </nav>
  );
}

// ── Icons — 20px inline line icons, stroke currentColor, stroke-width 1.5 ────

function HouseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 9.5L10 3l7 6.5M4.5 8.5V17h11V8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 17v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 4.5c1.5-.7 3.5-.7 6 0v11c-2.5-.7-4.5-.7-6 0v-11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 4.5c-1.5-.7-3.5-.7-6 0v11c2.5-.7 4.5-.7 6 0v-11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 4L3 5.5v11L7 15m0-11l6 2m-6-2v11m6-9l4-1.5v11L13 15m0-11v11m0-11l-6 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3 5.5c0-.55.45-1 1-1h3.5l1.5 2H16c.55 0 1 .45 1 1v7c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-9z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="6.5" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M3.5 17c1-3.5 3.8-5.5 6.5-5.5s5.5 2 6.5 5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
