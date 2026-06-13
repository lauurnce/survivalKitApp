import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { isUnlocked } from "@/lib/unlocks";

interface Params {
  params: Promise<{ sectionId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { sectionId } = await params;
  const deviceId = req.headers.get("x-device-id") ?? "";
  const supabase = createServerClient();

  // Look up section to get module_id
  const { data: section } = await supabase
    .from("sections")
    .select("id, module_id, kind, heading, body_md")
    .eq("id", sectionId)
    .single();

  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (section.kind !== "activity") {
    return NextResponse.json({ error: "Not an activity" }, { status: 400 });
  }

  const unlocked = await isUnlocked(deviceId, section.module_id);
  if (!unlocked) {
    return NextResponse.json({ error: "Locked" }, { status: 403 });
  }

  return NextResponse.json({
    id: section.id,
    heading: section.heading,
    body_md: section.body_md,
  });
}
