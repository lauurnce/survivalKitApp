import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";
import { RESET_LINK_EXPIRED } from "@/lib/auth/authErrors";
import { requestPasswordResetAction } from "../passwordActions";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Get a link to reset your BSIT Survival Kit password.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  // Reading searchParams also keeps this page request-time, which the nonce
  // CSP on non-static routes requires (lib/render/RequestTimeLayout).
  const { error } = await searchParams;
  return (
    <ForgotPasswordForm
      action={requestPasswordResetAction}
      initialError={error === "expired" ? RESET_LINK_EXPIRED : undefined}
    />
  );
}
