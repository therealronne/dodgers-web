import type { RawStory, Story, Category } from "./types";
import { createHash } from "crypto";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Injuries: ["injur", "il ", "injured", "disabled list", "strain", "surgery", "rehab", "pain", "hurt"],
  Transactions: ["trade", "sign", "acquir", "release", "waiv", "roster", "dfa", "option", "claim", "deal", "contract", "extension"],
  "Game Recaps": ["win", "loss", "beat", "defeat", "score", "inning", "walk-off", "shutout", "recap", "highlights", "game"],
  Opinion: ["opinion", "column", "editorial", "analysis", "breakdown", "why", "should", "must", "perspective", "takes"],
  General: [],
};

const RELEVANCE_BOOSTS: Record<Category, number> = {
  Injuries: 20,
  Transactions: 18,
  "Game Recaps": 10,
  Opinion: 5,
  General: 0,
};

function categorize(title: string, snippet: string): Category {
  const text = (title + " " + snippet).toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (cat === "General") continue;
    if (keywords.some((kw) => text.includes(kw))) return cat;
  }
  return "General";
}

function computeRelevance(story: RawStory, category: Category): number {
  let score = RELEVANCE_BOOSTS[category];
  const ageHours = (Date.now() - story.publishedAt.getTime()) / 3_600_000;
  score += Math.max(0, 30 - ageHours * 5);
  const len = story.snippet?.length ?? 0;
  score += Math.min(10, len / 50);
  return Math.round(score);
}

function storyId(story: RawStory): string {
  return createHash("md5").update(story.url).digest("hex").slice(0, 8);
}

export function summarizeStories(raw: RawStory[]): Story[] {
  const stories: Story[] = raw.slice(0, 20).map((s) => {
    const category = categorize(s.title, s.snippet ?? "");
    const summary = s.snippet?.trim().slice(0, 300) || "Click to read the full story.";

    return {
      id: storyId(s),
      title: s.title,
      url: s.url,
      source: s.source,
      publishedAt: s.publishedAt.toISOString(),
      summary,
      category,
      relevanceScore: computeRelevance(s, category),
    };
  });

  stories.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return stories.slice(0, 12);
}
