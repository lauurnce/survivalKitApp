# Dark Mode — Design Spec
**Date:** 2026-06-24

## Overview

Add a light/dark theme toggle to the BSIT Survival Kit. The toggle appears fixed in the top-right corner on every page. Preference is stored in `localStorage` and defaults to light mode regardless of OS preference.

## Palette

The dark palette inverts the existing editorial colors:

| Token | Light | Dark |
|---|---|---|
| `--color-paper` | `#F7F5F3` | `#1A1F23` |
| `--color-ink` | `#1A1F23` | `#F7F5F3` |
| `--color-ink-muted` | `#6B6F75` | `#A8ADB5` |
| `--color-ink-faint` | `#A8ADB5` | `#6B6F75` |
| `--color-accent` | `#E0492B` | `#E0492B` (unchanged) |
| `--color-navy` | `#1A1A1A` | `#F0EDE9` |
| `--color-taupe` | `#BDB9B2` | `#4A4740` |

## Architecture

### 1. Tailwind config
Add `darkMode: 'class'` to `tailwind.config.ts`. No other changes to the config.

### 2. CSS variables (`globals.css`)
Add a `.dark { }` block after `:root { }` that remaps all custom properties to dark values. Scrollbar track and thumb colors are also remapped inside `.dark`. No Tailwind class names change in any component — the CSS variable layer absorbs the entire theme switch.

### 3. Flash-prevention script (`layout.tsx`)
A `<script dangerouslySetInnerHTML>` tag placed inside `<head>` (before any CSS), runs synchronously on page load:
```js
(function(){
  if(localStorage.getItem('theme')==='dark'){
    document.documentElement.classList.add('dark');
  }
})();
```
This ensures returning dark-mode users never see a white flash. Light mode is the default so no action is needed when `localStorage` is absent or `'light'`.

### 4. `ThemeToggle` component (`components/ThemeToggle.tsx`)
- `"use client"` component
- On mount: reads `localStorage.getItem('theme')`, sets local state (`'light'` if absent)
- Syncs `document.documentElement.classList` on mount and on every toggle
- On toggle: flips state, writes to `localStorage`, updates `classList`
- Renders a fixed-position button (`fixed top-4 right-4 z-50`) with a sun icon (light) / moon icon (dark) using inline SVG — no new dependency
- Button styled with `bg-paper text-ink border border-ink-faint/30` and `dark:` variants via CSS variables (automatic via the variable layer)
- Uses `suppressHydrationWarning` on the button to avoid hydration mismatch (server renders light, client may hydrate dark)

### 5. Placement in `layout.tsx`
- The inline script is added inside `<head>`
- `<ThemeToggle />` is rendered as a direct child of `<body>` before `{children}`, so it floats above all page content

## Files Changed

| File | Change |
|---|---|
| `tailwind.config.ts` | Add `darkMode: 'class'` |
| `app/globals.css` | Add `.dark { }` variable block + scrollbar overrides |
| `app/layout.tsx` | Add `<head>` with flash-prevention script; render `<ThemeToggle />` |
| `components/ThemeToggle.tsx` | New file — the toggle button component |

## Out of Scope

- No per-component `dark:` Tailwind class additions (CSS variable layer handles it)
- No Supabase persistence
- No OS preference detection
- No animation on theme switch beyond the existing 150ms color transition already in `globals.css`
