import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";

export const dynamic = "force-dynamic";

interface SubmitRequest {
  score: number;
  totalQuestions: number;
  seed: number;
  answers?: Array<{ index: number; given: string; correct: boolean }>;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

    if (!deviceId) {
      return NextResponse.json({ error: "No device ID" }, { status: 400 });
    }

    const { moduleId } = await params;
    if (!isUuid(moduleId)) {
      return NextResponse.json({ error: "Invalid module ID" }, { status: 400 });
    }

    const body = (await req.json()) as SubmitRequest;
    const { score, totalQuestions, seed, answers } = body;

    if (
      typeof score !== "number" ||
      typeof totalQuestions !== "number" ||
      typeof seed !== "number" ||
      score < 0 ||
      score > totalQuestions ||
      totalQuestions <= 0
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Check module_progress by device_id (primary) with user_id fallback
    let progressQuery = supabase
      .from("module_progress")
      .select("completed_at")
      .eq("module_id", moduleId)
      .eq("device_id", deviceId);

    if (userId) {
      progressQuery = progressQuery.or(`device_id.eq.${deviceId},user_id.eq.${userId}`);
    }

    const [progressRes, subsRes, moduleRes, subjectRes] = await Promise.all([
      progressQuery.maybeSingle(),
      isUuid(userId)
        ? supabase
            .from("subscriptions")
            .select("year_id, subject_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gt("current_period_end", now)
        : { data: [] as ActiveSub[] },
      supabase.from("modules").select("id, subject_id").eq("id", moduleId).maybeSingle(),
      supabase.from("subjects").select("id, year_id").eq("id", (await supabase.from("modules").select("subject_id").eq("id", moduleId).maybeSingle()).data?.subject_id ?? "").maybeSingle(),
    ]);

    const progress = progressRes.data;
    if (!progress) {
      return NextResponse.json({ error: "Module not completed" }, { status: 400 });
    }

    const mod = moduleRes.data;
    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    const subject = subjectRes.data;
    if (!subject || !isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
      return NextResponse.json({ error: "Module not accessible" }, { status: 403 });
    }

    // Upsert with both device_id (if available) and user_id
    const upsertPayload: Record<string, unknown> = {
      module_id: moduleId,
      completed_at: new Date().toISOString(),
      score,
      total_questions: totalQuestions,
      seed,
    };

    if (deviceId) upsertPayload.device_id = deviceId;
    if (isUuid(userId)) upsertPayload.user_id = userId;

    const { error: upsertError } = await supabase
      .from("module_quiz_progress")
      .upsert(upsertPayload, { onConflict: "device_id,module_id" });

    if (upsertError) {
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    if (answers && answers.length > 0) {
      const answerRows = answers.map((a) => ({
        module_id: moduleId,
        question_idx: a.index,
        given: a.given,
        correct: a.correct,
        answered_at: new Date().toISOString(),
        ...(deviceId ? { device_id: deviceId } : {}),
        ...(isUuid(userId) ? { user_id: userId } : {}),
      }));

      const { error: answersError } = await supabase
        .from("module_quiz_answers")
        .upsert(answerRows, { onConflict: "device_id,module_id,question_idx" });

      if (answersError) {
        console.error("Failed to save quiz answers:", answersError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}