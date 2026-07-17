import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { ForBlocksCheckout, type YearOption } from "./ForBlocksCheckout";

export const metadata: Metadata = {
  title: "Unlock a subject for your whole block",
  description:
    "One class rep pays once, every classmate joins with a 6-character code — a subject's full exam-prep modules unlocked for the whole section.",
};

export const revalidate = 300;

export default async function ForBlocksPage() {
  const supabase = createServerClient();

  const [{ data: years }, { data: subjects }] = await Promise.all([
    supabase
      .from("years")
      .select("id, label, sort_order, coming_soon")
      .eq("coming_soon", false)
      .order("sort_order"),
    supabase
      .from("subjects")
      .select("id, title, year_id, sort_order")
      .order("sort_order"),
  ]);

  const yearOptions: YearOption[] = (years ?? []).map((year) => ({
    id: year.id,
    label: year.label,
    subjects: (subjects ?? [])
      .filter((s) => s.year_id === year.id)
      .map((s) => ({ id: s.id, title: s.title })),
  }));

  return <ForBlocksCheckout years={yearOptions} />;
}
