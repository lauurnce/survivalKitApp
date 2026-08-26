import type { RoadmapData } from "@/lib/dashboard";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

interface JourneyMarkerProps {
  journeyStartedAt: string;
  overall?: RoadmapData["overall"];
}

export function JourneyMarker({ journeyStartedAt, overall }: JourneyMarkerProps) {
  const startedDate = new Date(journeyStartedAt);
  const formattedDate = formatDate(startedDate);

  return (
    <div className="relative mb-6 pl-10" role="region" aria-label="Journey start">
      <div className="absolute left-[10px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent shrink-0" />
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm text-ink">
              Started your journey on <span className="font-medium">{formattedDate}</span>
            </p>
            {overall && overall.totalModules > 0 && (
              <p className="text-xs text-ink-muted mt-1">
                {overall.completedModules} of {overall.totalModules} modules completed •{" "}
                {overall.completionRate}% overall
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}