"use client";

import { useState } from "react";
import Image from "next/image";
import { UniversityCombobox } from "./UniversityCombobox";
import {
  SECTORS,
  landmarkLabel,
  universityImagePath,
  type Sector,
  type UniversityEntry,
} from "@/lib/universities";

const inputClass =
  "mt-1 w-full rounded border border-taupe bg-paper px-3 py-2 text-sm text-ink";

interface Props {
  defaultUniversity?: string;
  defaultSchoolType?: Sector | null;
  /**
   * Signup insists on both answers. The profile form does not — a school has
   * always been optional there, and tightening it would lock existing students
   * out of saving unrelated edits.
   */
  required?: boolean;
  /** Prefix for the field ids, so two instances can coexist on one page. */
  idPrefix?: string;
}

/**
 * School picker plus the public/private answer, with a live preview of the
 * campus art the student is about to get.
 *
 * The sector is auto-filled from the catalog when the school resolves to one
 * of our 50, and cleared again if the school is edited into something we
 * don't recognise — but only while the student hasn't answered it themselves.
 * The moment they touch the control, their answer is the answer: we stop
 * writing over it and stop calling it auto-filled.
 */
export function SchoolFields({
  defaultUniversity = "",
  defaultSchoolType = null,
  required = true,
  idPrefix = "school",
}: Props) {
  const [sector, setSector] = useState<Sector | null>(defaultSchoolType);
  // True only while the value on screen is one we filled in and the student
  // has left alone. A saved sector is never "auto" — the student gave us that.
  const [auto, setAuto] = useState(false);
  const [entry, setEntry] = useState<UniversityEntry | null>(null);
  const [typed, setTyped] = useState(defaultUniversity);

  const sectorHintId = `${idPrefix}-sector-hint`;

  function onSchoolChange(next: UniversityEntry | null, value: string) {
    setEntry(next);
    setTyped(value);
    if (sector !== null && !auto) return; // the student's own answer stands
    if (next) {
      setSector(next.sector);
      setAuto(true);
    } else {
      setSector(null);
      setAuto(false);
    }
  }

  function chooseSector(value: Sector) {
    setSector(value);
    setAuto(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1.55fr_1fr] sm:items-start">
        <label className="block text-sm text-ink-muted" htmlFor={`${idPrefix}-university`}>
          School / University {required && <span className="text-accent">*</span>}
          <UniversityCombobox
            id={`${idPrefix}-university`}
            name="university"
            required={required}
            defaultValue={defaultUniversity}
            className={inputClass}
            onSchoolChange={onSchoolChange}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            Not on the list? Type it in — we still save it.
          </span>
        </label>

        <div className="text-sm text-ink-muted">
          <span id={`${idPrefix}-sector-label`}>
            Sector {required && <span className="text-accent">*</span>}
          </span>
          <div
            role="group"
            aria-labelledby={`${idPrefix}-sector-label`}
            aria-describedby={sectorHintId}
            className="mt-1 grid grid-cols-2 overflow-hidden rounded border border-taupe"
          >
            {SECTORS.map((value, i) => (
              <button
                key={value}
                type="button"
                aria-pressed={sector === value}
                onClick={() => chooseSector(value)}
                className={`px-1 py-2 text-sm transition-colors ${
                  i > 0 ? "border-l border-taupe" : ""
                } ${
                  sector === value
                    ? "bg-accent font-medium text-paper"
                    : "bg-paper text-ink-muted hover:text-ink"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <span id={sectorHintId} className="mt-1 block text-xs text-ink-faint">
            {auto
              ? "Auto-filled — change it if we got it wrong."
              : "State school, or private?"}
          </span>
          {/* The buttons carry the state; this is what the form actually submits. */}
          <input type="hidden" name="schoolType" value={sector ?? ""} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded bg-taupe/20">
          <Image
            src={universityImagePath(entry ? entry.name : null)}
            alt={entry ? landmarkLabel(entry) : ""}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 text-sm">
          <span className="block font-mono text-label-sm uppercase text-ink-faint">
            Your campus
          </span>
          {entry ? (
            <>
              <span className="block text-sm text-ink">{landmarkLabel(entry)}</span>
              <span className="block text-xs text-ink-faint">
                {entry.landmark ? entry.name : "We have art for this school."}
              </span>
            </>
          ) : typed.trim() ? (
            <>
              <span className="block text-sm text-ink">No art for this school yet</span>
              <span className="block text-xs text-ink-faint">
                We&rsquo;ll save the name and use the default illustration.
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm text-ink">
                Pick a school to see your landmark
              </span>
              <span className="block text-xs text-ink-faint">
                We have art for 50 schools.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
