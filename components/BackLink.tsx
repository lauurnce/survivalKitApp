import Link from "next/link";
import { hasDashboardReferrer } from "@/lib/navigation";

interface Props {
  href: string;
  label: string;
  className?: string;
  /** When user came from dashboard, use this instead of href/label */
  dashboardFallback?: { href: string; label: string };
  /** Search params to check for dashboard referrer (Server Component) */
  searchParams?: { get: (key: string) => string | null | undefined };
}

export function BackLink({ href, label, className, dashboardFallback, searchParams }: Props) {
  // Check if user came from dashboard
  const fromDashboard = searchParams ? hasDashboardReferrer({
    get: (key) => {
      const value = searchParams.get(key);
      return value ?? null;
    }
  }) : false;

  // Use dashboard fallback if available and user came from dashboard
  const finalHref = fromDashboard && dashboardFallback ? dashboardFallback.href : href;
  const finalLabel = fromDashboard && dashboardFallback ? dashboardFallback.label : label;

  return (
    <Link
      href={finalHref}
      className={`inline-flex items-center gap-2 font-sans text-sm transition-colors duration-150 group ${className ?? "text-ink-muted hover:text-ink"}`}
    >
      <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
      <span>{finalLabel}</span>
    </Link>
  );
}
