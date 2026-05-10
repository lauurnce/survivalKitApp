import { TopBar } from "@/components/TopBar";
import { SearchHotkey } from "@/components/SearchHotkey";

// Renders the fixed top bar with theme toggle and login/account link.
// Must stay free of request-time APIs (cookies(), headers(), the session):
// every public page under (main) inherits this layout, and reading any of
// them here would make all of those pages render per request. TopBar
// resolves the session client-side instead.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <SearchHotkey />
      {children}
    </>
  );
}
