import type { Metadata } from "next";
import { safeAdminNext } from "@/lib/auth/safeNext";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return <AdminLoginForm next={safeAdminNext(next)} />;
}
