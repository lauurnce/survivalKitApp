import { pct } from "@/lib/account";

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const p = pct(done, total);
  const r = 26, c = 2 * Math.PI * r, off = c - (p / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-taupe/40" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        transform="rotate(-90 32 32)" className="text-accent" />
      <text x="32" y="36" textAnchor="middle" className="fill-ink text-[13px] font-medium">{p}%</text>
    </svg>
  );
}
