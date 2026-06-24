import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { SubjectCard } from "@/components/account/SubjectCard";
import { ProgressRing } from "@/components/account/ProgressRing";
import { signOutAction } from "../(auth)/actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account");
  const overview = await getAccountOverview(userId);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center gap-5">
        <ProgressRing done={overview.overallDone} total={overview.overallTotal} />
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-ink">My Account</h1>
          <p className="text-sm text-ink-muted">
            {overview.yearLabel ?? "BSIT"} · {overview.overallDone}/{overview.overallTotal} modules done
          </p>
        </div>
        <form action={signOutAction}>
          <button className="text-sm text-ink-muted underline">Log out</button>
        </form>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {overview.subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}
      </div>
    </main>
  );
}
