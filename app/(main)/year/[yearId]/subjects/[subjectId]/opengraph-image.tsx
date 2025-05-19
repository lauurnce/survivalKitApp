import { ImageResponse } from "next/og";
import { getModulesBySubject, getSubjectWithYear } from "@/lib/cache/queries";
import { yearLabelOf } from "@/lib/seo/subjectShare";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BSIT Survival Kit subject preview";
// One card per subject, regenerated at most daily: chat apps cache previews
// on their side too, so this is rendered a handful of times a day at most.
export const revalidate = 86400;
// Rendered on first request per subject, then served from cache (ISR)
// instead of running the function for every crawler fetch.
export const dynamic = "force-static";

interface Props {
  params: Promise<{ yearId: string; subjectId: string }>;
}

// The preview a group chat shows for a subject or any lesson in it: the
// subject's name, big enough to read in a Messenger thumbnail, instead of the
// same generic card on every link. Same palette as app/opengraph-image.tsx.
export default async function SubjectOpengraphImage({ params }: Props) {
  const { subjectId } = await params;
  const subject = await getSubjectWithYear(subjectId);
  const modules = subject ? (await getModulesBySubject(subjectId)) ?? [] : [];
  const title = subject?.title ?? "BSIT Survival Kit";
  const yearLabel = subject ? yearLabelOf(subject.years) : null;
  const lessons = modules.length === 1 ? "1 lesson" : `${modules.length} lessons`;
  const meta = [yearLabel, modules.length > 0 ? lessons : null, "Free notes · reviewers"]
    .filter(Boolean)
    .join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1A1A1A",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", color: "#F7F5F3", fontSize: 30, letterSpacing: 4 }}>
          <span style={{ color: "#E0492B", fontSize: 56, marginRight: 20, fontWeight: 600 }}>§</span>
          BSIT SURVIVAL KIT
        </div>
        <div
          style={{
            display: "flex",
            color: "#F7F5F3",
            fontSize: title.length > 34 ? 72 : 92,
            fontWeight: 600,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#F7F5F3", fontSize: 30 }}>
          <span style={{ opacity: 0.75 }}>{meta}</span>
          <span style={{ color: "#E0492B" }}>tryi2i.com</span>
        </div>
      </div>
    ),
    size,
  );
}
