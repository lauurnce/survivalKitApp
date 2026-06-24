import Link from "next/link";
import type { SubjectSummary } from "@/lib/account";
import { ProgressRing } from "./ProgressRing";

export function SubjectCard({ subject }: { subject: SubjectSummary }) {
  const href = `/year/${subject.yearId}/subjects/${subject.id}`;
  return (
    <div className="flex items-center gap-4 rounded-lg border border-taupe/50 bg-paper p-4">
      <ProgressRing done={subject.doneCount} total={subject.totalCount} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif text-lg text-ink">{subject.title}</h3>
        {subject.unlocked ? (
          <p className="text-sm text-ink-muted">{subject.doneCount}/{subject.totalCount} modules done</p>
        ) : (
          <p className="text-sm text-ink-faint">🔒 Locked</p>
        )}
      </div>
      {subject.unlocked ? (
        <Link href={href} className="rounded bg-accent px-3 py-1.5 text-sm text-paper">Continue</Link>
      ) : (
        <Link href={href} className="rounded border border-accent px-3 py-1.5 text-sm text-accent">Unlock ₱50</Link>
      )}
    </div>
  );
}
