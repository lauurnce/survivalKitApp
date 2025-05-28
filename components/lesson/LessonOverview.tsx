import { estimateReadingMinutes } from "@/lib/lesson/readingTime";
import { sectionAnchor } from "@/lib/lesson/anchors";

export interface OverviewSection {
  id: string;
  kind: string;
  heading: string;
  body_md: string;
  ide_language?: string | null;
}

interface Props {
  sections: OverviewSection[];
}

// "In this lesson" — the map a reader gets before the first paragraph.
//
// Most readers land here from a link in a group chat, on a phone, and leave
// the same day. Before this card the first screen was a title and a print
// button; the lesson's length and shape were only discoverable by scrolling
// 11–13 screens. The card answers "how long is this?" and "what's in it?"
// up front, and each topic jumps straight to its section.
//
// Server component: the prerendered (shared, CDN-cached) HTML already has
// every content section, so nothing here depends on who is reading.
export function LessonOverview({ sections }: Props) {
  const topics = sections.filter((s) => s.kind === "content" && s.heading);
  if (topics.length === 0) return null;

  const readable = sections.filter((s) => s.body_md);
  const minutes = estimateReadingMinutes(readable);
  const hasCode = sections.some((s) => s.ide_language);
  const practiceCount = sections.filter((s) => s.kind === "activity").length;

  return (
    <nav
      aria-label="In this lesson"
      className="border border-ink-faint px-5 py-5 md:px-6 print:hidden"
    >
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-muted mb-3">
        In this lesson
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm text-ink mb-4">
        <li>
          <span className="font-semibold">{minutes} min</span> read
        </li>
        <li>
          <span className="font-semibold">{topics.length}</span>{" "}
          {topics.length === 1 ? "topic" : "topics"}
        </li>
        {hasCode && <li>Code you can run here</li>}
        {practiceCount > 0 && (
          <li>
            <span className="font-semibold">{practiceCount}</span> practice{" "}
            {practiceCount === 1 ? "set" : "sets"}
          </li>
        )}
      </ul>
      <ol className="space-y-1">
        {topics.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${sectionAnchor(s.id)}`}
              className="group flex items-baseline gap-3 py-1 font-sans text-base text-ink-muted hover:text-ink"
            >
              <span className="font-mono text-label-sm text-ink-muted w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="underline-offset-4 group-hover:underline">{s.heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
