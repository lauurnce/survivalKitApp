"use client";

import { useRef, useEffect, useState } from "react";
import type { ActivityData } from "@/lib/dashboard";

interface ActivityGraphProps {
  data: ActivityData;
  /** Compact mode for dashboard (smaller height, fewer details) */
  compact?: boolean;
  /** Show subscription overlay */
  showSubscriptionOverlay?: boolean;
  subscriptionItems?: Array<{ startedAt: string; endsAt: string; progressPct: number }>;
  className?: string;
}

export function ActivityGraph({
  data,
  compact = false,
  showSubscriptionOverlay = false,
  subscriptionItems = [],
  className = "",
}: ActivityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current?.parentElement) {
        setContainerWidth(svgRef.current.parentElement.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const height = compact ? 100 : 200;
  const padding = { top: 20, right: 20, bottom: compact ? 10 : 30, left: 30 };
  const innerHeight = height - padding.top - padding.bottom;

  // Flatten all days for continuous x-axis
  const allDays = data.weeks.flatMap(w => w.days);
  const totalDays = allDays.length;
  const maxEvents = Math.max(1, ...allDays.map(d => d.eventCount));

  // X scale: day index → x position
  const xScale = (index: number) => {
    const usableWidth = containerWidth || 360;
    const innerWidth = usableWidth - padding.left - padding.right;
    return padding.left + (index / Math.max(1, totalDays - 1)) * innerWidth;
  };

  // Y scale: event count → y position (inverted)
  const yScale = (count: number) => {
    return padding.top + innerHeight - (count / maxEvents) * innerHeight;
  };

  // Path data for line
  const linePath = allDays.map((day, i) => `${xScale(i)},${yScale(day.eventCount)}`).join(" ");
  const areaPath = [
    `M${xScale(0)},${height - padding.bottom}`,
    ...allDays.map((day, i) => `L${xScale(i)},${yScale(day.eventCount)}`),
    `L${xScale(totalDays - 1)},${height - padding.bottom}`,
    "Z",
  ].join(" ");

  // Subscription overlay segments
  const subscriptionSegments = subscriptionItems.map(sub => {
    const startDate = new Date(sub.startedAt);
    const endDate = new Date(sub.endsAt);
    const now = new Date();
    const totalMs = endDate.getTime() - startDate.getTime();
    const startOffset = totalMs > 0 ? (startDate.getTime() - (now.getTime() - 56 * 24 * 60 * 60 * 1000)) / totalMs : 0;
    const endOffset = totalMs > 0 ? (endDate.getTime() - (now.getTime() - 56 * 24 * 60 * 60 * 1000)) / totalMs : 1;
    const clampedStart = Math.max(0, Math.min(1, startOffset));
    const clampedEnd = Math.max(0, Math.min(1, endOffset));
    if (clampedEnd <= 0 || clampedStart >= 1) return null;
    return {
      x1: xScale(clampedStart * (totalDays - 1)),
      x2: xScale(clampedEnd * (totalDays - 1)),
    };
  }).filter((s): s is { x1: number; x2: number } => s !== null);

  // Weekend bands
  const weekendBands = allDays
    .map((day, i) => {
      const date = new Date(day.date);
      if (date.getDay() === 6) { // Saturday
        const satX = xScale(i);
        const sunX = i + 1 < totalDays ? xScale(i + 1) : satX + (xScale(1) - xScale(0));
        return { x: satX, width: sunX - satX };
      }
      return null;
    })
    .filter((b): b is { x: number; width: number } => b !== null);

  if (!containerWidth) return null;

  return (
    <div className={`relative ${className}`} style={{ width: "100%" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${containerWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-auto"
        role="img"
        aria-label="Activity graph showing daily events over 8 weeks"
      >
        <defs>
          {/* Gradient for area fill */}
          <linearGradient id="activity-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.25" />
            <stop offset="60%" stopColor="rgb(var(--color-accent))" stopOpacity="0.1" />
            <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
          </linearGradient>
          {/* Gradient for line */}
          <linearGradient id="activity-line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--color-accent))" />
            <stop offset="100%" stopColor="rgb(var(--color-accent-dark))" />
          </linearGradient>
          {/* Pulse animation for current week */}
          <style>{`
            @keyframes drawLine {
              to { stroke-dashoffset: 0; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.4); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .activity-line {
              animation: drawLine 1.2s ease-out forwards;
            }
            .activity-area {
              animation: fadeIn 0.8s ease-out 0.3s forwards;
              opacity: 0;
            }
            .current-week-pulse {
              animation: pulse 2s ease-in-out infinite;
            }
            @media (prefers-reduced-motion: reduce) {
              .activity-line { animation: none; stroke-dashoffset: 0; }
              .activity-area { animation: none; opacity: 1; }
              .current-week-pulse { animation: none; }
            }
          `}</style>
        </defs>

        {/* Weekend bands */}
        <g className="weekend-bands" fill="rgb(var(--color-ink-faint))" fillOpacity="0.04">
          {weekendBands.map((band, i) => (
            <rect key={i} x={band.x} y={0} width={band.width} height={height} />
          ))}
        </g>

        {/* Subscription overlay */}
        {showSubscriptionOverlay && subscriptionItems.length > 0 && (
          <g className="subscription-overlay">
            {subscriptionSegments.map((seg, i) => (
              <rect
                key={i}
                x={seg.x1}
                y={0}
                width={seg.x2 - seg.x1}
                height={height}
                fill="rgb(var(--color-accent))"
                fillOpacity="0.06"
                rx={2}
              />
            ))}
          </g>
        )}

        {/* Area fill */}
        <path
          className="activity-area"
          d={areaPath}
          fill="url(#activity-gradient)"
        />

        {/* Line path */}
        <path
          className="activity-line"
          d={`M${linePath}`}
          stroke="url(#activity-line-gradient)"
          strokeWidth={compact ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: containerWidth * 2,
            strokeDashoffset: containerWidth * 2,
          }}
        />

        {/* Data points */}
        <g className="activity-dots">
          {allDays.map((day, i) => {
            const x = xScale(i);
            const y = yScale(day.eventCount);
            const isCurrentWeek = i >= totalDays - 7;
            return (
              <g
                key={i}
                onMouseEnter={() => { if (day.eventCount > 0) setHoveredPoint({ x, y, label: day.date, value: day.eventCount }); }}
                onMouseLeave={() => setHoveredPoint(null)}
                onTouchStart={(e) => { e.preventDefault(); if (day.eventCount > 0) setHoveredPoint({ x, y, label: day.date, value: day.eventCount }); }}
              >
                {/* Day dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={day.isActive ? (compact ? 3 : 4) : 2}
                  fill={day.isActive ? "rgb(var(--color-accent))" : "transparent"}
                  stroke={day.isActive ? "none" : "rgb(var(--color-ink-faint))"}
                  strokeWidth={1}
                  strokeOpacity={day.isActive ? 0 : 0.3}
                  className={isCurrentWeek ? "current-week-pulse" : ""}
                  style={{
                    transformOrigin: `${x}px ${y}px`,
                    transition: "r 150ms ease, fill 150ms ease",
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Tooltip */}
        {hoveredPoint && (
          <g className="tooltip" pointerEvents="none">
            <rect
              x={hoveredPoint.x + 10}
              y={hoveredPoint.y - 35}
              width={80}
              height={30}
              rx={4}
              fill="rgb(var(--color-ink))"
              opacity={0.9}
            />
            <text
              x={hoveredPoint.x + 18}
              y={hoveredPoint.y - 18}
              fill="rgb(var(--color-paper))"
              fontSize={11}
              fontFamily="monospace"
            >
              {hoveredPoint.value} events
            </text>
            <text
              x={hoveredPoint.x + 18}
              y={hoveredPoint.y - 6}
              fill="rgb(var(--color-ink-muted))"
              fontSize={10}
              fontFamily="monospace"
            >
              {new Date(hoveredPoint.label).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            </text>
          </g>
        )}

        {/* Current week indicator */}
        {totalDays > 7 && (
          <circle
            className="current-week-pulse"
            cx={xScale(totalDays - 4)} // ~middle of current week
            cy={padding.top + 12}
            r={5}
            fill="rgb(var(--color-accent))"
            fillOpacity="0.3"
            style={{ transformOrigin: `${xScale(totalDays - 4)}px ${padding.top + 12}px` }}
          />
        )}

        {/* Y-axis labels (compact) */}
        {!compact && (
          <g className="y-axis-labels" fontSize={10} fill="rgb(var(--color-ink-muted))" fontFamily="monospace">
            <text x={padding.left - 8} y={padding.top + 4} textAnchor="end">{maxEvents}+</text>
            <text x={padding.left - 8} y={padding.top + innerHeight / 2 + 4} textAnchor="end">{Math.round(maxEvents / 2)}</text>
            <text x={padding.left - 8} y={height - padding.bottom - 4} textAnchor="end">0</text>
          </g>
        )}

        {/* X-axis week labels */}
        {!compact && (
          <g className="x-axis-labels" fontSize={10} fill="rgb(var(--color-ink-faint))" fontFamily="monospace" textAnchor="middle">
            {data.weeks.map((week, i) => (
              <text
                key={i}
                x={xScale(i * 7 + 3)} // middle of week
                y={height - 8}
              >
                {new Date(week.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </text>
            ))}
          </g>
        )}
      </svg>

      {/* Legend / Stats bar */}
      {!compact && (
        <div className="flex items-center gap-6 mt-4 text-xs text-ink-muted font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Current streak: {data.currentStreak}d
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-ink-faint/30" />
            Longest: {data.longestStreak}d
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent/20" />
            Active days: {data.totalActiveDays}/56
          </span>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between mt-3 text-xs text-ink-muted font-mono">
          <span>🔥 {data.currentStreak}d streak</span>
          <span>{data.totalActiveDays}/56 days active</span>
          <span>Best: {data.longestStreak}d</span>
        </div>
      )}
    </div>
  );
}