# /public/landmarks — school landmark illustrations

Hero-card art shown to a student based on `profiles.university`.

## Naming convention
One PNG per school, named by slug: `pup.png`, `up.png`, `ust.png`, `dlsu.png`, …
Slugs are defined in `lib/landmarks.ts` (`LANDMARKS`). Transparent background,
~1200×900px, warm line-art style matching the terracotta/cream palette.

## To add or activate a school
1. Drop `<slug>.png` in this folder.
2. In `lib/landmarks.ts`, set `image: "/landmarks/<slug>.png"` on that entry
   (add the entry first if the school is new).
3. Commit both. Anything without `image` set renders `fallback.svg`.

`fallback.svg` is the generic campus building — do not delete it.
