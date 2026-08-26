import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getDashboardData } from "@/lib/account";
import { RoadmapPageClient } from "@/components/account/RoadmapPageClient";

export const metadata: Metadata = {
  title: "Academic Roadmap",
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account/roadmap");

  const data = await getDashboardData(userId);

  return <RoadmapPageClient initialData={data} />;
}