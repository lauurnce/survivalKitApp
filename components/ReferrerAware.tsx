"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { YearGrid, type YearCardData } from "@/components/YearGrid";
import { hasDashboardReferrer } from "@/lib/navigation";

// ?from=dashboard variants for prerendered pages. The query string isn't
// known while prerendering, so each component renders its default (public)
// variant into the static HTML as the Suspense fallback and switches after
// hydration when the reader came from the dashboard.

type BackLinkProps = Omit<React.ComponentProps<typeof BackLink>, "searchParams">;

function BackLinkInner(props: BackLinkProps) {
  const searchParams = useSearchParams();
  return <BackLink {...props} searchParams={searchParams} />;
}

export function ReferrerBackLink(props: BackLinkProps) {
  return (
    <Suspense fallback={<BackLink {...props} />}>
      <BackLinkInner {...props} />
    </Suspense>
  );
}

function YearGridInner({ cards }: { cards: YearCardData[] }) {
  const searchParams = useSearchParams();
  return <YearGrid cards={cards} fromDashboard={hasDashboardReferrer(searchParams)} />;
}

export function ReferrerYearGrid({ cards }: { cards: YearCardData[] }) {
  return (
    <Suspense fallback={<YearGrid cards={cards} />}>
      <YearGridInner cards={cards} />
    </Suspense>
  );
}
