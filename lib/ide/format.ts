export interface Truncated {
  text: string;
  truncated: boolean;
}

/** Cap output length so a runaway loop can't freeze the UI. */
export function truncateOutput(text: string, maxChars = 50_000): Truncated {
  if (text.length <= maxChars) return { text, truncated: false };
  return {
    text: text.slice(0, maxChars) + "\n\n… output truncated …",
    truncated: true,
  };
}
