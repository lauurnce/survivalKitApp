import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDeviceType } from "@/lib/deviceType";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, device_id, source, willing_to_pay, needs_capstone } = body;

  if (!email || !name || !device_id || !source) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (source !== "coming_soon" && source !== "paywall") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const device_type = getDeviceType(ua);

  const supabase = createServerClient();

  const { error } = await supabase.from("waitlist").upsert(
    {
      email,
      name,
      device_id,
      source,
      willing_to_pay: willing_to_pay ?? null,
      needs_capstone: needs_capstone ?? null,
      device_type,
    },
    { onConflict: "email,source", ignoreDuplicates: true }
  );

  if (error) console.error("[waitlist] upsert error:", error.message);

  return NextResponse.json({ success: true });
}
