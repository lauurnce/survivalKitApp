// Shared constants for the installable app: app/manifest.ts and the icon
// route (app/icons/[file]/route.tsx). Kept out of those files because Next
// rejects unknown exports from route and metadata files.

/** Home-screen icons, prerendered as /icons/<name>. */
export const PWA_ICON_SIZES = { "icon-192.png": 192, "icon-512.png": 512 } as const;
export type PwaIconFile = keyof typeof PWA_ICON_SIZES;

export function isPwaIconFile(file: string): file is PwaIconFile {
  return Object.prototype.hasOwnProperty.call(PWA_ICON_SIZES, file);
}

// start_url carries UTM tags so a launch from the home screen is counted as
// its own source: the `enter` event records utm_* on the first page of a
// visit (lib/analytics.ts), so "pwa / homescreen" in the acquisition report
// is the number of home-screen opens.
export const PWA_START_URL = "/?utm_source=pwa&utm_medium=homescreen";
