"use client";

import type { SubscriptionTimelineItem } from "@/lib/dashboard";

interface SubscriptionTimelineProps {
  items: SubscriptionTimelineItem[];
  compact?: boolean;
  className?: string;
}

export function SubscriptionTimeline({ items, compact = false, className = "" }: SubscriptionTimelineProps) {
  if (items.length === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-sm text-ink-muted mb-2">No active subscriptions</p>
        <p className="text-xs text-ink-faint">Unlock a subject to see your subscription timeline</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <article
          key={`${item.yearId}-${item.subjectId ?? "year"}`}
          className={`group relative rounded-xl border bg-paper/50 p-4 transition-all ${compact ? "py-3" : ""}`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`h-2 w-2 rounded-full shrink-0 ${item.isActive ? "bg-accent" : "bg-ink-faint/30"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{item.yearLabel}</p>
                {item.subjectTitle && (
                  <p className="text-xs text-ink-muted truncate">{item.subjectTitle}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-mono text-ink-muted">
                {item.daysRemaining} day{item.daysRemaining !== 1 ? "s" : ""} left
              </p>
              <p className="text-[10px] text-ink-faint">
                Ends {new Date(item.endsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-ink-faint/10 rounded-full overflow-hidden">
            {/* Background track */}
            <div className="absolute inset-0 bg-taupe/20 rounded-full" />
            
            {/* Progress fill */}
            <div
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${item.isActive ? "bg-accent" : "bg-ink-faint/30"}`}
              style={{ width: `${Math.min(100, item.progressPct)}%` }}
            />
            
            {/* Elapsed portion indicator */}
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-accent/30"
              style={{ width: `${Math.min(100, item.progressPct)}%` }}
            />
            
            {/* Current position marker */}
            {item.isActive && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent border-2 border-paper shadow-sm"
                style={{ left: `${Math.min(100, item.progressPct)}%`, transform: "translate(-50%, -50%)" }}
              />
            )}
          </div>

          {!compact && (
            <div className="mt-2 flex items-center justify-between text-[10px] text-ink-faint">
              <span>Started {new Date(item.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              <span className="font-mono tabular-nums">{item.progressPct}% elapsed</span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}