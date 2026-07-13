"use client";

import { useMemo, useState } from "react";
import { UNIVERSITIES } from "@/lib/universities";

interface Props {
  name: string;
  defaultValue: string;
  className: string;
}

// Free-text input backed by a live-filtered dropdown of known schools.
// Selecting an option fills the canonical name; typing anything else is
// still accepted as-is on form submit (no validation against the list).
export function UniversityCombobox({ name, defaultValue, className }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = value.trim().toLowerCase();
    if (!needle) return UNIVERSITIES;
    return UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(needle));
  }, [value]);

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={className}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-taupe bg-paper shadow-lg">
          {filtered.map((u) => (
            <li
              key={u.slug}
              role="option"
              aria-selected={u.name === value}
              // onMouseDown (not onClick) fires before the input's onBlur,
              // so the click registers before the list closes. The handler
              // lives on this element (not a nested button) because a
              // mousedown fired on the option itself would never bubble
              // down into a child's listener.
              onMouseDown={() => {
                setValue(u.name);
                setOpen(false);
              }}
              className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-accent/10"
            >
              {u.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
