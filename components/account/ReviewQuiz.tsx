"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  isAnswerCorrect,
  type MultiChoiceQuestion,
  type QuizQuestion,
  type QuizResponse,
} from "@/lib/quiz/types";

type FetchState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "empty"; reason: "no-progress" | "no-facts" }
  | { status: "ready"; questions: QuizQuestion[] };

interface Result {
  given: string;
  correct: boolean;
}

interface ReviewQuizProps {
  moduleId?: string;
  moduleTitle?: string;
  subjectId?: string;
  subjectTitle?: string;
}

const kickerClass = "font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint";
const wrongText = "text-red-600 dark:text-red-400";

function correctAnswerText(q: QuizQuestion): string {
  return q.kind === "multi-choice" ? q.options[q.answerIndex] : q.answer;
}

function buildQuizUrl(moduleId: string | undefined, subjectId: string | undefined, seed?: number): string {
  if (subjectId) {
    const base = `/api/quiz/subject/${subjectId}`;
    return seed !== undefined ? `${base}?seed=${seed}` : base;
  }
  if (moduleId) {
    const base = `/api/quiz/module/${moduleId}`;
    return seed !== undefined ? `${base}?seed=${seed}` : base;
  }
  return seed !== undefined ? `/api/quiz?seed=${seed}` : "/api/quiz";
}

function buildSubmitUrl(moduleId: string | undefined, subjectId: string | undefined): string {
  if (subjectId) {
    return `/api/quiz/subject/${subjectId}/submit`;
  }
  return moduleId ? `/api/quiz/module/${moduleId}/submit` : "/api/quiz/submit";
}

function getBackLink(moduleId: string | undefined, subjectId: string | undefined): string {
  if (subjectId) return "/resources";
  if (moduleId) return "/resources";
  return "/resources";
}

function getBackLinkLabel(moduleId: string | undefined, subjectId: string | undefined): string {
  if (subjectId) return "← Back to Quizzes";
  if (moduleId) return "← Back to Quizzes";
  return "← Back to Resources";
}

export function ReviewQuiz({ moduleId, moduleTitle, subjectId, subjectTitle }: ReviewQuizProps) {
  const [fetchState, setFetchState] = useState<FetchState>({ status: "loading" });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "feedback">("answering");
  const [typed, setTyped] = useState("");
  const [chosen, setChosen] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [lastSeed, setLastSeed] = useState<number | null>(null);

  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const isModuleMode = !!moduleId;
  const isSubjectMode = !!subjectId;
  const isLegacyMode = !moduleId && !subjectId;

  const loadQuiz = useCallback(async (seed?: number) => {
    const id = ++requestIdRef.current;
    setFetchState({ status: "loading" });
    setIndex(0);
    setPhase("answering");
    setTyped("");
    setChosen(null);
    setResults([]);
    if (seed !== undefined) setLastSeed(seed);
    try {
      const url = buildQuizUrl(moduleId, subjectId, seed);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`quiz fetch failed: ${res.status}`);
      const data = (await res.json()) as QuizResponse;
      if (id !== requestIdRef.current) return;
      if (data.questions.length === 0) {
        setFetchState({ status: "empty", reason: data.reason ?? "no-facts" });
      } else {
        setFetchState({ status: "ready", questions: data.questions });
      }
    } catch {
      if (id === requestIdRef.current) setFetchState({ status: "error" });
    }
  }, [moduleId, subjectId]);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      void loadQuiz();
    }
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadQuiz]);

  useEffect(() => {
    if (fetchState.status !== "ready") return;
    if (phase === "answering") inputRef.current?.focus();
    else nextRef.current?.focus();
  }, [fetchState.status, phase, index]);

  async function submitResults() {
    if (isLegacyMode) return;
    if (results.length === 0) return;

    const answers = results.map((r, i) => ({
      index: i,
      given: r.given,
      correct: r.correct,
    }));

    try {
      await fetch(buildSubmitUrl(moduleId, subjectId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: results.filter((r) => r.correct).length,
          totalQuestions: results.length,
          seed: lastSeed ?? Math.floor(Math.random() * 1e9),
          answers,
        }),
      });
    } catch {
      // Non-blocking; quiz still works locally
    }
  }

  function submitTyped(question: QuizQuestion & { answer: string }) {
    if (phase !== "answering") return;
    const given = typed.trim();
    if (!given) return;
    setResults((prev) => [
      ...prev,
      { given, correct: isAnswerCorrect(given, question.answer) },
    ]);
    setPhase("feedback");
  }

  function chooseOption(question: MultiChoiceQuestion, i: number) {
    if (phase !== "answering") return;
    setChosen(i);
    setResults((prev) => [
      ...prev,
      { given: question.options[i], correct: i === question.answerIndex },
    ]);
    setPhase("feedback");
  }

  function next(total: number) {
    setTyped("");
    setChosen(null);
    setPhase("answering");
    setIndex((i) => Math.min(i + 1, total));
  }

  function frame(children: React.ReactNode, headerRight?: React.ReactNode) {
    const kickerText = isSubjectMode
      ? "Subject Quiz"
      : isModuleMode
      ? "Module Quiz"
      : "Review Quiz";

    const subtitle = isSubjectMode && subjectTitle
      ? `Questions from ${subjectTitle} (all completed modules)`
      : isModuleMode && moduleTitle && subjectTitle
      ? `Questions from ${moduleTitle} · ${subjectTitle}`
      : "Questions drawn from lessons you&apos;ve completed.";

    return (
      <section className="rounded-xl border border-taupe/40 bg-paper p-6">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <p className={kickerClass}>{kickerText}</p>
          {headerRight}
        </div>
        <p className="text-xs text-ink-muted mb-5">{subtitle}</p>
        {children}
      </section>
    );
  }

  if (fetchState.status === "loading") {
    return frame(
      <div className="animate-pulse space-y-3" aria-label="Loading quiz">
        <div className="h-5 w-3/4 rounded bg-taupe/30" />
        <div className="h-5 w-1/2 rounded bg-taupe/30" />
        <div className="h-10 w-full rounded bg-taupe/20" />
      </div>
    );
  }

  if (fetchState.status === "error") {
    return frame(
      <div className="space-y-3">
        <p className="text-sm text-ink-muted">
          The quiz didn&apos;t load. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => void loadQuiz()}
          className="rounded-lg border border-taupe/60 px-4 py-2 text-sm text-ink hover:border-accent/60 hover:text-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (fetchState.status === "empty") {
    return frame(
      <p className="text-sm text-ink-muted">
        {fetchState.reason === "no-progress"
          ? isSubjectMode
            ? "No completed modules in this subject yet."
            : isModuleMode
            ? "This module isn't marked complete yet."
            : "Finish your first module and a review quiz will appear here."
          : "This module doesn't have enough quiz material yet."}
      </p>
    );
  }

  const { questions } = fetchState;
  const total = questions.length;
  const finished = index >= total;
  const score = results.filter((r) => r.correct).length;

  const dots = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {questions.map((_, i) => {
          const answered = i < results.length;
          const cls = answered
            ? results[i].correct
              ? "bg-accent"
              : "bg-red-400"
            : i === index
            ? "bg-ink"
            : "bg-taupe/50";
          return <span key={i} className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
        })}
      </div>
      <span className="font-mono text-label-sm text-ink-faint">
        {Math.min(index + 1, total)} / {total}
      </span>
    </div>
  );

  if (finished) {
    const verdict =
      score === total
        ? "Perfect score — you got every term right."
        : score / total >= 0.7
        ? "Good work — a couple of terms to revisit."
        : "Keep reviewing — reread the material and try again.";
    return frame(
      <div className="space-y-6">
        <div>
          <p className="font-serif text-5xl text-ink">
            {score} / {total}
          </p>
          <p className="text-sm text-ink-muted mt-2">{verdict}</p>
        </div>

        <ul className="border-t border-taupe/30">
          {questions.map((q, i) => {
            const r = results[i];
            return (
              <li
                key={i}
                className="flex items-start gap-3 py-2.5 border-b border-taupe/20"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 text-sm ${r.correct ? "text-accent" : wrongText}`}
                >
                  {r.correct ? "✓" : "✗"}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm text-ink ${q.kind === "code-blank" ? "font-mono" : ""}`}
                  >
                    <span className="sr-only">
                      {r.correct ? "Correct: " : "Missed: "}
                    </span>
                    {correctAnswerText(q)}
                  </p>
                  {!r.correct && (
                    <p className="text-xs text-ink-muted">
                      You answered &ldquo;{r.given}&rdquo;
                    </p>
                  )}
                  <p className={`${kickerClass} mt-1`}>
                    {q.context.moduleTitle} · {q.context.subjectTitle}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-3">
          {(isModuleMode || isSubjectMode) ? (
            <>
              <Link
                href={getBackLink(moduleId, subjectId)}
                className="rounded-lg border border-taupe/60 px-4 py-2 text-sm text-ink hover:border-accent/60 hover:text-accent transition-colors"
              >
                {getBackLinkLabel(moduleId, subjectId)}
              </Link>
              <button
                type="button"
                onClick={() => void loadQuiz(Math.floor(Math.random() * 1e9))}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors"
              >
                Retry Quiz
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void loadQuiz(Math.floor(Math.random() * 1e9))}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors"
            >
              Try another quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[index];
  const result = phase === "feedback" ? results[index] : null;
  const answering = phase === "answering";

  const checkButton = (
    <button
      type="submit"
      disabled={!answering || !typed.trim()}
      className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Check
    </button>
  );

  const typedForm = (question: QuizQuestion & { answer: string }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitTyped(question);
      }}
      className="flex gap-2"
    >
      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        disabled={!answering}
        aria-label="Your answer"
        placeholder="Type your answer"
        autoComplete="off"
        spellCheck={false}
        className="w-full max-w-xs rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink disabled:opacity-60"
      />
      {checkButton}
    </form>
  );

  return frame(
    <div className="min-h-[15rem] flex flex-col">
      <div className="flex-1 space-y-4">
        {q.kind === "fill-blank" && (
          <>
            <p className="font-serif text-lg text-ink leading-relaxed">
              {q.prompt}
            </p>
            {typedForm(q)}
          </>
        )}

        {q.kind === "multi-choice" && (
          <>
            <p className="font-serif text-lg text-ink leading-relaxed">
              {q.prompt}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answerIndex;
                const isChosen = i === chosen;
                let cls = "border-taupe/40 text-ink hover:border-accent/60";
                if (!answering) {
                  if (isAnswer) cls = "border-accent bg-accent/10 text-ink";
                  else if (isChosen)
                    cls = `border-red-400/60 bg-red-500/10 ${wrongText}`;
                  else cls = "border-taupe/30 text-ink-faint";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => chooseOption(q, i)}
                    disabled={!answering}
                    aria-pressed={isChosen}
                    className={`flex items-baseline gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span className="font-mono text-label-sm text-ink-faint">
                      {"ABCD"[i]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {q.kind === "code-blank" && (
          <>
            <p className="text-sm text-ink-muted">
              Fill in the blank to complete this snippet.
            </p>
            <div className="relative">
              <span className="absolute top-2 right-3 font-mono text-label-sm uppercase tracking-[0.1em] text-ink-faint">
                {q.language}
              </span>
              <pre className="rounded-lg bg-ink/5 p-4 pr-16 overflow-x-auto">
                <code className="font-mono text-sm text-ink leading-relaxed">
                  {q.promptCode}
                </code>
              </pre>
            </div>
            {typedForm(q)}
          </>
        )}

        <div aria-live="polite">
          {result && (
            <div className="space-y-1 pt-1">
              {result.correct ? (
                <p className="text-sm font-medium text-accent">✓ Correct</p>
              ) : (
                <p className={`text-sm font-medium ${wrongText}`}>
                  ✗ Not quite — the answer is{" "}
                  <span
                    className={`text-ink font-semibold ${q.kind === "code-blank" ? "font-mono" : ""}`}
                  >
                    {correctAnswerText(q)}
                  </span>
                </p>
              )}
              <p className={kickerClass}>
                From {q.context.moduleTitle} · {q.context.subjectTitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="pt-4">
          <button
            type="button"
            ref={nextRef}
            onClick={() => {
              if (index + 1 === total && (isModuleMode || isSubjectMode)) {
                void submitResults();
              }
              next(total);
            }}
            className="rounded-lg border border-taupe/60 px-4 py-2 text-sm text-ink hover:border-accent/60 hover:text-accent transition-colors"
          >
            {index + 1 === total ? "See score →" : "Next →"}
          </button>
        </div>
      )}
    </div>,
    dots
  );
}