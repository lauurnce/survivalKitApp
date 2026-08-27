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

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const { moduleId } = await params;
  return { title: `Quiz • Module ${moduleId}` };
}

interface ModuleData {
  id: string;
  title: string;
  subject_id: string;
}

interface SubjectData {
  id: string;
  title: string;
  year_id: string;
}

export default async function ModuleQuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;

  if (!isUuid(moduleId)) {
    notFound();
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return (
      <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
        <BackLink href="/resources" label="Resources" />
        <div className="rounded-xl border border-taupe/30 p-8 text-center space-y-4">
          <h1 className="font-serif text-2xl text-ink">Sign in to take this quiz</h1>
          <p className="text-ink-muted">You need to be signed in to access module quizzes.</p>
          <a
            href={`/login?next=/quiz/module/${moduleId}`}
            className="inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper hover:bg-accent-dark transition-colors"
          >
            Sign in
          </a>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

  const supabase = createServerClient();
  const now = new Date().toISOString();

  const [progressRes, subsRes, moduleRes] = await Promise.all([
    supabase.from("module_progress").select("completed_at").eq("user_id", userId).eq("module_id", moduleId).maybeSingle(),
    isUuid(userId)
      ? supabase
          .from("subscriptions")
          .select("year_id, subject_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .gt("current_period_end", now)
      : { data: [] as ActiveSub[] },
    supabase.from("modules").select("id, title, subject_id").eq("id", moduleId).maybeSingle(),
  ]);

  let progress = progressRes.data;
  if (!progress && deviceId) {
    // Fallback to device_id if user_id query returns nothing
    const deviceProgress = await supabase
      .from("module_progress")
      .select("completed_at")
      .eq("device_id", deviceId)
      .eq("module_id", moduleId)
      .maybeSingle();
    if (!deviceProgress.data) notFound();
    progress = deviceProgress.data;
  } else if (!progress) {
    notFound();
  }

  const mod = moduleRes.data as ModuleData | null;
  if (!mod) {
    notFound();
  }

  const activeSubs = (subsRes.data ?? []) as ActiveSub[];

  const subjectRes = await supabase
    .from("subjects")
    .select("id, title, year_id")
    .eq("id", mod.subject_id)
    .maybeSingle();

  const subject = subjectRes.data as SubjectData | null;
  if (!subject || !isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-wide px-4 sm:px-8 py-12 space-y-10">
      <BackLink href="/resources" label="Resources" />
      <header className="space-y-2">
        <p className="label-sm text-accent">{subject.title}</p>
        <h1 className="font-serif text-display-md text-ink">{mod.title}</h1>
        <p className="text-ink-muted">Test your knowledge of this module.</p>
      </header>
      <ReviewQuiz
        moduleId={mod.id}
        moduleTitle={mod.title}
        subjectTitle={subject.title}
      />
    </main>
  );
}