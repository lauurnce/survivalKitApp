import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";

export const dynamic = "force-dynamic";

interface SubjectQuizInfo {
  subjectId: string;
  subjectTitle: string;
  yearLabel: string;
  semester: number;
  completedModules: number;
  totalModules: number;
  hasQuizMaterial: boolean;
  quizTaken: boolean;
  lastScore?: number;
  lastTotal?: number;
  lastTakenAt?: string;
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Query module_progress by user_id with device_id fallback
    let progressQuery = supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("user_id", userId);

    if (deviceId) {
      progressQuery = progressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
    }

    // Query subject_quiz_progress by user_id with device_id fallback
    let quizProgressQuery = supabase
      .from("subject_quiz_progress")
      .select("subject_id, score, total_questions, completed_at, seed")
      .eq("user_id", userId);

    if (deviceId) {
      quizProgressQuery = quizProgressQuery.or(`user_id.eq.${userId},device_id.eq.${deviceId}`);
    }

    const [progressRes, subsRes, modulesRes, subjectsRes, quizProgressRes] = await Promise.all([
      progressQuery,
      isUuid(userId)
        ? supabase
            .from("subscriptions")
            .select("year_id, subject_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .gt("current_period_end", now)
        : { data: [] as ActiveSub[] },
      supabase.from("modules").select("id, title, subject_id, sort_order"),
      supabase.from("subjects").select("id, title, year_id, semester, kind, years(id, label, sort_order)"),
      quizProgressQuery,
    ]);

    const doneModuleIds = (progressRes.data ?? []).map((r) => r.module_id);
    if (doneModuleIds.length === 0) {
      return NextResponse.json<SubjectQuizInfo[]>([]);
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    const subjectById = new Map(
      (subjectsRes.data ?? []).map((s) => [s.id, s]),
    );
    const moduleById = new Map(
      (modulesRes.data ?? []).map((m) => [m.id, m]),
    );

    // Group completed modules by subject
    const modulesBySubject = new Map<string, { moduleId: string; completedAt: string }[]>();
    for (const mod of progressRes.data ?? []) {
      const m = moduleById.get(mod.module_id);
      if (!m) continue;
      const subject = subjectById.get(m.subject_id);
      if (!subject) continue;
      if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) continue;

      const list = modulesBySubject.get(m.subject_id) ?? [];
      list.push({ moduleId: mod.module_id, completedAt: mod.completed_at });
      modulesBySubject.set(m.subject_id, list);
    }

    const quizProgressBySubject = new Map(
      (quizProgressRes.data ?? []).map((q) => [q.subject_id, q]),
    );

    // Check sections for quiz material in completed modules
    const { data: sections } = await supabase
      .from("sections")
      .select("module_id, body_md")
      .eq("kind", "content")
      .in("module_id", doneModuleIds);

    const sectionsByModule = new Map<string, string[]>();
    for (const s of sections ?? []) {
      if (!s.body_md) continue;
      const list = sectionsByModule.get(s.module_id) ?? [];
      list.push(s.body_md);
      sectionsByModule.set(s.module_id, list);
    }

    const results: SubjectQuizInfo[] = [];

    for (const [subjectId, completedModules] of modulesBySubject) {
      const subject = subjectById.get(subjectId);
      if (!subject) continue;

      const year = (subject as unknown as { years: { id: string; label: string; sort_order: number }[] | null }).years?.[0];
      if (!year) continue;

      // Check if any completed module has quiz material
      let hasQuizMaterial = false;
      for (const { moduleId } of completedModules) {
        if ((sectionsByModule.get(moduleId) ?? []).length > 0) {
          hasQuizMaterial = true;
          break;
        }
      }

      const totalModules = (await supabase
        .from("modules")
        .select("id", { count: "exact", head: true })
        .eq("subject_id", subjectId)).count ?? 0;

      const quizProgress = quizProgressBySubject.get(subjectId);

      results.push({
        subjectId,
        subjectTitle: subject.title,
        yearLabel: year.label,
        semester: subject.semester,
        completedModules: completedModules.length,
        totalModules,
        hasQuizMaterial,
        quizTaken: !!quizProgress,
        lastScore: quizProgress?.score,
        lastTotal: quizProgress?.total_questions,
        lastTakenAt: quizProgress?.completed_at,
      });
    }

    results.sort((a, b) => {
      // Sort by year, then semester, then subject sort_order
      const subjectA = subjectById.get(a.subjectId);
      const subjectB = subjectById.get(b.subjectId);
      const yearA = subjectA?.years?.[0]?.sort_order ?? 0;
      const yearB = subjectB?.years?.[0]?.sort_order ?? 0;
      if (yearA !== yearB) return yearA - yearB;
      if (a.semester !== b.semester) return a.semester - b.semester;
      return ((subjectA as unknown as { sort_order?: number }).sort_order ?? 0) - ((subjectB as unknown as { sort_order?: number }).sort_order ?? 0);
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}