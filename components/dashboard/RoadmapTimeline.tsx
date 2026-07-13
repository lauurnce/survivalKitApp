// components/dashboard/RoadmapTimeline.tsx
import type { RoadmapNode } from "@/lib/dashboard";

interface Props {
  nodes: RoadmapNode[];
}

function stateText(state: RoadmapNode["state"]): string {
  if (state === "past") return "completed";
  if (state === "current") return "current semester";
  return "upcoming";
}

function NodeDot({ node }: { node: RoadmapNode }) {
  if (node.key === "grad") {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="h-4 w-4 text-ink-faint"
      >
        <path d="M4 2.5v15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 3l11 3.5L4 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (node.state === "current") {
    return <span className="h-4 w-4 rounded-full bg-accent" />;
  }
  if (node.state === "past") {
    return <span className="h-3 w-3 rounded-full border-2 border-accent bg-paper" />;
  }
  return <span className="h-3 w-3 rounded-full border-2 border-taupe/50 bg-paper" />;
}

export function RoadmapTimeline({ nodes }: Props) {
  return (
    <section id="roadmap" aria-labelledby="roadmap-heading">
      <h2 id="roadmap-heading" className="label-sm mb-4">
        Your academic roadmap
      </h2>

      <ol className="flex items-start overflow-x-auto pb-2">
        {nodes.map((node, index) => {
          const isLast = index === nodes.length - 1;
          const connectorIsPast = node.state === "past";

          return (
            <li key={node.key} className="flex items-center flex-1 min-w-[3.5rem]">
              <div className="flex flex-col items-center gap-2 px-1 shrink-0">
                <NodeDot node={node} />
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
                <span className="sr-only">{stateText(node.state)}</span>
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
