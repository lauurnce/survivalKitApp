"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildProgressCardUrl,
  progressCardFilename,
  type ProgressCardParams,
} from "@/lib/shareCard";
import { fetchCompletedModules } from "@/lib/progress";
import { logEvent } from "@/lib/analytics";

export interface ShareProgressCardProps {
  subjectId: string;
  subjectTitle: string;
  /** All module ids of the subject — scopes the completed count. */
  moduleIds: string[];
  /** Present only when opened from the completion moment. */
  moduleId?: string;
  moduleTitle?: string;
  onClose: () => void;
}

// Story-share dialog: previews the transparent card PNG and offers the native
// share sheet (mobile) or a plain download. Fetches its own count + name so
// entry points only decide WHEN to open it.
export function ShareProgressCard({
  subjectId,
  subjectTitle,
  moduleIds,
  moduleId,
  moduleTitle,
  onClose,
}: ShareProgressCardProps) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [filename] = useState(() => progressCardFilename(subjectTitle));
  const [canShare, setCanShare] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      const [completed, meRes] = await Promise.all([
        fetchCompletedModules(moduleIds),
        fetch("/api/me")
          .then((r) => (r.ok ? r.json() : { firstName: null }))
          .catch(() => ({ firstName: null })),
      ]);
      if (!active) return;

      const params: ProgressCardParams = {
        subject: subjectTitle,
        count: Math.max(completed.size, 1),
      };
      if (moduleTitle) params.module = moduleTitle;
      if (typeof meRes.firstName === "string" && meRes.firstName) {
        params.name = meRes.firstName;
      }
      setCardUrl(buildProgressCardUrl(params));
    }

    void load();
    void logEvent("share_card_open", { subject_id: subjectId, module_id: moduleId });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.canShare === "function");
  }, []);

  async function share() {
    if (!cardUrl || sharing) return;
    setSharing(true);
    try {
      const blob = await (await fetch(cardUrl)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        void logEvent("share_card_share", { subject_id: subjectId, module_id: moduleId });
      }
    } catch {
      // User cancelled the share sheet — keep the dialog open, Download remains.
    } finally {
      setSharing(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share your progress"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-paper p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <p className="font-mono text-label-md uppercase tracking-[0.1em] text-ink-muted">
            Share your progress
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-ink-faint hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Checkered backdrop so the transparency is visible in the preview. */}
        <div
          className="w-full flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #d8d4cf 25%, transparent 25%, transparent 75%, #d8d4cf 75%), linear-gradient(45deg, #d8d4cf 25%, transparent 25%, transparent 75%, #d8d4cf 75%)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
            backgroundColor: "#eceae6",
          }}
        >
          {cardUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cardUrl}
              alt="Your progress card"
              className="w-full max-h-[55vh] object-contain"
            />
          ) : (
            <div className="py-24 font-mono text-label-sm uppercase tracking-[0.12em] text-ink-faint">
              Making your card…
            </div>
          )}
        </div>

        <p className="font-sans text-sm text-ink-muted">
          The PNG has a transparent background — it drops straight onto your IG or Facebook
          story.
        </p>

        <div className="flex gap-3">
          {canShare && (
            <button
              type="button"
              onClick={share}
              disabled={!cardUrl || sharing}
              className="flex-1 bg-accent hover:bg-accent-dark text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-3 transition-colors duration-150 disabled:opacity-50"
            >
              {sharing ? "Opening…" : "Share"}
            </button>
          )}
          <a
            href={cardUrl ?? "#"}
            download={filename}
            aria-disabled={!cardUrl}
            onClick={() => {
              if (!cardUrl) return;
              void logEvent("share_card_download", {
                subject_id: subjectId,
                module_id: moduleId,
              });
            }}
            className="flex-1 text-center border border-ink text-ink hover:bg-ink hover:text-paper font-mono text-label-md uppercase tracking-[0.1em] px-4 py-3 transition-colors duration-150"
          >
            Download
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
