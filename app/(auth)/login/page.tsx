import { AuthForm } from "@/components/AuthForm";
import { signInAction } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return <AuthForm mode="login" action={signInAction} next={safe} />;
}
