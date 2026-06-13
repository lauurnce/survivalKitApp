interface Section {
  id: string;
  heading: string;
  sort_order: number;
}

interface Props {
  section: Section;
  index: number;
  moduleId: string;
}

export function LockedSection({ section, index }: Props) {
  return (
    <section className="relative">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>

      {/* Blurred placeholder content */}
      <div className="relative pl-10 md:pl-12 select-none pointer-events-none">
        <div className="blur-sm opacity-40 space-y-3 mb-6">
          {[80, 95, 70, 88, 60].map((w, i) => (
            <div key={i} className="h-4 bg-ink-faint/50 rounded-none" style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-navy px-6 py-5 text-center max-w-xs">
            <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-taupe mb-2">Activity</p>
            <p className="font-serif text-lg text-paper mb-3 leading-snug">
              Locked
            </p>
            <p className="font-sans text-xs text-taupe mb-4">
              Coming soon — unlock for ₱20
            </p>
            <button
              disabled
              className="w-full border border-paper/20 text-paper/40 font-sans text-xs uppercase tracking-widest px-4 py-2 cursor-not-allowed"
            >
              Unlock ₱20
            </button>
            {/* TODO: PayMongo integration stub */}
          </div>
        </div>
      </div>
    </section>
  );
}
