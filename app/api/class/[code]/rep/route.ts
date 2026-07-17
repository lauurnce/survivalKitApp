import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { createServerClient } from "@/lib/supabase/server";
import { isValidClassCodeShape } from "@/lib/classCode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const jar = await cookies();
  const deviceId = verifyDeviceCookie(jar.get(DEVICE_COOKIE)?.value);
  if (!deviceId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  if (!isValidClassCodeShape(code)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = createServerClient();
  const { data: cls } = await supabase
    .from("classes")
    .select("id, subject_id, year_id, seat_cap, current_period_end, rep_device_id")
    .eq("code", code)
    .maybeSingle();

  if (!cls) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cls.rep_device_id !== deviceId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: members } = await supabase
    .from("class_members")
    .select("device_id, joined_at")
    .eq("class_id", cls.id)
    .order("joined_at", { ascending: true });

  const { data: pending } = await supabase
    .from("class_join_requests")
    .select("id, created_at")
    .eq("class_id", cls.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Total module count: scoped to one subject, or every subject in the year
  // if this is an all-subjects class (subject_id IS NULL).
  const modulesQuery = cls.subject_id
    ? supabase.from("modules").select("id").eq("subject_id", cls.subject_id)
    : supabase.from("modules").select("id, subjects!inner(year_id)").eq("subjects.year_id", cls.year_id);
  const { data: allModules } = await modulesQuery;
  const totalModules = allModules?.length ?? 0;
  const moduleIds = new Set((allModules ?? []).map((m: { id: string }) => m.id));

  // N+1 query loop: acceptable for v1 given practical class sizes (seat_cap
  // tops out around ~55 per the pricing model). If dashboard load times
  // become an issue, batch this into a single
  // `module_progress.device_id IN (...)` query — not worth the added
  // complexity here per YAGNI.
  const roster = await Promise.all(
    (members ?? []).map(async (m: { device_id: string; joined_at: string }, idx: number) => {
      const { data: progressRows } = await supabase
        .from("module_progress")
        .select("module_id")
        .eq("device_id", m.device_id);
      const completed = (progressRows ?? []).filter((p: { module_id: string }) =>
        moduleIds.has(p.module_id)
      ).length;
      return { ordinal: idx + 1, completed, total: totalModules };
    })
  );

  return NextResponse.json({
    summary: {
      seatsFilled: members?.length ?? 0,
      seatCap: cls.seat_cap,
      expiresAt: cls.current_period_end,
      subjectId: cls.subject_id,
      yearId: cls.year_id,
      scope: cls.subject_id ? "subject" : "all",
    },
    pending: (pending ?? []).map((p: { id: string; created_at: string }) => ({
      id: p.id,
      createdAt: p.created_at,
    })),
    roster,
  });
}
