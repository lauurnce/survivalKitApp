import Link from "next/link";

export interface PopularModule {
  moduleId: string;
  moduleTitle: string;
  subjectId: string;
  subjectTitle: string;
  yearId: string;
  yearLabel: string;
}

interface Props {
  modules: PopularModule[];
}

export function PopularModules({ modules }: Props) {
  if (modules.length === 0) return null;

  return (
    <div className="max-w-wide">
      <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted mb-6">
        Popular right now
      </p>
      <div className="flex flex-col divide-y divide-ink-faint/30">
        {modules.map((m) => (
          <Link
            key={m.moduleId}
            href={`/year/${m.yearId}/subjects/${m.subjectId}/modules/${m.moduleId}`}
            className="group flex items-start justify-between gap-6 py-5 hover:bg-ink/[0.02] -mx-4 px-4 transition-colors duration-150"
          >
            <div>
              <h3 className="font-serif text-xl text-ink group-hover:text-accent transition-colors duration-150 mb-1">
                {m.moduleTitle}
              </h3>
              <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
                {m.yearLabel} · {m.subjectTitle}
              </p>
            </div>
            <span className="font-sans text-sm text-ink-faint group-hover:text-ink transition-colors mt-1 flex-shrink-0">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
