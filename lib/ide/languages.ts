import type { Language, LanguageId } from "./types";

export const LANGUAGES: Record<LanguageId, Language> = {
  python: {
    id: "python",
    label: "Python",
    runtime: "browser",
    starter: 'print("Hello, BSIT!")\n',
    loadExtension: async () => (await import("@codemirror/lang-python")).python(),
  },
  sql: {
    id: "sql",
    label: "SQL (SQLite)",
    runtime: "browser",
    starter:
      "CREATE TABLE students (id INTEGER, name TEXT);\n" +
      "INSERT INTO students VALUES (1, 'Ana'), (2, 'Ben');\n" +
      "SELECT * FROM students;\n",
    loadExtension: async () => (await import("@codemirror/lang-sql")).sql(),
  },
  java: {
    id: "java",
    label: "Java",
    runtime: "server",
    starter:
      "public class Main {\n" +
      "    public static void main(String[] args) {\n" +
      '        System.out.println("Hello, BSIT!");\n' +
      "    }\n" +
      "}\n",
    loadExtension: async () => (await import("@codemirror/lang-java")).java(),
    piston: { language: "java", version: "15.0.2", filename: "Main.java" },
  },
  c: {
    id: "c",
    label: "C",
    runtime: "server",
    starter:
      "#include <stdio.h>\n\n" +
      "int main(void) {\n" +
      '    printf("Hello, BSIT!\\n");\n' +
      "    return 0;\n" +
      "}\n",
    loadExtension: async () => (await import("@codemirror/lang-cpp")).cpp(),
    piston: { language: "c", version: "10.2.0", filename: "main.c" },
  },
};

export function getLanguage(id: LanguageId): Language {
  const lang = LANGUAGES[id];
  if (!lang) throw new Error(`Unknown language: ${id}`);
  return lang;
}
