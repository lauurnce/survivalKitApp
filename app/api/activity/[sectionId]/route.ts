import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isSubscribed } from "@/lib/subscriptions";
import { isUnlocked } from "@/lib/unlocks";

interface Params {
  params: Promise<{ sectionId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { sectionId } = await params;
  const deviceId = req.headers.get("x-device-id") ?? "";
  const supabase = createServerClient();

  // Fetch section + walk up to subject/year in one query so we can check subscription.
  const { data: section } = await supabase
    .from("sections")
    .select(
      "id, module_id, kind, heading, body_md, ide_language, starter_code, modules(subject_id, subjects(year_id))"
    )
    .eq("id", sectionId)
    .single();

  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (section.kind !== "activity") {
    return NextResponse.json({ error: "Not an activity" }, { status: 400 });
  }

  const mod = Array.isArray(section.modules) ? section.modules[0] : section.modules;
  const subjectId: string | null = mod?.subject_id ?? null;
  const sub = mod ? (Array.isArray(mod.subjects) ? mod.subjects[0] : mod.subjects) : null;
  const yearId: string | null = sub?.year_id ?? null;

  // Access is granted if the device has an active subscription (paid path) OR
  // an admin-approved manual unlock (legacy GCash path).
  const hasSubscription =
    yearId && subjectId
      ? await isSubscribed(deviceId, yearId, subjectId)
      : false;

  const hasUnlock = hasSubscription ? false : await isUnlocked(deviceId, section.module_id);

  if (!hasSubscription && !hasUnlock) {
    return NextResponse.json({ error: "Locked" }, { status: 403 });
  }

  return NextResponse.json({
    id: section.id,
    heading: section.heading,
    body_md: section.body_md,
    ide_language: section.ide_language,
    starter_code: section.starter_code,
  });
}
