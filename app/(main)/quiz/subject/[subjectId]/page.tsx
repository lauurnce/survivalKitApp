import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { createServerClient } from "@/lib/supabase/server";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";
import { ReviewQuiz } from "@/components/account/ReviewQuiz";
import { BackLink } from "@/components/BackLink";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ subjectId: string }> }): Promise<Metadata> {
  const { subjectId } = await params;
  return { title: `Quiz • Subject ${subjectId}` };
}

interface SubjectData {
  id: string;
  title: string;
  year_id: string;
  semester: number;
}

export default async function SubjectQuizPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;

  if (!isUuid(subjectId)) {
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

  const [progressRes, subsRes, subjectRes] = await Promise.all([
    supabase.from("module_progress").select("module_id").eq("user_id", userId),
    isUuid(userId)
      ? supabase
          .from("subscriptions")
          .select("year_id, subject_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("current_period_end", now)
      : { data: [] as ActiveSub[] },
    supabase.from("subjects").select("id, title, year_id, semester").eq("id", subjectId).maybeSingle(),
  ]);

  // Fallback to device_id if user_id query returns nothing
  if (!progressRes.data || progressRes.data.length === 0) {
    if (deviceId) {
      const deviceProgress = await supabase
        .from("module_progress")
        .select("module_id")
        .eq("device_id", deviceId);
      progressRes.data = deviceProgress.data;
    }
    if (!progressRes.data || progressRes.data.length === 0) {
      notFound();
    }
  }

  const subject = subjectRes.data as SubjectData | null;
  if (!subject) {
    notFound();
  }

  const activeSubs = (subsRes.data ?? []) as ActiveSub[];
  if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
    notFound();
  }

  // Verify user has completed at least one module in this subject
  const completedModuleIds = new Set((progressRes.data ?? []).map((r) => r.module_id));
  const { data: subjectModules } = await supabase
    .from("modules")
    .select("id")
    .eq("subject_id", subjectId);

  const hasCompletedInSubject = (subjectModules ?? []).some((m) => completedModuleIds.has(m.id));
  if (!hasCompletedInSubject) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
      <BackLink href="/resources" label="Resources" />
      <header className="space-y-2">
        <p className="label-sm text-accent">{subject.title}</p>
        <h1 className="font-serif text-display-md text-ink">Subject Quiz</h1>
        <p className="text-ink-muted">Test your knowledge across all completed modules in this subject.</p>
      </header>
      <ReviewQuiz
        subjectId={subject.id}
        subjectTitle={subject.title}
      />
    </main>
  );
}