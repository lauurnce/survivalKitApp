import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { buildQuiz, type SectionInput } from "@/lib/quiz/generate";
import type { QuizResponse } from "@/lib/quiz/types";
import { isUuid } from "@/lib/validation";

export const dynamic = "force-dynamic";

const QUESTION_COUNT = 10;
// Bound the sections payload when a user has finished many modules.
const MAX_SOURCE_MODULES = 30;

// GET /api/quiz?seed=123
// Builds a review quiz from the sections of modules the signed-in user has
// completed within subjects they have unlocked. `seed` (optional integer)
// makes the quiz reproducible; omitted → random.
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    const [progressRes, subsRes, modulesRes, subjectsRes] = await Promise.all([
      supabase.from("module_progress").select("module_id").eq("user_id", userId),
      isUuid(userId)
        ? supabase
            .from("subscriptions")
            .select("year_id, subject_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gt("current_period_end", now)
        : { data: [] as ActiveSub[] },
      supabase.from("modules").select("id, title, subject_id"),
      supabase.from("subjects").select("id, title, year_id"),
    ]);

    const doneIds = new Set((progressRes.data ?? []).map((r) => r.module_id));
    if (doneIds.size === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    const subjectById = new Map(
      (subjectsRes.data ?? []).map((s) => [s.id, s]),
    );

    // Done modules whose subject the user has unlocked, with titles for
    // question attribution. Capped to bound the sections query.
    const sourceModules = (modulesRes.data ?? [])
      .filter((m) => {
        if (!doneIds.has(m.id)) return false;
        const subject = subjectById.get(m.subject_id);
        return !!subject && isUnlockedBy(activeSubs, subject.year_id, subject.id);
      })
      .slice(0, MAX_SOURCE_MODULES);

    if (sourceModules.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-progress" });
    }

    const { data: sections } = await supabase
      .from("sections")
      .select("module_id, body_md")
      .eq("kind", "content")
      .in("module_id", sourceModules.map((m) => m.id));

    const moduleById = new Map(sourceModules.map((m) => [m.id, m]));
    const inputs: SectionInput[] = (sections ?? []).flatMap((s) => {
      const mod = moduleById.get(s.module_id);
      if (!mod || !s.body_md) return [];
      return [
        {
          bodyMd: s.body_md,
          moduleTitle: mod.title,
          subjectTitle: subjectById.get(mod.subject_id)?.title ?? "",
        },
      ];
    });

    const seedParam = Number(req.nextUrl.searchParams.get("seed"));
    const seed = Number.isInteger(seedParam)
      ? seedParam
      : Math.floor(Math.random() * 2 ** 31);

    const questions = buildQuiz(inputs, { count: QUESTION_COUNT, seed });
    if (questions.length === 0) {
      return NextResponse.json<QuizResponse>({ questions: [], reason: "no-facts" });
    }
    return NextResponse.json<QuizResponse>({ questions });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
