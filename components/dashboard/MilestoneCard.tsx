"use client";

import { useRef, useEffect } from "react";
import { ProgressRing } from "./ProgressRing";
import type { RoadmapMilestone, MilestoneSubject, ModuleProgress } from "@/lib/dashboard";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
  isCurrent: boolean;
  isExpanded: boolean;
  canExpand: boolean;
  onToggle: () => void;
}

function ChevronDown({ className = "", rotated = false }: { className?: string; rotated?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-ink-muted shrink-0 transition-transform duration-200 ${className} ${rotated ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const stateColors = {
  completed: "text-accent bg-accent/10 border-accent/30",
  current: "text-accent bg-accent/10 border-accent/30 ring-2 ring-accent/20",
  upcoming: "text-ink-muted bg-ink-faint/5 border-taupe/30",
  locked: "text-ink-faint bg-ink-faint/5 border-taupe/20",
};

const stateLabels = {
  completed: "Completed",
  current: "Current",
  upcoming: "Upcoming",
  locked: "Locked",
};

function ModuleList({ modules, subjectTitle }: { modules: ModuleProgress[]; subjectTitle: string }) {
  return (
    <ul className="space-y-2 mt-3 ml-2 border-l border-taupe/20 pl-3" role="list" aria-label={`${subjectTitle} modules`}>
      {modules.map((m) => (
        <li key={m.id} className="relative pl-2 py-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                m.status === "done"
                  ? "bg-accent"
                  : m.status === "in-progress"
                  ? "bg-accent/60 animate-pulse"
                  : m.status === "locked"
                  ? "bg-ink-faint/30"
                  : "bg-taupe/30"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm truncate ${
                m.status === "done"
                  ? "text-ink"
                  : m.status === "in-progress"
                  ? "text-accent font-medium"
                  : m.status === "locked"
                  ? "text-ink-faint"
                  : "text-ink-muted"
              }`}
            >
              {m.title}
            </span>
            {m.status === "in-progress" && (
              <span className="text-[10px] text-accent font-mono">In progress</span>
            )}
            {m.status === "done" && m.completedAt && (
              <time className="text-[10px] text-ink-muted font-mono ml-auto" dateTime={m.completedAt}>
                Done {formatRelative(new Date(m.completedAt))}
              </time>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function SubjectRow({
  subject,
  isExpanded,
  onToggle,
}: {
  subject: MilestoneSubject;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const progressPct = subject.totalModules > 0 ? Math.round((subject.completedModules / subject.totalModules) * 100) : 0;

  return (
    <div className="group">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-taupe/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        aria-expanded={isExpanded}
        aria-controls={`subject-${subject.id}-modules`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              subject.unlocked ? "bg-accent" : "bg-ink-faint/30"
            }`}
          />
          <ProgressRing percent={progressPct} size={32} strokeWidth={3} showText={false} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">{subject.title}</p>
            <p className="text-xs text-ink-muted flex items-center gap-1">
              {subject.completedModules}/{subject.totalModules} modules
              {subject.inProgressModules > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="text-accent">{subject.inProgressModules} in progress</span>
                </>
              )}
              {!subject.unlocked && <span className="text-ink-faint">(locked)</span>}
            </p>
          </div>
          <ChevronDown rotated={isExpanded} />
        </div>
      </button>

      {isExpanded && (
        <div id={`subject-${subject.id}-modules`} className="mt-2 animate-slide-down">
          <ModuleList modules={subject.modules} subjectTitle={subject.title} />
        </div>
      )}
    </div>
  );
}

export function MilestoneCard({
  milestone,
  isCurrent,
  isExpanded,
  canExpand,
  onToggle,
}: MilestoneCardProps) {
  const progressPct = milestone.totalModules > 0 ? Math.round((milestone.completedModules / milestone.totalModules) * 100) : 0;
  const colorClasses = stateColors[milestone.state];
  const stateLabel = stateLabels[milestone.state];
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate height for smooth expand/collapse
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isExpanded ? `${contentRef.current.scrollHeight}px` : "0";
    }
  }, [isExpanded]);

  return (
    <article className={`relative group ${colorClasses} rounded-xl border transition-all duration-300 ${isCurrent ? "ring-2 ring-accent/20" : ""}`}>
      {/* Milestone header - always visible */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!canExpand}
        className="w-full flex items-start gap-4 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        aria-expanded={isExpanded}
        aria-controls={`milestone-${milestone.key}-detail`}
      >
        {/* Dot + connector handled by parent list */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ProgressRing
            percent={progressPct}
            size={40}
            strokeWidth={4}
            colorClass={milestone.state === "completed" || milestone.state === "current" ? "text-accent" : "text-ink-faint"}
            ariaLabel={`${stateLabel}: ${progressPct}% complete`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-base text-ink truncate">{milestone.label}</h3>
              <span className={`label-sm px-2 py-0.5 rounded-full shrink-0 ${colorClasses}`}>
                {stateLabel}
              </span>
              {milestone.unlockedAt && (
                <time className="text-[10px] text-ink-muted font-mono" dateTime={milestone.unlockedAt}>
                  Unlocked {formatRelative(new Date(milestone.unlockedAt))}
                </time>
              )}
              {milestone.firstActivityAt && milestone.state !== "locked" && (
                <time className="text-[10px] text-ink-muted font-mono" dateTime={milestone.firstActivityAt}>
                  Started {formatRelative(new Date(milestone.firstActivityAt))}
                </time>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-ink-muted">
              <span className="font-mono tabular-nums">
                {milestone.completedModules}/{milestone.totalModules} modules
              </span>
              {milestone.inProgressModules > 0 && (
                <span className="text-accent font-medium">{milestone.inProgressModules} in progress</span>
              )}
              {milestone.lockedModules > 0 && (
                <span className="text-ink-faint">{milestone.lockedModules} locked</span>
              )}
            </div>
          </div>
        </div>

        {canExpand && <ChevronDown rotated={isExpanded} />}
      </button>

      {/* Expandable detail panel */}
      {canExpand && (
        <div
          id={`milestone-${milestone.key}-detail`}
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out bg-paper/50 rounded-b-xl border-t border-taupe/20"
          style={{ maxHeight: isExpanded ? "none" : "0" }}
        >
          <div className="p-4 pt-0 space-y-3" role="region" aria-label={`${milestone.label} details`}>
            {milestone.subjects.map((subject) => (
              <SubjectRow key={subject.id} subject={subject} isExpanded={false} onToggle={() => {}} />
            ))}
            {milestone.subjects.every((s) => !s.unlocked) && milestone.totalModules > 0 && (
              <div className="text-center py-6 text-ink-muted">
                <p className="text-sm">This semester is locked.</p>
                <p className="text-xs mt-1">Unlock the year or subject to see modules.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}