"use client";

import { useState } from "react";
import { Playground } from "@/components/ide/Playground";
import { BackLink } from "@/components/BackLink";
import type { LanguageId } from "@/lib/ide/types";

const LANGS: LanguageId[] = ["python", "sql", "java", "c"];

export default function PlaygroundPage() {
  const [lang, setLang] = useState<LanguageId>("python");
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16">
      <div className="max-w-wide mx-auto">
      <BackLink href="/resources" label="Resources" className="mb-10" />
      <header className="space-y-2 mb-8">
        <p className="label-sm">Practice</p>
        <h1 className="font-serif text-display-md text-ink">Code Playground</h1>
        <p className="text-ink-muted">
          Write and run Python, SQL, Java, or C right in your browser. Nothing to install.
        </p>
      </header>
      <div className="flex gap-2 mb-6">
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`px-3 py-1 text-xs uppercase tracking-widest border ${
              lang === l ? "bg-navy text-paper" : "border-ink-faint/30 text-ink-muted"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <Playground key={lang} languageId={lang} />
      </div>
    </main>
  );
}
