import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { safeNextParam } from "@/lib/auth/safeNext";
import { signUpAction } from "../actions";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a BSIT Survival Kit account to keep your unlocks and progress.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" action={signUpAction} next={safeNextParam(next)} />;
}
