import { iconForTitle, resolveSubjectSlug } from "@/lib/subjectIcons";

const warned = new Set<string>();

export function SubjectIcon({ title, className }: { title: string; className?: string }) {
  if (process.env.NODE_ENV !== "production" && resolveSubjectSlug(title) === null && !warned.has(title)) {
    warned.add(title);
    // eslint-disable-next-line no-console
    console.warn(`[SubjectIcon] no icon mapped for subject title: "${title}" (using book fallback)`);
  }

  return (
    <span
      aria-hidden="true"
      className={
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent " +
        (className ?? "w-10 h-10")
      }
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconForTitle(title)}
      </svg>
    </span>
  );
}
