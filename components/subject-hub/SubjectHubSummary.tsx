import { freeSampleLine, summaryParts, type SubjectSummary } from "@/lib/subjectHub/summary";

interface Props {
  summary: SubjectSummary;
  className?: string;
}

// The line under a subject's "Modules" heading: what the subject holds and
// what is free. Sits on the inverse header band, so it uses on-inverse text.
export function SubjectHubSummary({ summary, className }: Props) {
  const parts = summaryParts(summary);
  const free = freeSampleLine(summary);
  if (parts.length === 0 && !free) return null;

  return (
    <div data-testid="subject-hub-summary" className={["mt-4 flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      {parts.length > 0 && (
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-on-inverse/80">
          {parts.join(" · ")}
        </p>
      )}
      {free && <p className="max-w-prose font-sans text-sm text-on-inverse/70">{free}</p>}
    </div>
  );
}
