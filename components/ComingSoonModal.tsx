"use client";

interface Props {
  yearLabel: string;
  onClose: () => void;
}

export function ComingSoonModal({ yearLabel, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
        className="bg-navy text-paper mx-4 max-w-sm w-full p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe">
          {yearLabel}
        </p>
        <h2
          id="coming-soon-title"
          className="font-serif text-display-md text-paper leading-none"
        >
          Coming Soon
        </h2>
        <p className="font-sans text-sm text-taupe leading-relaxed">
          Content for this year is being written. Check back soon.
        </p>
        <button
          onClick={onClose}
          aria-label="Close"
          className="self-start font-sans text-sm uppercase tracking-widest text-taupe hover:text-paper transition-colors duration-150"
        >
          Close ×
        </button>
      </div>
    </div>
  );
}
