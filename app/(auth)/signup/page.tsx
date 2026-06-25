import { AuthForm } from "@/components/AuthForm";
import { signUpAction } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return <AuthForm mode="signup" action={signUpAction} next={safe} />;
}
