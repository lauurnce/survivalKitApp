import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { signOutAction } from "../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const overview = await getAccountOverview(userId);

  const unlockedSubjects = overview.subjects.filter((s) => s.unlocked);

  return (
    <main className="min-h-screen bg-paper">
      {/* Top bar — sticky so it stays visible while scrolling */}
      <div className="sticky top-0 z-10 border-b border-taupe/30 bg-paper px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl text-ink">My Progress</h1>
          <p className="text-xs text-ink-muted">{overview.overallDone}/{overview.overallTotal} modules done</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleInline />
          <form action={signOutAction}>
            <button className="text-xs text-ink-muted underline">Log out</button>
          </form>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* LEFT — Timeline (client component for dropdowns + subscribe modals) */}
        <AccountSidebar
          unlockedSubjects={unlockedSubjects}
          years={overview.years}
        />

        {/* RIGHT — Module list for each unlocked subject */}
        <section className="flex-1 px-8 py-8 overflow-y-auto">
          {unlockedSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <p className="font-serif text-2xl text-ink">Nothing unlocked yet</p>
              <p className="text-sm text-ink-muted">Unlock a subject to see your module progress here.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {unlockedSubjects.map((s) => {
                // "Continue" jumps to the first unfinished lesson; if every
                // module is done, fall back to the subject's module list.
                const nextModule = s.modules.find((m) => !m.done);
                const continueHref = nextModule
                  ? `/year/${s.yearId}/subjects/${s.id}/modules/${nextModule.id}`
                  : `/year/${s.yearId}/subjects/${s.id}/modules`;
                return (
                <div key={s.id}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-serif text-xl text-ink">{s.title}</h2>
                    <span className="text-sm text-ink-muted">{s.doneCount}/{s.totalCount} done</span>
                  </div>
                  <ol className="space-y-2">
                    {s.modules.map((m, idx) => (
                      <li key={m.id}>
                        <Link
                          href={`/year/${s.yearId}/subjects/${s.id}/modules/${m.id}`}
                          className={`flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors hover:border-accent/50 ${
                            m.done
                              ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                              : "border-taupe/30 bg-paper hover:bg-taupe/5"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                              m.done
                                ? "bg-accent text-paper"
                                : "border border-taupe/60 text-ink-faint"
                            }`}
                          >
                            {m.done ? "✓" : idx + 1}
                          </span>
                          <span className={`text-sm ${m.done ? "text-ink" : "text-ink-muted"}`}>
                            {m.title}
                          </span>
                          {!m.done && s.modules.slice(0, idx).every((prev) => prev.done) && (
                            <span className="ml-auto rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                              Next up
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={continueHref}
                    className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper"
                  >
                    Continue {s.title} →
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
