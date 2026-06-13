import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="label mb-6">404 — Not Found</p>
      <h1 className="font-serif text-display-lg text-ink mb-4">
        Nothing here.
      </h1>
      <p className="font-sans text-ink-muted mb-10">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="font-sans text-sm text-ink hover:text-accent transition-colors"
      >
        ← Back to home
      </Link>
    </main>
  );
}
