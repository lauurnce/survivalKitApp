import type { Metadata } from "next";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { RESET_LINK_EXPIRED } from "@/lib/auth/authErrors";
import { ResetLinkExpired, ResetPasswordForm } from "@/components/PasswordResetForms";
import { updatePasswordAction } from "../passwordActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false },
};

// Reached from the emailed link via /auth/callback, which has already signed
// the student in with the recovery session. Without a session there is
// nothing to update, so offer a fresh link instead of a form that would fail.
export default async function ResetPasswordPage() {
  const userId = await getCurrentUserId();
  if (!userId) return <ResetLinkExpired message={RESET_LINK_EXPIRED} />;
  return <ResetPasswordForm action={updatePasswordAction} />;
}
