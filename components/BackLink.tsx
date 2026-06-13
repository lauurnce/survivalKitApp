import Link from "next/link";

interface Props {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-sans text-sm transition-colors duration-150 group ${className ?? "text-ink-muted hover:text-ink"}`}
    >
      <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
      <span>{label}</span>
    </Link>
  );
}
