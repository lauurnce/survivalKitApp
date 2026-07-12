import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { signUpAction } from "../actions";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a BSIT Survival Kit account to keep your unlocks and progress.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return <AuthForm mode="signup" action={signUpAction} next={safe} />;
}
