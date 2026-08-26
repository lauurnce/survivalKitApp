"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import type { Device, Profile } from "@/lib/profile";
import { matchUniversity, landmarkLabel, universityImagePath } from "@/lib/universities";
import { EditProfileModal } from "./EditProfileModal";

// ── Icons — 20px inline line icons, stroke currentColor, stroke-width 1.5 ────

function LaptopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <rect x="4" y="4.5" width="12" height="8.5" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 16h15M7 16l.5-1.5h5L13 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <rect x="3" y="3.5" width="14" height="9.5" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13v2m-3.5 1.5h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <rect x="5" y="2.5" width="10" height="15" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 14.75h2" strokeLinecap="round" />
    </svg>
  );
}

function SmartphoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <rect x="6.5" y="2.5" width="7" height="15" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15h2" strokeLinecap="round" />
    </svg>
  );
}

function NoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="6.5" strokeLinecap="round" />
      <path d="M5.5 14.5l9-9" strokeLinecap="round" />
    </svg>
  );
}

const DEVICE_ICONS: Record<Device, ComponentType<{ className?: string }>> = {
  Laptop: LaptopIcon,
  "Desktop PC": DesktopIcon,
  Tablet: TabletIcon,
  Smartphone: SmartphoneIcon,
  "None yet": NoneIcon,
};

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="inline-block h-3 w-3">
      <path d="M6 14L14 6M7.5 6H14v6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Small display helpers ────────────────────────────────────────────────────

// github.com/user rather than the full https:// URL — enough to recognize the
// link without shouting.
function linkLabel(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-taupe/30 bg-paper p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="label-sm">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-accent underline underline-offset-2 hover:text-accent-dark"
        >
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink-muted">{children}</p>;
}

// ── The dashboard ────────────────────────────────────────────────────────────

export function ProfileCard({
  profile,
  joinedLabel,
  startedLabel,
}: {
  profile: Profile | null;
  joinedLabel: string;
  /** Server-formatted "Journey started …" month/year, or null when unknown. */
  startedLabel: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const openEdit = () => setEditing(true);

  const name =
    profile && (profile.firstName || profile.lastName)
      ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
      : null;

  return (
    <div className="space-y-4">
      {profile ? (
        // Hero — campus landmark banner over identity.
        <section className="rounded-xl border border-taupe/30 overflow-hidden">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-taupe/10">
            <Image
              src={universityImagePath(profile.university)}
              alt={landmarkLabel(matchUniversity(profile.university))}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 800px"
            />
          </div>
          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-display-md/[1.1] text-ink leading-snug break-words">
                  {name ?? (
                    // A profile created at signup knows the school but not the
                    // name. Say so rather than rendering an empty heading.
                    <span className="text-ink-faint">Name not set</span>
                  )}
                </h2>
                {joinedLabel && (
                  <p className="text-sm text-ink-muted mt-0.5">{joinedLabel}</p>
                )}
              </div>
              <button
                type="button"
                onClick={openEdit}
                className="shrink-0 rounded-lg border border-accent/50 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                Edit
              </button>
            </div>
            {(profile.schoolType || startedLabel) && (
              <div className="flex flex-wrap items-center gap-2">
                {profile.schoolType && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {profile.schoolType}
                  </span>
                )}
                {startedLabel && (
                  <span className="label-sm">Journey started {startedLabel}</span>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        // No profile yet — a setup panel instead of an empty hero.
        <section className="rounded-xl border border-dashed border-taupe/50 p-6 text-center space-y-2">
          <h2 className="font-serif text-display-md/[1.1] text-ink">Set up your profile</h2>
          <p className="text-sm text-ink-muted">
            Tell us who you are — your school, devices, languages, and where
            you&apos;re headed.
          </p>
          <button
            type="button"
            onClick={openEdit}
            className="rounded-lg border border-accent/50 px-4 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
          >
            Add your info
          </button>
        </section>
      )}

      {profile ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="IT interests" onEdit={openEdit}>
            {profile.pathways.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.pathways.map((p) => (
                  <span key={p} className="rounded bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyHint>No pathways picked yet.</EmptyHint>
            )}
          </SectionCard>

          <SectionCard title="Languages I know" onEdit={openEdit}>
            {profile.languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((l) => (
                  <span key={l} className="font-mono rounded border border-taupe/50 px-2 py-0.5 text-xs text-ink-muted">
                    {l}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyHint>Tell us what you already speak — Python, SQL, anything counts.</EmptyHint>
            )}
          </SectionCard>

          <SectionCard title="Devices" onEdit={openEdit}>
            {profile.devices.length > 0 ? (
              <ul className="space-y-2">
                {profile.devices.map((d) => {
                  const Icon = DEVICE_ICONS[d];
                  if (d === "None yet") {
                    return (
                      <li key={d} className="flex items-center gap-2.5 text-sm text-ink-muted italic">
                        <Icon className="h-5 w-5 shrink-0" />
                        {d}
                      </li>
                    );
                  }
                  return (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-ink">
                      <Icon className="h-5 w-5 shrink-0 text-ink-muted" />
                      {d}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyHint>Not set yet.</EmptyHint>
            )}
          </SectionCard>

          <SectionCard title="Where I'm starting from" onEdit={openEdit}>
            {profile.background || profile.itReason ? (
              <div className="space-y-2">
                {profile.background && (
                  <span className="inline-block rounded bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                    {profile.background}
                  </span>
                )}
                {profile.itReason && (
                  <blockquote className="border-l-2 border-accent/40 pl-3 font-serif italic text-sm text-ink-muted leading-relaxed">
                    {profile.itReason}
                  </blockquote>
                )}
              </div>
            ) : (
              <EmptyHint>Zero knowledge welcome — everyone starts somewhere.</EmptyHint>
            )}
          </SectionCard>

          <SectionCard title="Goals" onEdit={openEdit}>
            {profile.careerGoal ? (
              <div className="space-y-1">
                <p className="font-serif text-lg text-ink leading-snug">{profile.careerGoal}</p>
                <p className="text-xs text-ink-faint">Where you&apos;re headed after BSIT</p>
              </div>
            ) : (
              <EmptyHint>No goal set yet — even a rough one helps.</EmptyHint>
            )}
          </SectionCard>

          <SectionCard title="Elsewhere" onEdit={openEdit}>
            {profile.githubUrl || profile.portfolioUrl ? (
              <ul className="space-y-1.5">
                {[profile.githubUrl, profile.portfolioUrl].filter(Boolean).map((url) => (
                  <li key={url}>
                    <a
                      href={url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-accent underline underline-offset-2 hover:text-accent-dark"
                    >
                      <ArrowUpRightIcon />{" "}
                      {linkLabel(url as string)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint>Add your GitHub or portfolio.</EmptyHint>
            )}
          </SectionCard>
        </div>
      ) : (
        <section className="rounded-xl border border-taupe/30 bg-paper p-5">
          <p className="text-sm text-ink-muted">
            Your dashboard fills in here — interests, devices, languages, and
            goals — once you add your info.
          </p>
        </section>
      )}

      {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} />}
    </div>
  );
}
