import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview, pct } from "@/lib/account";
import { signOutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const overview = await getAccountOverview(userId);

  const unlockedSubjects = overview.subjects.filter((s) => s.unlocked);

  return (
    <main className="min-h-screen bg-paper">
      {/* Top bar */}
      <div className="border-b border-taupe/30 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl text-ink">My Progress</h1>
          <p className="text-xs text-ink-muted">{overview.overallDone}/{overview.overallTotal} modules done</p>
        </div>
        <form action={signOutAction}>
          <button className="text-xs text-ink-muted underline">Log out</button>
        </form>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* LEFT — Timeline */}
        <aside className="w-64 shrink-0 border-r border-taupe/30 px-5 py-8 space-y-8 overflow-y-auto">

          {/* Unlocked subjects at top */}
          {unlockedSubjects.length > 0 && (
            <section>
              <p className="text-label-sm tracking-widest uppercase text-accent mb-4">Unlocked</p>
              <ol className="relative space-y-1 pl-5 border-l-2 border-accent/40">
                {unlockedSubjects.map((s) => {
                  const p = pct(s.doneCount, s.totalCount);
                  return (
                    <li key={s.id} className="relative pb-4 last:pb-0">
                      <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-accent border-2 border-paper" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-ink leading-snug">{s.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-taupe/30 overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-xs text-accent font-medium shrink-0">{p}%</span>
                        </div>
                        <Link
                          href={`/year/${s.yearId}/subjects/${s.id}`}
                          className="inline-block text-xs text-accent underline underline-offset-2"
                        >
                          Continue →
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Locked subjects grouped by year */}
          {overview.years.map((year) => {
            const lockedInYear = year.subjects.filter((s) => !s.unlocked);
            if (lockedInYear.length === 0) return null;
            return (
              <section key={year.yearId}>
                <p className="text-label-sm tracking-widest uppercase text-ink-faint mb-4">{year.label}</p>
                <ol className="relative space-y-1 pl-5 border-l-2 border-taupe/30">
                  {lockedInYear.map((s) => (
                    <li key={s.id} className="relative pb-4 last:pb-0 opacity-50">
                      <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full bg-taupe/40 border-2 border-paper" />
                      <div className="space-y-1">
                        <p className="text-xs text-ink-muted leading-snug">{s.title}</p>
                        <Link
                          href={`/year/${s.yearId}/subjects/${s.id}`}
                          className="inline-block text-xs text-ink-faint underline underline-offset-2"
                        >
                          Unlock ₱50
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </aside>

        {/* RIGHT — Module list for each unlocked subject */}
        <section className="flex-1 px-8 py-8 overflow-y-auto">
          {unlockedSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
              <p className="font-serif text-2xl text-ink">Nothing unlocked yet</p>
              <p className="text-sm text-ink-muted">Unlock a subject to see your module progress here.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {unlockedSubjects.map((s) => (
                <div key={s.id}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h2 className="font-serif text-xl text-ink">{s.title}</h2>
                    <span className="text-sm text-ink-muted">{s.doneCount}/{s.totalCount} done</span>
                  </div>
                  <ol className="space-y-2">
                    {s.modules.map((m, idx) => (
                      <li
                        key={m.id}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
                          m.done
                            ? "border-accent/30 bg-accent/5"
                            : "border-taupe/30 bg-paper"
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
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={`/year/${s.yearId}/subjects/${s.id}`}
                    className="mt-4 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-medium text-paper"
                  >
                    Continue {s.title} →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
