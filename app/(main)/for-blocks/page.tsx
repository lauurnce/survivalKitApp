import type { Metadata } from "next";
import { ForBlocksCheckout, type YearOption } from "./ForBlocksCheckout";
import { getYears, getAllSubjects } from "@/lib/cache/queries";

export const metadata: Metadata = {
  title: "Unlock a subject for your whole block",
  description:
    "One class rep pays once, every classmate joins with a 6-character code — a subject's full exam-prep modules unlocked for the whole section.",
};

export const revalidate = 60;

export default async function ForBlocksPage() {
  const [years, subjects] = await Promise.all([
    getYears(),
    getAllSubjects(),
  ]);

  const yearOptions: YearOption[] = (years ?? [])
    .filter((year) => !year.coming_soon)
    .map((year) => ({
      id: year.id,
      label: year.label,
      subjects: (subjects ?? [])
        .filter((s) => s.year_id === year.id)
        .map((s) => ({ id: s.id, title: s.title })),
    }));

  return <ForBlocksCheckout years={yearOptions} />;
}
