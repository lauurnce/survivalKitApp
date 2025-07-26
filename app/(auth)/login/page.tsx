import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { safeNextParam } from "@/lib/auth/safeNext";
import { signInAction } from "../actions";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your BSIT Survival Kit account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" action={signInAction} next={safeNextParam(next)} />;
}
