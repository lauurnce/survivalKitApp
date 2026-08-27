import { getCurrentUserId } from "@/lib/auth/currentUser";
import { TopBar } from "@/components/TopBar";
import { SearchHotkey } from "@/components/SearchHotkey";

// Renders the fixed top bar with theme toggle and login/account link.
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  return (
    <>
      <TopBar userId={userId} />
      <SearchHotkey />
      {children}
    </>
  );
}
