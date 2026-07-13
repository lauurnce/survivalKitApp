import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/profileStore";

export const dynamic = "force-dynamic";

// Minimal session probe for client components on ISR pages (which cannot read
// the session during render). Never errors outward — personalization is
// best-effort.
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ firstName: null });
    const profile = await getProfile(userId);
    return NextResponse.json({ firstName: profile?.firstName ?? null });
  } catch {
    return NextResponse.json({ firstName: null });
  }
}
