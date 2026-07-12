import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function AccountNav() {
  const userId = await getCurrentUserId();
  return (
    <Link
      href={userId ? "/account" : "/login"}
      className="fixed right-16 top-4 z-50 h-9 flex items-center border border-ink-faint/30 bg-paper px-3 font-mono text-label-sm uppercase tracking-[0.12em] text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
    >
      {userId ? "My Account" : "Log in"}
    </Link>
  );
}
