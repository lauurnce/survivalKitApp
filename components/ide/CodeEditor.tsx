"use client";

import { useEffect, useId, useMemo, useState } from "react";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import type { Extension } from "@codemirror/state";
import { getLanguage } from "@/lib/ide/languages";
import type { LanguageId } from "@/lib/ide/types";

interface Props {
  languageId: LanguageId;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({ languageId, value, onChange, readOnly }: Props) {
  const lang = getLanguage(languageId);
  const [langExt, setLangExt] = useState<Extension[]>([]);
  const [focused, setFocused] = useState(false);
  const hintId = useId();

  useEffect(() => {
    let active = true;
    getLanguage(languageId)
      .loadExtension()
      .then((ext) => {
        if (active) setLangExt([ext]);
      })
      .catch(() => {
        // Language extension failed to load (e.g. chunk fetch error);
        // fall back to a plain editor with no syntax highlighting.
        if (active) setLangExt([]);
      });
    return () => {
      active = false;
    };
  }, [languageId]);

  // Tab stays bound to indentation, because students write code here. That is
  // CodeMirror's default, and its own escape hatch is what keeps it from being
  // a keyboard trap: Esc, then Tab (or Shift+Tab), moves focus out. The hint
  // below says so, and the label names the editor for screen readers.
  const extensions = useMemo(
    () => [
      ...langExt,
      EditorView.contentAttributes.of({
        "aria-label": `${lang.label} code editor`,
        "aria-describedby": hintId,
      }),
    ],
    [langExt, lang.label, hintId]
  );

  return (
    <div
      className="relative focus-within:outline focus-within:outline-2 focus-within:outline-accent"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <CodeMirror
        value={value}
        height="280px"
        theme="dark"
        extensions={extensions}
        editable={!readOnly}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
      />
      {/* Always in the DOM so aria-describedby resolves; shown only on focus,
          over the editor's bottom edge so it never shifts the layout. */}
      <p
        id={hintId}
        className={
          focused
            ? "pointer-events-none absolute bottom-2 right-2 z-10 bg-navy/90 px-2 py-1 font-mono text-label-sm text-taupe"
            : "sr-only"
        }
      >
        Esc then Tab to leave the editor
      </p>
    </div>
  );
}
