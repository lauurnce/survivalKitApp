import { ButtonLink } from "@/components/ui/Button";
import { modulePath } from "@/lib/subscribeRedirect";
import type { NextAvailable } from "@/lib/subjectHub/nextAvailable";

interface Props {
  yearId: string;
  next: NextAvailable | null;
}

// Shown beside the coming-soon waitlist on a subject with nothing to read, so
// the page still ends in a lesson instead of only a form.
export function NextAvailableLesson({ yearId, next }: Props) {
  if (!next) return null;
  const { subject, module } = next;

  return (
    <section
      data-testid="next-available-lesson"
      aria-labelledby="next-available-heading"
      className="my-6 flex flex-col gap-3 border border-ink-faint/40 bg-ink/[0.02] p-5 sm:p-6"
    >
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent-strong">
        Read this meanwhile
      </p>
      <h2 id="next-available-heading" className="break-words font-serif text-2xl text-ink">
        {module.title}
      </h2>
      <p className="font-sans text-sm text-ink-muted">
        From {subject.title}. Free to read.
      </p>
      <ButtonLink href={modulePath(yearId, subject.id, module.id)} prefetch={true} className="self-start">
        Start lesson <span aria-hidden="true">→</span>
      </ButtonLink>
    </section>
  );
}
