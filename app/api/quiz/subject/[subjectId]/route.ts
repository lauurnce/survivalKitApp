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
const MAX_QUESTIONS = 20;

function hashSeed(subjectId: string, userId: string): number {
  let hash = 0;
  const str = subjectId + userId;
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

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Get all completed modules for this subject by user_id (primary) with device_id fallback
    let progressQuery = supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("user_id", userId);

    if (deviceId) {
      progressQuery = progressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
    }

    const [progressRes, subsRes, subjectRes, modulesRes] = await Promise.all([
      progressQuery,
      isUuid(userId)
        ? supabase
            .from("subscriptions")
            .select("year_id, subject_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gt("current_period_end", now)
        : { data: [] as ActiveSub[] },
      supabase.from("subjects").select("id, title, year_id, semester").eq("id", subjectId).maybeSingle(),
      supabase.from("modules").select("id, title").eq("subject_id", subjectId),
    ]);

    const subject = subjectRes.data;
    if (!subject) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    // Filter completed modules that belong to this subject
    const subjectModuleIds = new Set((modulesRes.data ?? []).map((m) => m.id));
    const completedModules = (progressRes.data ?? [])
      .filter((p) => subjectModuleIds.has(p.module_id))
      .map((p) => p.module_id);

    if (completedModules.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    // Fetch sections for completed modules
    const { data: sections } = await supabase
      .from("sections")
      .select("module_id, body_md")
      .eq("kind", "content")
      .in("module_id", completedModules);

    const modulesMap = new Map((modulesRes.data ?? []).map((m) => [m.id, m.title]));

    const sectionBodies: { bodyMd: string; moduleTitle: string }[] = [];
    for (const s of sections ?? []) {
      if (s.body_md && modulesMap.has(s.module_id)) {
        sectionBodies.push({ bodyMd: s.body_md, moduleTitle: modulesMap.get(s.module_id)! });
      }
    }

    if (sectionBodies.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }

    let totalFacts = 0;
    for (const { bodyMd } of sectionBodies) {
      totalFacts += countExtractableFacts(bodyMd);
    }

    const questionCount = Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, totalFacts));
    if (totalFacts < MIN_QUESTIONS) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }

    const seedParam = Number(req.nextUrl.searchParams.get("seed"));
    const seed = Number.isInteger(seedParam) ? seedParam : hashSeed(subjectId, userId);

    const inputs: SectionInput[] = sectionBodies.map(({ bodyMd, moduleTitle }) => ({
      bodyMd,
      moduleTitle,
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