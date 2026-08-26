interface ProgressRingProps {
  /** Completion percentage (0-100) */
  percent: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Show percentage text in center */
  showText?: boolean;
  /** Custom color class */
  colorClass?: string;
  /** Accessibility label */
  ariaLabel?: string;
}

export function ProgressRing({
  percent,
  size = 48,
  strokeWidth = 4,
  showText = true,
  colorClass = "text-accent",
  ariaLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Progress: ${percent}% complete`}
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-ink-faint/20"
        />
        {percent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={colorClass}
            style={{ transition: "stroke-dashoffset 600ms ease-out" }}
          />
        )}
      </svg>
      {showText && (
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-medium text-ink">
          {percent}%
        </span>
      )}
    </div>
  );
}