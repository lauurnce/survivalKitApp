import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountNav } from "@/components/AccountNav";

// Renders the floating ThemeToggle and AccountNav for all non-account pages.
// The account page has its own top bar with these controls inline.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      <AccountNav />
      {children}
    </>
  );
}
