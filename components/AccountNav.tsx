import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export async function AccountNav() {
  const userId = await getCurrentUserId();
  return (
    <Link
      href={userId ? "/account" : "/login"}
      className="fixed right-16 top-4 z-50 text-sm text-ink-muted underline"
    >
      {userId ? "My Account" : "Log in"}
    </Link>
  );
}
