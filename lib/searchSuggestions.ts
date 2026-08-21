// Popular-keyword extraction for the search page: surface the most frequent
// topics across subject/module titles so students get concrete things to try.
// Frequency is computed per distinct title so one long title can't dominate.

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "are",
  "was",
  "were",
  "been",
  "have",
  "has",
  "had",
  "you",
  "your",
  "his",
  "her",
  "its",
  "their",
  "this",
  "that",
  "these",
  "those",
  "from",
  "into",
  "onto",
  "over",
  "under",
  "about",
  "after",
  "before",
  "between",
  "during",
  "through",
  "against",
  "without",
  "within",
  "along",
  "across",
  "behind",
  "beyond",
  "plus",
  "via",
  "per",
  "each",
  "every",
  "any",
  "all",
  "not",
  "but",
  "nor",
  "yet",
  "iii",
  "introduction",
  "chapter",
  "unit",
  "module",
  "lesson",
  "activity",
  "course",
  "subject",
  "reviewer",
  "handout",
  "notes",
  "part",
  "week",
]);

function displayForm(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function popularKeywords(
  titles: Array<{ title: string }>,
  limit = 8,
): string[] {
  const counts = new Map<string, number>();

  for (const { title } of titles) {
    const seenInTitle = new Set<string>();
    for (const raw of title.toLowerCase().split(/[^a-z0-9]+/)) {
      if (raw.length < 3 || STOPWORDS.has(raw)) continue;
      seenInTitle.add(raw);
    }
    for (const word of seenInTitle) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => displayForm(word));
}
