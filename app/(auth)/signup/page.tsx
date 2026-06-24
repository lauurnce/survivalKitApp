import { AuthForm } from "@/components/AuthForm";
import { signUpAction } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" action={signUpAction} next={next ?? "/account"} />;
}
