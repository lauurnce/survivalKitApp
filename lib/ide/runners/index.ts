import type { LanguageId, Runner } from "@/lib/ide/types";
import { getLanguage } from "@/lib/ide/languages";

/** Returns the runner for a language. Real runners wired in Phases 3-4. */
export async function getRunner(languageId: LanguageId): Promise<Runner> {
  const lang = getLanguage(languageId);
  if (lang.runtime === "browser") {
    if (languageId === "python") {
      return (await import("./pyodideRunner")).pyodideRunner;
    }
    return (await import("./sqlRunner")).sqlRunner;
  }
  return (await import("./serverRunner")).serverRunner;
}
