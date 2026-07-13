// components/dashboard/StatusChip.tsx
import type { SubjectStatus } from "@/lib/dashboard";

export function StatusChip({ status }: { status: SubjectStatus }) {
  if (status === "in-progress") {
    return (
      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
        In progress
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="rounded border border-taupe/40 px-2 py-0.5 text-xs text-ink-muted">
        Done
      </span>
    );
  }
  return (
    <span className="rounded border border-taupe/40 px-2 py-0.5 text-xs text-ink-muted">
      Ready to start
    </span>
  );
}
