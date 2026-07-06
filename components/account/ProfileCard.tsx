"use client";

import { useActionState, useEffect, useState } from "react";
import { GENDERS, PATHWAYS, type Profile } from "@/lib/profile";
import { saveProfileAction, type ProfileFormState } from "@/app/account/actions";

const inputClass =
  "mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink";

function EditProfileModal({
  profile,
  onClose,
}: {
  profile: Profile | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    saveProfileAction,
    {}
  );

  // A fresh savedAt means the server action succeeded — close the modal.
  useEffect(() => {
    if (state.savedAt) onClose();
  }, [state.savedAt, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-paper border border-taupe/50 rounded-xl p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-label-sm tracking-widest uppercase text-ink-muted mb-1">
              My profile
            </p>
            <h2 className="font-serif text-lg text-ink leading-snug">
              {profile ? "Edit profile" : "Set up your profile"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-ink-muted">
              First name *
              <input
                name="firstName"
                required
                maxLength={60}
                defaultValue={profile?.firstName ?? ""}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink-muted">
              Last name *
              <input
                name="lastName"
                required
                maxLength={60}
                defaultValue={profile?.lastName ?? ""}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-ink-muted">
              Age
              <input
                name="age"
                type="number"
                min={13}
                max={100}
                defaultValue={profile?.age ?? ""}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink-muted">
              Gender
              <select
                name="gender"
                defaultValue={profile?.gender ?? ""}
                className={inputClass}
              >
                <option value="">—</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm text-ink-muted">
            University
            <input
              name="university"
              maxLength={120}
              defaultValue={profile?.university ?? ""}
              placeholder="e.g. Cavite State University"
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-ink-muted">
            Major / program
            <input
              name="major"
              maxLength={120}
              defaultValue={profile?.major ?? ""}
              placeholder="e.g. BS Information Technology"
              className={inputClass}
            />
          </label>

          <fieldset>
            <legend className="text-sm text-ink-muted mb-2">
              Preferred pathways in tech
            </legend>
            <div className="flex flex-wrap gap-2">
              {PATHWAYS.map((p) => (
                <label key={p} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="pathways"
                    value={p}
                    defaultChecked={profile?.pathways.includes(p) ?? false}
                    className="peer sr-only"
                  />
                  <span className="inline-block rounded-full border border-taupe/50 px-3 py-1 text-xs text-ink-muted transition-colors peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent hover:border-accent/50">
                    {p}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {state.error && (
            <p role="alert" className="text-xs text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-paper hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ProfileCard({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);

  return (
    <section>
      {profile ? (
        <div className="rounded-xl border border-taupe/30 bg-taupe/5 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg text-ink leading-snug">
                {profile.firstName} {profile.lastName}
              </h2>
              {(profile.major || profile.university) && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {[profile.major, profile.university].filter(Boolean).join(" · ")}
                </p>
              )}
              {(profile.age !== null || profile.gender) && (
                <p className="text-xs text-ink-faint mt-0.5">
                  {[profile.age, profile.gender].filter((v) => v !== null).join(" · ")}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 text-xs text-accent underline underline-offset-2 hover:no-underline"
            >
              Edit
            </button>
          </div>

          {profile.pathways.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.pathways.map((p) => (
                <span
                  key={p}
                  className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-taupe/50 p-4 text-center space-y-2">
          <p className="font-serif text-base text-ink">Set up your profile</p>
          <p className="text-xs text-ink-muted">
            Add your name, school, and the tech pathways you&apos;re aiming for.
          </p>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-accent/50 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition-colors"
          >
            Add your info
          </button>
        </div>
      )}

      {editing && (
        <EditProfileModal profile={profile} onClose={() => setEditing(false)} />
      )}
    </section>
  );
}
