interface Props {
  /** sm is the standard inline pill; md suits standalone spots like the account page. */
  size?: "sm" | "md";
  className?: string;
}

const SIZES = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
} as const;

// The one PRO pill. Every gated-content surface pulls this from here so the
// paid marker never drifts between the module grid, locked sections, and the
// account page.
export function ProBadge({ size = "sm", className = "" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 ${SIZES[size]} font-extrabold uppercase tracking-wider text-amber-950 shadow-sm ${className}`}
    >
      Pro
    </span>
  );
}
