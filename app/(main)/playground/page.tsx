"use client";

import { useState } from "react";
import { Playground } from "@/components/ide/Playground";
import type { LanguageId } from "@/lib/ide/types";

const LANGS: LanguageId[] = ["python", "sql", "java", "c"];

export default function PlaygroundTestPage() {
  const [lang, setLang] = useState<LanguageId>("python");
  return (
    <main className="min-h-screen bg-paper px-6 py-12 md:px-16 max-w-wide">
      <h1 className="font-serif text-2xl text-ink mb-6">Playground (dev harness)</h1>
      <div className="flex gap-2 mb-6">
        {LANGS.map((l) => (
          <button
            key={l}
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
    </main>
  );
}
