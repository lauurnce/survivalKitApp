import type { Metadata } from "next";
import { getModulesBySubject, getSubjectWithYear } from "@/lib/cache/queries";
import { SITE_NAME } from "@/lib/seo/pageMetadata";
import { subjectShareDescription, subjectShareTitle, yearLabelOf } from "@/lib/seo/subjectShare";

interface Props {
  children: React.ReactNode;
  params: Promise<{ yearId: string; subjectId: string }>;
}

// Link-preview defaults for a subject's module list and every lesson in it.
//
// Without this, a lesson link pasted into a group chat previewed as the home
// page: the root layout's og:title "BSIT Survival Kit" and og:url
// https://tryi2i.com, which Facebook and Messenger take as the canonical
// address. Here openGraph carries the subject's title and NO url, so the
// crawler uses the shared URL itself. Next replaces a parent's openGraph
// object wholesale, so the root's url does not leak through. The card image
// is this segment's opengraph-image.tsx.
//
// A page below can still set its own openGraph (a lesson's title and url);
// that replaces this one. Nothing else here: the layout renders its children
// untouched.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params;
  const subject = await getSubjectWithYear(subjectId);
  if (!subject) return {};
  const modules = (await getModulesBySubject(subjectId)) ?? [];
  const share = { title: subject.title, yearLabel: yearLabelOf(subject.years), moduleCount: modules.length };
  const title = subjectShareTitle(share);
  const description = subjectShareDescription(share);
  return {
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_PH", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function SubjectLayout({ children }: Props) {
  return children;
}
