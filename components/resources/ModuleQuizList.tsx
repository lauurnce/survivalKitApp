"use client";

import { useEffect, useState } from "react";
import { ModuleQuizCard } from "./ModuleQuizCard";

interface ModuleQuizInfo {
  moduleId: string;
  moduleTitle: string;
  subjectTitle: string;
  yearLabel: string;
  semester: number;
  completedAt: string;
  hasQuizMaterial: boolean;
  quizTaken: boolean;
  lastScore?: number;
  lastTotal?: number;
  lastTakenAt?: string;
}

export function ModuleQuizList() {
  const [quizzes, setQuizzes] = useState<ModuleQuizInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/quiz/modules");
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        const data = await res.json();
        setQuizzes(data);
      } catch {
        setError("Couldn't load your quizzes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-taupe/30 p-5">
            <div className="h-4 w-1/4 rounded bg-taupe/30 mb-2" />
            <div className="h-5 w-1/2 rounded bg-taupe/30" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-taupe/30 p-6 space-y-3 text-center">
        <p className="text-sm text-ink-muted">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mx-auto rounded-lg border border-taupe/60 px-4 py-2 text-sm text-ink hover:border-accent/60 hover:text-accent transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const availableQuizzes = quizzes.filter((q) => q.hasQuizMaterial);
  const unavailableQuizzes = quizzes.filter((q) => !q.hasQuizMaterial);

  if (quizzes.length === 0) {
    return (
      <div className="rounded-xl border border-taupe/30 p-8 text-center space-y-3">
        <p className="text-sm text-ink-muted">
          Complete your first module to unlock practice quizzes.
        </p>
        <p className="text-xs text-ink-faint">
          Quizzes are generated from the lessons in each module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {availableQuizzes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-ink">Your Quizzes ({availableQuizzes.length})</h4>
            {availableQuizzes.filter((q) => q.quizTaken).length > 0 && (
              <span className="text-xs text-ink-muted">
                {availableQuizzes.filter((q) => q.quizTaken).length} taken
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableQuizzes.map((quiz) => (
              <ModuleQuizCard key={quiz.moduleId} info={quiz} />
            ))}
          </div>
        </section>
      )}

      {unavailableQuizzes.length > 0 && (
        <section className="space-y-3">
          <h4 className="font-medium text-ink-faint">
            No Quiz Material Yet ({unavailableQuizzes.length})
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unavailableQuizzes.map((quiz) => (
              <ModuleQuizCard key={quiz.moduleId} info={quiz} />
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            These modules don&apos;t have enough extractable content for quizzes.
            As more lessons are added, quizzes will become available.
          </p>
        </section>
      )}
    </div>
  );
}