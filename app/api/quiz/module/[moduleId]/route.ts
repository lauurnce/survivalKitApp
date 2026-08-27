import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { buildQuiz, type SectionInput } from "@/lib/quiz/generate";
import type { QuizResponse } from "@/lib/quiz/types";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";

export const dynamic = "force-dynamic";

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 15;

function hashSeed(moduleId: string, userId: string): number {
  let hash = 0;
  const str = moduleId + userId;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function countExtractableFacts(bodyMd: string): number {
  const boldMatches = bodyMd.match(/\*\*[^*]+\*\*/g) ?? [];
  const codeBlocks = bodyMd.match(/```\w+[\s\S]*?```/g) ?? [];
  return boldMatches.length + codeBlocks.length * 2;
}

export async function GET(
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

    const { moduleId } = await params;
    if (!isUuid(moduleId)) {
      return NextResponse.json({ error: "Invalid module ID" }, { status: 400 });
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Check module_progress by user_id (primary) with device_id fallback
    let progressQuery = supabase
      .from("module_progress")
      .select("completed_at")
      .eq("module_id", moduleId)
      .eq("user_id", userId);

    if (deviceId) {
      progressQuery = progressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
    }

    const [progressRes, subsRes, moduleRes, subjectRes, sectionsRes] = await Promise.all([
      progressQuery.maybeSingle(),
      isUuid(userId)
        ? supabase
            .from("subscriptions")
            .select("year_id, subject_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gt("current_period_end", now)
        : { data: [] as ActiveSub[] },
      supabase.from("modules").select("id, title, subject_id").eq("id", moduleId).maybeSingle(),
      supabase.from("subjects").select("id, title, year_id").eq("id", (await supabase.from("modules").select("subject_id").eq("id", moduleId).maybeSingle()).data?.subject_id ?? "").maybeSingle(),
      supabase.from("sections").select("body_md").eq("module_id", moduleId).eq("kind", "content"),
    ]);

    const progress = progressRes.data;
    if (!progress) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    const mod = moduleRes.data;
    if (!mod) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    const subject = subjectRes.data;
    if (!subject || !isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    const sectionBodies = (sectionsRes.data ?? []).map((s) => s.body_md).filter(Boolean);
    if (sectionBodies.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }

    let totalFacts = 0;
    for (const body of sectionBodies) {
      totalFacts += countExtractableFacts(body);
    }

    const questionCount = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, totalFacts));
    if (totalFacts < MIN_QUESTIONS) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }

    const seedParam = Number(req.nextUrl.searchParams.get("seed"));
    const seed = Number.isInteger(seedParam) ? seedParam : hashSeed(moduleId, userId);

    const inputs: SectionInput[] = sectionBodies.map((bodyMd) => ({
      bodyMd,
      moduleTitle: mod.title,
      subjectTitle: subject.title,
    }));

    const questions = buildQuiz(inputs, { count: questionCount, seed });
    if (questions.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }

    return NextResponse.json<QuizResponse>({ questions });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}