import { ProBadge } from "./ProBadge";
import { LockOpenIcon } from "./ProIcons";

// Slim server-rendered strip for readers with an active subscription — the
// mirror image of the PaywallTeaser, shown above the module grid instead of
// it. No client JS: subscribers see it straight from the HTML.
export function ProAccessBanner() {
  return (
    <div className="mb-8 flex items-center gap-3 border border-amber-300/60 bg-amber-50 px-4 py-2.5 dark:border-amber-300/25 dark:bg-amber-400/10">
      <LockOpenIcon className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
      <p className="font-sans text-sm text-ink">You have Pro access</p>
      <ProBadge />
    </div>
  );
}
