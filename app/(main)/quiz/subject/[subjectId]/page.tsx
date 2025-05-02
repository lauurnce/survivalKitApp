import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";
import { ReviewQuiz } from "@/components/account/ReviewQuiz";
import { BackLink } from "@/components/BackLink";
import { buildUnlockHref } from "@/lib/subscribeRedirect";
import { QuizUnavailable } from "./QuizUnavailable";

export const dynamic = "force-dynamic";

interface SubjectData {
  id: string;
  title: string;
  year_id: string;
  semester: number;
}

// One lookup per request, shared by generateMetadata and the page.
const getSubject = cache(async (subjectId: string): Promise<SubjectData | null> => {
  if (!isUuid(subjectId)) return null;
  const { data } = await createServerClient()
    .from("subjects")
    .select("id, title, year_id, semester")
    .eq("id", subjectId)
    .maybeSingle();
  return (data as SubjectData | null) ?? null;
});

// Titles the tab with the subject name instead of the raw id (QA CR-06).
// Unknown ids 404 here as well as in the page.
export async function generateMetadata({ params }: { params: Promise<{ subjectId: string }> }): Promise<Metadata> {
  const { subjectId } = await params;
  const subject = await getSubject(subjectId);
  if (!subject) notFound();
  return { title: `Quiz • ${subject.title}` };
}

export default async function SubjectQuizPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;

  // Unknown subject ids are the only real 404, and they are checked before the
  // sign-in prompt so a signed-out visitor gets one too. A subject that exists
  // but that this student can't quiz on yet gets an explanation and a next step.
  const subject = await getSubject(subjectId);
  if (!subject) {
    notFound();
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return (
      <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
        <BackLink href="/resources" label="Resources" />
        <div className="rounded-xl border border-taupe/30 p-8 text-center space-y-4">
          <h1 className="font-serif text-2xl text-ink">Sign in to take this quiz</h1>
          <p className="text-ink-muted">You need to be signed in to access subject quizzes.</p>
          <a
            href={`/login?next=/quiz/subject/${subjectId}`}
            className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();

  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

  const [progressRes, subsRes] = await Promise.all([
    supabase.from("module_progress").select("module_id").eq("user_id", userId),
    isUuid(userId)
      ? supabase
          .from("subscriptions")
          .select("year_id, subject_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("current_period_end", now)
      : { data: [] as ActiveSub[] },
  ]);

  const activeSubs = (subsRes.data ?? []) as ActiveSub[];
  if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
    return (
      <QuizUnavailable
        reason="locked"
        subjectTitle={subject.title}
        ctaHref={buildUnlockHref({ yearId: subject.year_id, subjectId: subject.id })}
      />
    );
  }

  // Fallback to device_id if user_id query returns nothing
  if ((!progressRes.data || progressRes.data.length === 0) && deviceId) {
    const deviceProgress = await supabase
      .from("module_progress")
      .select("module_id")
      .eq("device_id", deviceId);
    progressRes.data = deviceProgress.data;
  }

  // Verify user has completed at least one module in this subject
  const completedModuleIds = new Set((progressRes.data ?? []).map((r) => r.module_id));
  const { data: subjectModules } = await supabase
    .from("modules")
    .select("id")
    .eq("subject_id", subjectId);

  const hasCompletedInSubject = (subjectModules ?? []).some((m) => completedModuleIds.has(m.id));
  if (!hasCompletedInSubject) {
    return (
      <QuizUnavailable
        reason="unfinished"
        subjectTitle={subject.title}
        ctaHref={`/year/${subject.year_id}/subjects/${subject.id}/modules`}
      />
    );
  }

  return (
    <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
      <BackLink href="/resources" label="Resources" />
      <header className="space-y-2">
        <p className="label-sm text-accent">{subject.title}</p>
        <h1 className="font-serif text-display-md text-ink">Subject Quiz</h1>
        <p className="text-ink-muted">Test your knowledge across every module you&apos;ve marked done in this subject.</p>
      </header>
      <ReviewQuiz
        subjectId={subject.id}
        subjectTitle={subject.title}
      />
    </main>
  );
}