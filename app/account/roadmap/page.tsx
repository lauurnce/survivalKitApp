import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { DEVICE_COOKIE, verifyDeviceCookie } from "@/lib/auth/deviceCookie";
import { getAccountOverview, getDashboardData } from "@/lib/account";
import { signOutAction } from "../../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { NavRail } from "@/components/dashboard/NavRail";
import { RoadmapPageClient } from "@/components/account/RoadmapPageClient";

export const metadata: Metadata = {
  title: "Academic Roadmap",
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account/roadmap");

  // events is device_id-only (no user_id column) — same cookie the dashboard
  // uses to attribute activity/streak data to this viewer.
  const cookieStore = await cookies();
  const deviceId = verifyDeviceCookie(cookieStore.get(DEVICE_COOKIE)?.value);

  const [overview, data] = await Promise.all([
    getAccountOverview(userId),
    getDashboardData(userId, deviceId),
  ]);

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <NavRail overallDone={overview.overallDone} overallTotal={overview.overallTotal} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-end gap-3 px-4 sm:px-8 py-3 border-b border-taupe/30">
          <ThemeToggleInline />
          <form action={signOutAction}>
            <button className="text-xs text-ink-muted underline">Log out</button>
          </form>
        </div>
        <RoadmapPageClient initialData={data} />
      </div>
    </div>
  );
}
