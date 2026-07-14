// components/dashboard/StatusChip.tsx
import type { SubjectStatus } from "@/lib/dashboard";

export function StatusChip({ status }: { status: SubjectStatus }) {
  if (status === "in-progress") {
    return (
      <span className="flex-shrink-0 whitespace-nowrap rounded bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
        In progress
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="flex-shrink-0 whitespace-nowrap rounded border border-taupe/40 px-3 py-1 text-xs text-ink-muted">
        Done
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 whitespace-nowrap rounded border border-taupe/40 px-3 py-1 text-xs text-ink-muted">
      Ready to start
    </span>
  );
}
