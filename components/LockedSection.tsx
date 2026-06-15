"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device";
import type { LanguageId } from "@/lib/ide/types";

const Playground = dynamic(
  () => import("./ide/Playground").then((m) => ({ default: m.Playground })),
  { ssr: false, loading: () => <div className="h-48 bg-ink-faint/10 animate-pulse" /> }
);

interface Section {
  id: string;
  heading: string;
  sort_order: number;
}

interface ActivityData {
  id: string;
  heading: string;
  body_md: string;
  ide_language: LanguageId | null;
  starter_code: string | null;
}

interface Props {
  section: Section;
  index: number;
  moduleId: string;
}

export function LockedSection({ section, index }: Props) {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "locked" | "error">("loading");

  useEffect(() => {
    const deviceId = getDeviceId();
    fetch(`/api/activity/${section.id}`, {
      headers: { "x-device-id": deviceId },
    })
      .then(async (res) => {
        if (res.status === 403) { setStatus("locked"); return; }
        if (!res.ok) { setStatus("error"); return; }
        const data: ActivityData = await res.json();
        setActivity(data);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [section.id]);

  // Unlocked: render full activity content
  if (status === "idle" && activity) {
    return (
      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
          <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{activity.heading}</h2>
        </div>
        <div className="pl-10 md:pl-12">
          <p className="font-sans text-base text-ink-muted leading-relaxed whitespace-pre-wrap">{activity.body_md}</p>
        </div>
        {activity.ide_language && (
          <div className="mt-6 pl-10 md:pl-12">
            <Playground
              languageId={activity.ide_language}
              initialCode={activity.starter_code ?? undefined}
            />
          </div>
        )}
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
          <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
        </div>
        <div className="pl-10 md:pl-12">
          <div className="h-4 bg-ink-faint/20 rounded-none w-3/4 mb-3" />
          <div className="h-4 bg-ink-faint/20 rounded-none w-1/2" />
        </div>
      </section>
    );
  }

  // Coming soon
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-6">
        <span className="label-sm shrink-0">{String(index + 1).padStart(2, "0")}</span>
        <h2 className="font-serif text-2xl md:text-3xl text-ink leading-tight">{section.heading}</h2>
      </div>
      <div className="pl-10 md:pl-12">
        <div className="inline-flex items-center gap-2 border border-ink-faint/30 px-4 py-2">
          <span className="font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">Coming soon</span>
        </div>
      </div>
    </section>
  );
}
