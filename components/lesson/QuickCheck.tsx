"use client";

import { useState } from "react";
import { logEvent } from "@/lib/analytics";
import type { QuickCheckQuestion } from "@/lib/lesson/quickChecks";

interface Props {
  moduleId: string;
  subjectId: string;
  yearId: string;
  questions: readonly QuickCheckQuestion[];
}

// "Quick check" — two recall questions at the end of a lesson's notes, with
// the reason revealed on any answer. No sign-up, nothing saved: the point is
// the act of retrieving, and a reason to stay on the page a minute longer.
// Logs quick_check_correct / quick_check_wrong on each question's first
// answer only.
export function QuickCheck({ moduleId, subjectId, yearId, questions }: Props) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  if (questions.length === 0) return null;

  const answered = questions.filter((q) => q.id in picked);
  const right = answered.filter((q) => picked[q.id] === q.answer).length;

  function choose(q: QuickCheckQuestion, choice: number) {
    if (q.id in picked) return;
    setPicked((prev) => ({ ...prev, [q.id]: choice }));
    void logEvent(choice === q.answer ? "quick_check_correct" : "quick_check_wrong", {
      module_id: moduleId,
      subject_id: subjectId,
      year_id: yearId,
    });
  }

  return (
    <section aria-labelledby="quick-check-heading" className="border border-ink-faint p-5 md:p-6 print:hidden">
      <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-accent mb-2">Quick check</p>
      <h2 id="quick-check-heading" className="font-serif text-2xl text-ink leading-tight mb-1">
        Did it stick?
      </h2>
      <p className="font-sans text-sm text-ink-muted mb-6">
        {questions.length} questions from the notes above. Answering beats rereading.
      </p>

      <ol className="space-y-8">
        {questions.map((q, qi) => {
          const choice = picked[q.id];
          const done = choice !== undefined;
          const correct = choice === q.answer;
          return (
            <li key={q.id}>
              <fieldset>
                <legend className="font-sans text-base font-semibold text-ink mb-3">
                  <span className="font-mono text-label-sm text-ink-muted mr-2">{qi + 1}.</span>
                  {q.prompt}
                </legend>
                {q.code && (
                  <pre className="bg-inverse text-on-inverse font-mono text-sm p-3 overflow-x-auto mb-3 whitespace-pre">
                    <code>{q.code}</code>
                  </pre>
                )}
                <div className="grid gap-2">
                  {q.choices.map((c, ci) => {
                    const isAnswer = ci === q.answer;
                    const isPicked = ci === choice;
                    const state = !done
                      ? "border-ink-faint hover:border-ink text-ink"
                      : isAnswer
                        ? "border-accent text-ink font-semibold"
                        : isPicked
                          ? "border-ink-faint text-ink-muted line-through"
                          : "border-ink-faint text-ink-muted";
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => choose(q, ci)}
                        disabled={done}
                        aria-pressed={isPicked}
                        className={`min-h-11 w-full border px-4 py-2 text-left font-sans text-sm transition-colors disabled:cursor-default ${state}`}
                      >
                        {c}
                        {done && isAnswer && <span className="sr-only"> (correct answer)</span>}
                      </button>
                    );
                  })}
                </div>
                {done && (
                  <p role="status" className="mt-3 font-sans text-sm text-ink-muted">
                    <span className={`font-semibold ${correct ? "text-accent" : "text-ink"}`}>
                      {correct ? "Correct." : "Not quite."}
                    </span>{" "}
                    {q.why}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {answered.length === questions.length && (
        <p className="mt-6 font-mono text-label-md uppercase tracking-[0.1em] text-ink">
          {right} of {questions.length} right
          {right === questions.length ? " — nice." : " — skim the notes above once more."}
        </p>
      )}
    </section>
  );
}
