"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  matchUniversity,
  searchUniversities,
  type UniversityEntry,
} from "@/lib/universities";

interface Props {
  name: string;
  defaultValue: string;
  className: string;
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  /**
   * Fires on every change to the typed text, with the catalog entry the text
   * resolves to — or null while it is free text we don't recognise — plus the
   * raw text itself. Lets a parent react to the school (prefill the sector,
   * show the landmark) without owning the input.
   */
  onSchoolChange?: (entry: UniversityEntry | null, value: string) => void;
}

// Free-text input backed by a live-filtered dropdown of known schools.
// Selecting an option fills the canonical name; typing anything else is
// still accepted as-is on form submit (no validation against the list).
export function UniversityCombobox({
  name,
  defaultValue,
  className,
  id,
  required,
  "aria-describedby": describedBy,
  onSchoolChange,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listboxId = `${name}-university-listbox`;

  const filtered = useMemo(() => searchUniversities(value), [value]);
  const listboxOpen = open && filtered.length > 0;

  // Report the resolved school on every change of the typed text, so a parent
  // sees "PUP" resolve to the school without waiting for a click on the list.
  // Keyed on `value`, not on the resolved entry: free text over free text
  // leaves the entry null both times but is still a change the parent shows.
  const onChangeRef = useRef(onSchoolChange);
  // Latest-ref idiom: refs are written in effects, not during render
  // (react-hooks/refs).
  useEffect(() => {
    onChangeRef.current = onSchoolChange;
  });
  const firstRun = useRef(true);
  useEffect(() => {
    // Skip the mount pass: a prefilled defaultValue is not a fresh choice.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    onChangeRef.current?.(matchUniversity(value), value);
  }, [value]);

  function commit(entry: UniversityEntry) {
    setValue(entry.name);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (filtered.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setActive((i) =>
        e.key === "ArrowDown"
          ? (i + 1) % filtered.length
          // From nothing-highlighted (-1) and from the first option, ArrowUp
          // both land on the last option.
          : i <= 0
            ? filtered.length - 1
            : i - 1,
      );
    } else if (e.key === "Enter") {
      // Only intercept Enter when the student is steering the list — otherwise
      // it stays the form's submit key.
      if (listboxOpen && active >= 0) {
        e.preventDefault();
        commit(filtered[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={listboxOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          listboxOpen && active >= 0 ? `${listboxId}-${filtered[active].slug}` : undefined
        }
        aria-describedby={describedBy}
        autoComplete="off"
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={className}
      />
      {listboxOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-taupe bg-paper shadow-lg"
        >
          {filtered.map((u, i) => (
            <li
              key={u.slug}
              id={`${listboxId}-${u.slug}`}
              role="option"
              aria-selected={i === active}
              // onMouseDown (not onClick) fires before the input's onBlur,
              // so the click registers before the list closes. The handler
              // lives on this element (not a nested button) because a
              // mousedown fired on the option itself would never bubble
              // down into a child's listener.
              onMouseDown={() => commit(u)}
              className={`flex w-full cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-accent/10 ${
                i === active ? "bg-accent/10" : ""
              }`}
            >
              <span>{u.name}</span>
              <span className="shrink-0 font-mono text-label-sm uppercase text-ink-faint">
                {u.sector}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
