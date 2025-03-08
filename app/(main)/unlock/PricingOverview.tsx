import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import type { GatePrices } from "@/components/SubscribeGate";

interface YearLink {
  id: string;
  label: string;
  coming_soon?: boolean | null;
}

interface Props {
  prices: GatePrices;
  semesterUntil: string;
  years: YearLink[];
}

// Bare /unlock: a typed or shared link with no subject attached. Checkout
// needs a subject (or a year), so this quotes the plans and sends the visitor
// to pick one instead of dead-ending on a 404 (QA FL-10/CT-17).
export function PricingOverview({ prices, semesterUntil, years }: Props) {
  const plans = [
    {
      key: "subject_month",
      name: "1 Month",
      price: prices.subject_month,
      per: "/ month",
      scope: "One subject, every reviewer with answer keys.",
    },
    {
      key: "subject_sem",
      name: "Whole Semester",
      price: prices.subject_sem,
      per: "/ semester",
      scope: `One subject until ${semesterUntil}: prelims, midterms, and finals.`,
    },
    {
      key: "year_sem",
      name: "Everything",
      price: prices.year_sem,
      per: "/ semester",
      scope: `Every subject in one year level until ${semesterUntil}.`,
    },
  ];
  const openYears = years.filter((y) => !y.coming_soon);

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="bg-navy px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-taupe mb-4">
            § Pricing
          </p>
          <h1 className="font-serif text-display-lg text-paper">Unlock reviewers</h1>
          <p className="font-sans text-base text-taupe mt-4 max-w-prose">
            Lessons are free to read. A plan unlocks the reviewers with answer keys:
            practice exercises and full worked solutions.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-12 md:px-16 md:py-16">
        <div className="max-w-wide mx-auto">
          <ul className="flex flex-col sm:flex-row gap-4">
            {plans.map((plan) => (
              <li key={plan.key} className="flex-1 border border-ink-faint/30 p-5 flex flex-col gap-4">
                <div>
                  <p className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint mb-1">
                    {plan.name}
                  </p>
                  <p className="font-sans text-sm text-ink-muted">{plan.scope}</p>
                </div>
                <p className="flex items-baseline gap-2 mt-auto">
                  <span className="font-serif text-3xl text-ink">{plan.price}</span>
                  <span className="font-sans text-sm text-ink-muted">{plan.per}</span>
                </p>
              </li>
            ))}
          </ul>

          <h2 className="font-serif text-2xl text-ink mt-12 mb-2">Pick a subject to unlock</h2>
          <p className="font-sans text-base text-ink-muted mb-6">
            Open any subject and tap Unlock to choose a plan for it.
          </p>
          {openYears.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {openYears.map((year) => (
                <li key={year.id}>
                  <Link
                    href={`/year/${year.id}/subjects`}
                    className="inline-block border border-ink-faint/40 font-sans text-sm text-ink px-4 py-3 hover:border-accent hover:text-accent transition-colors duration-150"
                  >
                    {year.label} subjects →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ButtonLink href="/year">Browse subjects →</ButtonLink>
          )}

          <p className="font-sans text-xs text-ink-faint mt-8">
            One-time payment via GCash, Maya, or card. No auto-renew — access simply
            ends when your plan does.
          </p>
        </div>
      </div>
    </main>
  );
}
