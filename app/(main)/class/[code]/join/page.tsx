import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeClassCode } from "@/lib/classCode";
import { ClassJoinRequest } from "./ClassJoinRequest";

interface Props {
  params: Promise<{ code: string }>;
}

// A code that can't exist (wrong length or characters outside the code
// alphabet) is a real 404 with the not-found page's heading (QA CR-03). This
// checks the shape only, never the database: a 404-vs-200 split on real codes
// would be an unthrottled way to guess them, and the rate-limited join request
// is the only place allowed to tell a real code from a made-up one.
async function codeFrom(params: Props["params"]): Promise<string> {
  const code = normalizeClassCode((await params).code);
  if (!code) notFound();
  return code;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = await codeFrom(params);
  return { title: `Join class ${code}`, robots: { index: false } };
}

export default async function ClassJoinPage({ params }: Props) {
  return <ClassJoinRequest code={await codeFrom(params)} />;
}
