import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";

export const dynamic = "force-dynamic";

interface SubmitPayload {
  score: number;
  totalQuestions: number;
  seed: number;
  answers: Array<{
    index: number;
    given: string;
    correct: boolean;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

    const { subjectId } = await params;
    if (!isUuid(subjectId)) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    const body = (await req.json()) as SubmitPayload;
    const { score, totalQuestions, seed, answers } = body;

    if (
      typeof score !== "number" ||
      typeof totalQuestions !== "number" ||
      typeof seed !== "number" ||
      !Array.isArray(answers)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify user has completed at least one module in this subject by user_id (primary) with device_id fallback
    let progressQuery = supabase
      .from("module_progress")
      .select("module_id")
      .eq("user_id", userId);

    if (deviceId) {
      progressQuery = progressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
    }

    const { data: completedModules } = await progressQuery;
    if (!completedModules || completedModules.length === 0) {
      return NextResponse.json({ error: "No completed modules" }, { status: 400 });
    }

    // Verify subject exists and get its modules
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("subject_id", subjectId);

    const subjectModuleIds = new Set((modules ?? []).map((m) => m.id));
    const hasCompletedInSubject = completedModules.some((m) => subjectModuleIds.has(m.module_id));
    if (!hasCompletedInSubject) {
      return NextResponse.json({ error: "No completed modules in this subject" }, { status: 400 });
    }

    // Verify subject is unlocked
    const { data: subject } = await supabase
      .from("subjects")
      .select("id, title, year_id")
      .eq("id", subjectId)
      .maybeSingle();

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("year_id, subject_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("current_period_end", now);

    const activeSubs = (subs ?? []) as ActiveSub[];
    if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
      return NextResponse.json({ error: "Subject not unlocked" }, { status: 403 });
    }

    // Insert progress record
    const { data: progress, error: progressError } = await supabase
      .from("subject_quiz_progress")
      .insert({
        user_id: userId,
        subject_id: subjectId,
        score,
        total_questions: totalQuestions,
        seed,
      })
      .select("id")
      .single();

    if (progressError || !progress) {
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    // Insert answers
    const answerRows = answers.map((a) => ({
      progress_id: progress.id,
      question_index: a.index,
      given: a.given,
      correct: a.correct,
      module_id: "00000000-0000-0000-0000-000000000000", // placeholder - would need question-to-module mapping
    }));

    await supabase.from("subject_quiz_answers").insert(answerRows);

    return NextResponse.json({ success: true, progressId: progress.id });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}