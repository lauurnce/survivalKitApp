"use client";

import { RoadmapTimeline } from "@/components/dashboard/RoadmapTimeline";
import { ActivityGraph } from "@/components/dashboard/ActivityGraph";
import { SubscriptionTimeline } from "@/components/dashboard/SubscriptionTimeline";
import { RoadmapTour } from "@/components/tour/RoadmapTour";
import type { DashboardData } from "@/lib/dashboard";

interface Props {
  initialData: DashboardData;
}

export function RoadmapPageClient({ initialData }: Props) {
  const { roadmap, activity, subscriptions } = initialData;

  return (
    <div className="min-h-screen bg-paper">
      <RoadmapTour />
      {/* Header */}
      <header className="border-b border-taupe/30 bg-paper/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="text-center">
            <h1 className="font-serif text-lg text-ink">Academic Roadmap</h1>
            <p className="text-xs text-ink-muted">Your complete journey overview</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Journey Marker + Overall Progress */}
        <section className="space-y-4" aria-labelledby="journey-heading" data-tour="roadmap-journey">
          <div className="flex items-center justify-between">
            <h2 id="journey-heading" className="label-sm">Your journey</h2>
            <span className="text-xs text-ink-muted font-mono">
              {roadmap.overall.completionRate}% complete overall
            </span>
          </div>

          {roadmap.journeyStartedAt && (
            <div className="relative pl-10" role="region" aria-label="Journey start">
              <div className="absolute left-[10px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent shrink-0" />
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-ink">
                      Started your journey on{" "}
                      <span className="font-medium">
                        {new Date(roadmap.journeyStartedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </p>
                    {roadmap.overall.totalModules > 0 && (
                      <p className="text-xs text-ink-muted mt-1">
                        {roadmap.overall.completedModules} of {roadmap.overall.totalModules} modules completed •{" "}
                        {roadmap.overall.completionRate}% overall
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Activity Graph - Expanded */}
        <section aria-labelledby="activity-heading" className="space-y-4" data-tour="roadmap-activity">
          <div className="flex items-center justify-between">
            <h2 id="activity-heading" className="label-sm">Activity & progress</h2>
            <div className="flex items-center gap-2 text-xs text-ink-muted font-mono">
              <span>🔥 {activity.currentStreak}d streak</span>
              <span>•</span>
              <span>Best: {activity.longestStreak}d</span>
              <span>•</span>
              <span>{activity.totalActiveDays}/56 days</span>
            </div>
          </div>
          <ActivityGraph
            data={activity}
            compact={false}
            showSubscriptionOverlay
            subscriptionItems={subscriptions.map(s => ({
              startedAt: s.startedAt,
              endsAt: s.endsAt,
              progressPct: s.progressPct,
            }))}
          />
        </section>

        {/* Subscription Timeline */}
        {subscriptions.length > 0 && (
          <section
            aria-labelledby="subscriptions-heading"
            className="space-y-4"
            data-tour="roadmap-subscriptions"
          >
            <h2 id="subscriptions-heading" className="label-sm">Active subscriptions</h2>
            <SubscriptionTimeline items={subscriptions} compact={false} />
          </section>
        )}

        {/* Detailed Academic Timeline */}
        <section aria-labelledby="timeline-heading" className="space-y-4" data-tour="roadmap-timeline">
          <h2 id="timeline-heading" className="label-sm">Detailed timeline</h2>
          <RoadmapTimeline
            roadmapData={roadmap}
            // Custom expanded handler for page-level state
          />
        </section>

        {/* Graduation milestone */}
        <div className="relative pt-8 border-t border-taupe/20" data-tour="roadmap-graduation">
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
        </div>
      </main>
    </div>
  );
}