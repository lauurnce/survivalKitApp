import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

export function BackLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-150 group"
    >
      <span className="text-accent group-hover:translate-x-[-2px] transition-transform duration-150">←</span>
      <span>{label}</span>
    </Link>
  );
}
