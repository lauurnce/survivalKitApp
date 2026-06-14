"use client";

import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
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
  const [langExt, setLangExt] = useState<Extension[]>([]);

  useEffect(() => {
    let active = true;
    getLanguage(languageId)
      .loadExtension()
      .then((ext) => {
        if (active) setLangExt([ext]);
      });
    return () => {
      active = false;
    };
  }, [languageId]);

  return (
    <CodeMirror
      value={value}
      height="280px"
      theme="dark"
      extensions={langExt}
      editable={!readOnly}
      onChange={onChange}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
    />
  );
}
