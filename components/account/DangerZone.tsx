import { DeleteAccountButton } from "./DeleteAccountButton";

// Account deletion lives on the profile page, last and always visible, so it
// can be reached no matter how much of the dashboard is filled in.
export function DangerZone() {
  return (
    <section
      className="rounded-xl border border-red-500/20 bg-red-500/5 p-5"
      data-tour="profile-danger"
    >
      <h2 className="label-sm">Danger zone</h2>
      <p className="mt-2 text-xs text-ink-muted">
        Deleting your account removes your profile, progress, and login for
        good. This cannot be undone.
      </p>
      <div className="mt-3">
        <DeleteAccountButton />
      </div>
    </section>
  );
}
