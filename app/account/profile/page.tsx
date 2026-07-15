import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { getAccountOverview } from "@/lib/account";
import { getProfile } from "@/lib/profileStore";
import { signOutAction } from "../../(auth)/actions";
import { ThemeToggleInline } from "@/components/ThemeToggle";
import { NavRail } from "@/components/dashboard/NavRail";
import { ProfileCard } from "@/components/account/ProfileCard";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/account/profile");

  const [overview, profile] = await Promise.all([
    getAccountOverview(userId),
    getProfile(userId),
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

        <main className="px-4 sm:px-8 py-6 mx-auto max-w-wide space-y-8">
          <header>
            <p className="label-sm">Your account</p>
            <h1 className="font-serif text-display-md text-ink">Profile</h1>
          </header>

          <div className="max-w-md space-y-6">
            <ProfileCard profile={profile} />
            <div className="border-t border-taupe/20 pt-4">
              <DeleteAccountButton />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
