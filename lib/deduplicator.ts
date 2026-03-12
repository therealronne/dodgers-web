import type { RawStory } from "./types";

/**
 * Compute a simple cosine-like similarity between two strings based on word overlap.
 */
function titleSimilarity(a: string, b: string): number {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "is", "are", "was", "were", "be", "been", "has", "have",
    "had", "will", "would", "could", "should", "may", "might", "that",
    "this", "it", "its", "as", "by", "from", "up", "about", "into",
  ]);

  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))
    );

  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }

  return intersection / Math.sqrt(setA.size * setB.size);
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Drop query params and hash, lowercase host
    return `${u.hostname.replace(/^www\./, "")}${u.pathname}`.toLowerCase().replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Deduplicate stories by URL (exact) and by title similarity (fuzzy).
 * When duplicates are found, keep the one with the richest content.
 */
export function deduplicateStories(stories: RawStory[]): RawStory[] {
  const seenUrls = new Map<string, number>(); // normalized URL → index in result
  const result: RawStory[] = [];

  for (const story of stories) {
    const normUrl = normalizeUrl(story.url);

    // Exact URL match
    if (seenUrls.has(normUrl)) {
      const idx = seenUrls.get(normUrl)!;
      const existing = result[idx];
      const existingLen =
        (existing.content?.length ?? 0) + (existing.snippet?.length ?? 0);
      const newLen =
        (story.content?.length ?? 0) + (story.snippet?.length ?? 0);
      if (newLen > existingLen) {
        result[idx] = story;
      }
      continue;
    }

    // Fuzzy title match
    let duplicate = false;
    for (let i = 0; i < result.length; i++) {
      if (titleSimilarity(story.title, result[i].title) > 0.55) {
        const existing = result[i];
        const existingLen =
          (existing.content?.length ?? 0) + (existing.snippet?.length ?? 0);
        const newLen =
          (story.content?.length ?? 0) + (story.snippet?.length ?? 0);
        if (newLen > existingLen) {
          seenUrls.delete(normalizeUrl(existing.url));
          result[i] = story;
          seenUrls.set(normUrl, i);
        }
        duplicate = true;
        break;
      }
    }

    if (!duplicate) {
      seenUrls.set(normUrl, result.length);
      result.push(story);
    }
  }

  return result;
}
