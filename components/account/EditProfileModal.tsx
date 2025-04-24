"use client";

import { useActionState, useEffect, useState } from "react";
import {
  BACKGROUNDS,
  DEVICES,
  GENDERS,
  LANGUAGES,
  PATHWAYS,
  type Profile,
} from "@/lib/profile";
import { SECTORS, type Sector } from "@/lib/universities";
import { saveProfileAction, type ProfileFormState } from "@/app/account/actions";
import { SchoolFields } from "../SchoolFields";
import { MajorCombobox } from "./MajorCombobox";

const inputClass =
  "mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink";

const pillClass =
  "inline-block rounded-full border border-taupe/50 px-3 py-1 text-xs text-ink-muted transition-colors peer-checked:border-accent peer-checked:bg-accent/10 peer-checked:text-accent hover:border-accent/50";

function CheckGroup({
  legend,
  name,
  options,
  selected,
  mono,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  selected: readonly string[];
  mono?: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-sm text-ink-muted mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selected.includes(option)}
              className="peer sr-only"
            />
            <span className={`${pillClass}${mono ? " font-mono" : ""}`}>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// What the form shows when it mounts: the saved profile, or — after the server
// rejects a submit — exactly what the user had typed.
interface FormDefaults {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  university: string;
  schoolType: Sector | null;
  major: string;
  pathways: readonly string[];
  devices: readonly string[];
  languages: readonly string[];
  background: string;
  itReason: string;
  careerGoal: string;
  githubUrl: string;
  portfolioUrl: string;
}

function defaultsFromProfile(profile: Profile | null): FormDefaults {
  return {
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    age: profile?.age != null ? String(profile.age) : "",
    gender: profile?.gender ?? "",
    university: profile?.university ?? "",
    schoolType: profile?.schoolType ?? null,
    major: profile?.major ?? "",
    pathways: profile?.pathways ?? [],
    devices: profile?.devices ?? [],
    languages: profile?.languages ?? [],
    background: profile?.background ?? "",
    itReason: profile?.itReason ?? "",
    careerGoal: profile?.careerGoal ?? "",
    githubUrl: profile?.githubUrl ?? "",
    portfolioUrl: profile?.portfolioUrl ?? "",
  };
}

function defaultsFromForm(fd: FormData): FormDefaults {
  const text = (key: string) => String(fd.get(key) ?? "");
  const schoolType = text("schoolType");
  return {
    firstName: text("firstName"),
    lastName: text("lastName"),
    age: text("age"),
    gender: text("gender"),
    university: text("university"),
    schoolType: (SECTORS as readonly string[]).includes(schoolType) ? (schoolType as Sector) : null,
    major: text("major"),
    pathways: fd.getAll("pathways").map(String),
    devices: fd.getAll("devices").map(String),
    languages: fd.getAll("languages").map(String),
    background: text("background"),
    itReason: text("itReason"),
    careerGoal: text("careerGoal"),
    githubUrl: text("githubUrl"),
    portfolioUrl: text("portfolioUrl"),
  };
}

export function EditProfileModal({
  profile,
  onClose,
}: {
  profile: Profile | null;
  onClose: () => void;
}) {
  // React resets an uncontrolled <form action> after every submit, including
  // one the server rejects, which wiped the user's edits. On an error, keep
  // what they submitted and remount the form with it as the defaults (the
  // school and major fields hold their own state, so a remount is the one
  // reset that reaches them too).
  const [draft, setDraft] = useState<FormDefaults | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    async (prev, formData) => {
      const next = await saveProfileAction(prev, formData);
      if (next.error) {
        setDraft(defaultsFromForm(formData));
        setFormKey((k) => k + 1);
      }
      return next;
    },
    {}
  );
  const d = draft ?? defaultsFromProfile(profile);

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
            aria-label="Close"
            className="text-ink-faint hover:text-ink text-lg leading-none mt-0.5"
          >
            ✕
          </button>
        </div>

        <form key={formKey} action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-ink-muted">
              First name *
              <input
                name="firstName"
                required
                maxLength={60}
                defaultValue={d.firstName}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink-muted">
              Last name *
              <input
                name="lastName"
                required
                maxLength={60}
                defaultValue={d.lastName}
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
                defaultValue={d.age}
                className={inputClass}
              />
            </label>
            <label className="block text-sm text-ink-muted">
              Gender
              <select
                name="gender"
                defaultValue={d.gender}
                className={inputClass}
              >
                <option value="">—</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>

          <SchoolFields
            required={false}
            idPrefix="profile"
            defaultUniversity={d.university}
            defaultSchoolType={d.schoolType}
          />

          <label className="block text-sm text-ink-muted">
            Major / program
            <MajorCombobox
              name="major"
              defaultValue={d.major}
              className={inputClass}
            />
          </label>

          <CheckGroup
            legend="Preferred pathways in tech"
            name="pathways"
            options={PATHWAYS}
            selected={d.pathways}
          />

          <CheckGroup
            legend="Devices I have"
            name="devices"
            options={DEVICES}
            selected={d.devices}
          />

          <CheckGroup
            legend="Languages I know"
            name="languages"
            options={LANGUAGES}
            selected={d.languages}
            mono
          />

          <label className="block text-sm text-ink-muted">
            Where are you starting from?
            <select
              name="background"
              defaultValue={d.background}
              className={inputClass}
            >
              <option value="">—</option>
              {BACKGROUNDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-ink-muted">
            Why IT?
            <textarea
              name="itReason"
              rows={3}
              maxLength={280}
              placeholder="In your own words…"
              defaultValue={d.itReason}
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-ink-muted">
            Where are you headed?
            <input
              name="careerGoal"
              maxLength={120}
              placeholder="e.g. Backend developer at a fintech"
              defaultValue={d.careerGoal}
              className={inputClass}
            />
          </label>

          <fieldset>
            <legend className="text-sm text-ink-muted mb-2">Links</legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="githubUrl"
                type="url"
                pattern="https://.*"
                title="Start the link with https://"
                placeholder="https://github.com/…"
                defaultValue={d.githubUrl}
                aria-label="GitHub URL"
                className="w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink"
              />
              <input
                name="portfolioUrl"
                type="url"
                pattern="https://.*"
                title="Start the link with https://"
                placeholder="https://…"
                defaultValue={d.portfolioUrl}
                aria-label="Portfolio URL"
                className="w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink"
              />
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
