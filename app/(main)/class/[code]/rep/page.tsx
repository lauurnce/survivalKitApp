import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeClassCode } from "@/lib/classCode";
import { RepDashboard } from "./RepDashboard";

interface Props {
  params: Promise<{ code: string }>;
}

// Shape check only, never a database lookup — see join/page.tsx for why. A
// malformed code is a real 404; a well-formed one renders the dashboard, whose
// own error state carries the heading (QA CR-03).
async function codeFrom(params: Props["params"]): Promise<string> {
  const code = normalizeClassCode((await params).code);
  if (!code) notFound();
  return code;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = await codeFrom(params);
  return { title: `Class ${code} — rep dashboard`, robots: { index: false } };
}

export default async function RepDashboardPage({ params }: Props) {
  return <RepDashboard code={await codeFrom(params)} />;
}
