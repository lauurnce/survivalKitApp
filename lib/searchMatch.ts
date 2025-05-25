// Matching for the /search page.
//
// The old filter was one substring test of the whole query against the title
// and context, so "SQL join" found nothing even though "SQL" and "join" each
// did, "linked lists" missed "Linked List", and "cp1" (the name students use,
// and the one the landing page itself uses) matched no subject at all.
//
// Now the query is split into words and every word must appear somewhere in
// the item's title or context. Known course abbreviations are expanded first,
// and a trailing plural "s" is optional. Title hits rank above context hits.

export interface Searchable {
  type: "subject" | "module";
  title: string;
  context: string;
}

// Abbreviation → the words of the subject title it stands for. Lowercase.
export const SEARCH_ALIASES: Readonly<Record<string, string>> = {
  cp1: "computer programming 1",
  cp2: "computer programming 2",
  dsa: "data structures algorithms",
  oop: "object-oriented programming",
  hci: "human computer interaction",
  os: "operating systems",
  mmw: "mathematics modern world",
  purcom: "purposive communication",
  itc: "introduction computing",
  ias: "information assurance security",
  ds: "discrete structures",
};

export const MAX_RESULTS = 50;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Lowercase words of the query, with abbreviations expanded. */
export function tokenize(query: string): string[] {
  const words = normalize(query)
    .split(" ")
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}+#]+$/gu, ""))
    .filter(Boolean);
  return words.flatMap((w) => (SEARCH_ALIASES[w] ? SEARCH_ALIASES[w].split(" ") : [w]));
}

function wordHits(haystack: string, token: string): boolean {
  if (haystack.includes(token)) return true;
  // "lists" should still find "Linked List"; "classes" finds "Class".
  if (token.length > 3 && token.endsWith("es") && haystack.includes(token.slice(0, -2))) return true;
  if (token.length > 3 && token.endsWith("s") && haystack.includes(token.slice(0, -1))) return true;
  return false;
}

/** 0 = no match; higher is better. */
export function scoreItem(item: Searchable, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const title = normalize(item.title);
  const context = normalize(item.context);
  let score = 0;
  for (const token of tokens) {
    if (wordHits(title, token)) score += 2;
    else if (wordHits(context, token)) score += 1;
    else return 0;
  }
  // Subjects first on a tie: they are the broader landing page.
  return score * 2 + (item.type === "subject" ? 1 : 0);
}

export function searchItems<T extends Searchable>(items: readonly T[], query: string): T[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, tokens) }))
    .filter((r) => r.score > 0)
    // Stable: equal scores keep the page's own subjects-then-A→Z order.
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_RESULTS)
    .map((r) => r.item);
}
