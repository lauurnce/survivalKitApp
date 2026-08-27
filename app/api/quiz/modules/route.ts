import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { isUnlockedBy, type ActiveSub } from "@/lib/account";
import { isUuid } from "@/lib/validation";
import { verifyDeviceCookie, DEVICE_COOKIE } from "@/lib/auth/deviceCookie";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

    if (!deviceId) {
      return NextResponse.json<ModuleQuizInfo[]>([]);
    }

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // Query module_progress by device_id (primary) with user_id fallback for authenticated users
    let progressQuery = supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("device_id", deviceId);

    if (userId) {
      progressQuery = progressQuery.or(`device_id.eq.${deviceId},user_id.eq.${userId}`);
    }

    // Query module_quiz_progress by user_id with device_id fallback
    let quizProgressQuery = supabase
      .from("module_quiz_progress")
      .select("module_id, score, total_questions, completed_at")
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
      supabase.from("subjects").select("id, title, year_id, semester, years(id, label)"),
      quizProgressQuery,
    ]);

    const doneModules = new Map((progressRes.data ?? []).map((r) => [r.module_id, r.completed_at]));
    if (doneModules.size === 0) {
      return NextResponse.json<ModuleQuizInfo[]>([]);
    }

    const activeSubs = (subsRes.data ?? []) as ActiveSub[];
    const subjectById = new Map(
      (subjectsRes.data ?? []).map((s) => [s.id, s]),
    );
    const moduleById = new Map(
      (modulesRes.data ?? []).map((m) => [m.id, m]),
    );
    const quizProgressByModule = new Map(
      (quizProgressRes.data ?? []).map((q) => [q.module_id, q]),
    );

    const { data: sections } = await supabase
      .from("sections")
      .select("module_id, body_md")
      .eq("kind", "content")
      .in("module_id", Array.from(doneModules.keys()));

    const sectionsByModule = new Map<string, string[]>();
    for (const s of sections ?? []) {
      if (!s.body_md) continue;
      const list = sectionsByModule.get(s.module_id) ?? [];
      list.push(s.body_md);
      sectionsByModule.set(s.module_id, list);
    }

    const results: ModuleQuizInfo[] = [];

    for (const [moduleId, completedAt] of doneModules) {
      const mod = moduleById.get(moduleId);
      if (!mod) continue;

      const subject = subjectById.get(mod.subject_id);
      if (!subject) continue;

      if (!isUnlockedBy(activeSubs, subject.year_id, subject.id)) continue;

      const year = (subject as unknown as { years: { id: string; label: string } | null }).years;
      if (!year) continue;

      const hasQuizMaterial = (sectionsByModule.get(moduleId) ?? []).length > 0;
      const quizProgress = quizProgressByModule.get(moduleId);

      results.push({
        moduleId,
        moduleTitle: mod.title,
        subjectTitle: subject.title,
        yearLabel: year.label,
        semester: subject.semester,
        completedAt,
        hasQuizMaterial,
        quizTaken: !!quizProgress,
        lastScore: quizProgress?.score,
        lastTotal: quizProgress?.total_questions,
        lastTakenAt: quizProgress?.completed_at,
      });
    }

    results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}