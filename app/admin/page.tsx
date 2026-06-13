import { createServerClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

// Simple password gate via search param on first load, then header for API
async function checkAdminAuth(searchParams: Record<string, string>): Promise<boolean> {
  const pw = searchParams["pw"] ?? "";
  return pw === process.env.ADMIN_PASSWORD && !!pw;
}

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function AdminPage({ searchParams }: Props) {
  const sp = await searchParams;

  if (!(await checkAdminAuth(sp))) {
    return <AdminLogin />;
  }

  const supabase = createServerClient();

  // Top subjects by opens
  const { data: topSubjects } = await supabase
    .from("events")
    .select("subject_id, subjects(title)")
    .eq("event_type", "subject_open")
    .not("subject_id", "is", null)
    .limit(500);

  // Top modules by opens
  const { data: topModules } = await supabase
    .from("events")
    .select("module_id, modules(title)")
    .eq("event_type", "module_open")
    .not("module_id", "is", null)
    .limit(500);

  // Recent 7-day visit counts
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from("events")
    .select("event_type, created_at")
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: true });

  // Unlock funnel
  const { data: unlockClicks } = await supabase
    .from("events")
    .select("id")
    .eq("event_type", "unlock_click");
  const { data: unlockSubmitted } = await supabase
    .from("events")
    .select("id")
    .eq("event_type", "unlock_submitted");
  const { data: unlockApproved } = await supabase
    .from("unlocks")
    .select("id")
    .eq("status", "approved");

  return (
    <AdminDashboard
      topSubjects={topSubjects ?? []}
      topModules={topModules ?? []}
      recentEvents={recentEvents ?? []}
      unlockFunnel={{
        clicks: unlockClicks?.length ?? 0,
        submitted: unlockSubmitted?.length ?? 0,
        approved: unlockApproved?.length ?? 0,
      }}
      adminPw={sp["pw"]}
    />
  );
}

function AdminLogin() {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <form method="GET" className="flex flex-col gap-4 w-full max-w-sm">
        <p className="label mb-2">Admin Access</p>
        <h1 className="font-serif text-display-md text-ink mb-4">Enter password</h1>
        <input
          type="password"
          name="pw"
          placeholder="Admin password"
          className="border border-ink-faint bg-transparent px-4 py-3 font-sans text-sm text-ink outline-none focus:border-ink transition-colors"
          autoFocus
        />
        <button
          type="submit"
          className="border border-ink text-ink font-sans text-xs uppercase tracking-widest px-6 py-3 hover:bg-ink hover:text-paper transition-colors"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
