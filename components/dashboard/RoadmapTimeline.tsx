"use client";

import { useState } from "react";
import { JourneyMarker } from "./JourneyMarker";
import { MilestoneCard } from "./MilestoneCard";
import type { RoadmapData } from "@/lib/dashboard";

interface Props {
  /** Legacy nodes prop for backward compatibility during transition */
  nodes?: Array<{ key: string; short: string; state: "past" | "current" | "future" }>;
  /** New rich roadmap data */
  roadmapData?: RoadmapData;
}

export function RoadmapTimeline({ nodes, roadmapData }: Props) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Use new data if available, otherwise fall back to legacy
  const milestones = roadmapData?.milestones ?? [];
  const journeyStartedAt = roadmapData?.journeyStartedAt;
  const overall = roadmapData?.overall;

  if (milestones.length === 0 && (!nodes || nodes.length === 0)) {
    return (
      <section id="roadmap" aria-labelledby="roadmap-heading" className="space-y-4">
        <h2 id="roadmap-heading" className="label-sm mb-4">Your academic roadmap</h2>
        <p className="text-sm text-ink-muted">
          No subjects unlocked yet. Unlock a subject to begin your journey.
        </p>
      </section>
    );
  }

  // Legacy fallback rendering (kept for transition)
  if (milestones.length === 0 && nodes && nodes.length > 0) {
    return (
      <section id="roadmap" aria-labelledby="roadmap-heading">
        <h2 id="roadmap-heading" className="label-sm mb-4">Your academic roadmap</h2>
        <ol className="relative flex items-start overflow-x-auto pb-2 snap-x snap-mandatory touch-pan-x">
          {nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;
            const connectorIsPast = node.state === "past";
            return (
              <li key={node.key} className="flex items-center flex-1 min-w-[3.5rem]">
                <div className="flex flex-col items-center gap-2 px-1 shrink-0">
                  <span
                    className={`h-4 w-4 rounded-full ${
                      node.state === "current"
                        ? "bg-accent"
                        : node.state === "past"
                        ? "border-2 border-accent bg-paper"
                        : "border-2 border-taupe/50 bg-paper"
                    }`}
                  />
                  <span
                    className={`text-xs font-mono text-ink-muted ${
                      node.state === "current" ? "text-accent font-medium" : ""
                    }`}
                  >
                    {node.short}
                  </span>
                  {node.state === "current" && (
                    <span className="text-[10px] text-accent">Current</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`h-px flex-1 ${connectorIsPast ? "bg-accent/40" : "bg-taupe/40"}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </section>
    );
  }

  return (
    <section id="roadmap" aria-labelledby="roadmap-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="roadmap-heading" className="label-sm">
          Your academic roadmap
        </h2>
        {overall && (
          <span className="text-xs text-ink-muted font-mono">
            {overall.completionRate}% complete overall
          </span>
        )}
      </div>

      {journeyStartedAt && <JourneyMarker journeyStartedAt={journeyStartedAt} overall={overall} />}

      <ol className="space-y-4" role="list" aria-label="Academic milestones">
        {milestones.map((milestone, index) => {
          const isCurrent = milestone.state === "current";
          const isExpanded = expandedKey === milestone.key;
          const canExpand = milestone.totalModules > 0;

          return (
            <li key={milestone.key} className="relative">
              {/* Connector line between milestones */}
              {index > 0 && (
                <div
                  className="absolute left-[10px] top-0 bottom-0 w-px"
                  style={{
                    background: `linear-gradient(to bottom, var(--color-accent), var(--color-taupe))`,
                  }}
                  aria-hidden="true"
                />
              )}

              <MilestoneCard
                milestone={milestone}
                isCurrent={isCurrent}
                isExpanded={isExpanded}
                canExpand={canExpand}
                onToggle={() => setExpandedKey(isExpanded ? null : milestone.key)}
              />
            </li>
          );
        })}
      </ol>

      {/* Graduation milestone */}
      <li className="relative pt-8">
        <div className="absolute left-[10px] top-0 bottom-0 w-px bg-taupe/40" aria-hidden="true" />
        <div className="flex items-center gap-3 pl-10">
          <div className="h-5 w-5 rounded-full border-2 border-taupe/50 bg-paper shrink-0 relative">
            <svg
              className="absolute inset-0 h-3 w-3 m-auto text-ink-faint"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 2.5v15" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 3l11 3.5L4 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm text-ink">Graduation</p>
            <p className="text-xs text-ink-muted">Complete all semesters to graduate</p>
          </div>
        </div>
      </li>
    </section>
  );
}