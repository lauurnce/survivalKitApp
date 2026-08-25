import Link from "next/link";
import { ModuleDoneToggle } from "@/components/ModuleDoneToggle";
import { ProBadge } from "@/components/ProBadge";
import { formatCount } from "@/lib/counters";

interface Props {
  href: string;
  index: number;
  moduleId: string;
  title: string;
  readCount: number;
  isPro: boolean;
  share: {
    subjectId: string;
    subjectTitle: string;
    moduleTitle: string;
    moduleIds: string[];
  };
}

export function ModuleListItem({
  href,
  index,
  moduleId,
  title,
  readCount,
  isPro,
  share,
}: Props) {
  return (
    <article
      className={`group relative flex items-start gap-3 sm:gap-6 py-8 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150 ${
        isPro ? "border-l-2 border-l-amber-400/70 bg-amber-50/40 dark:bg-amber-400/[0.06]" : ""
      }`}
    >
      <Link
        href={href}
        aria-label={`Open ${title}`}
        className="absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <span className="sr-only">Open {title}</span>
      </Link>
      <span className="relative z-0 pointer-events-none font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mt-1 w-8 shrink-0 text-right">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="relative z-0 pointer-events-none min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
          <h2 className="break-words font-serif text-2xl text-ink group-hover:text-accent transition-colors duration-150">
            {title}
          </h2>
          {isPro && <ProBadge />}
        </div>
        {readCount > 0 ? (
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
            <span className="text-ink-muted">{formatCount(readCount)}</span> reads
          </span>
        ) : (
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent">
            New
          </span>
        )}
      </div>
      <div className="relative z-10 shrink-0">
        <ModuleDoneToggle moduleId={moduleId} share={share} />
      </div>
      <span
        aria-hidden="true"
        className="relative z-0 pointer-events-none hidden sm:block font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1"
      >
        →
      </span>
    </article>
  );
}
