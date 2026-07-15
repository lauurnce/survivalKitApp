// Single source of truth for the privacy policy version stamped onto
// consent records (RA 10173 audit trail — see supabase/migrations/
// 20260715000000_waitlist_consent_timestamp.sql). Bump this whenever the
// policy at app/(main)/privacy/page.tsx materially changes, and update the
// "Last updated" label there to match.
export const PRIVACY_POLICY_VERSION = "2026-06";
