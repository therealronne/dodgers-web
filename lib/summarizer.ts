import Anthropic from "@anthropic-ai/sdk";
import type { RawStory, Story, Category } from "./types";
import { createHash } from "crypto";

const client = new Anthropic();

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
  // Recency bonus: up to 30 points for stories < 6h old
  const ageHours = (Date.now() - story.publishedAt.getTime()) / 3_600_000;
  score += Math.max(0, 30 - ageHours * 5);
  // Content richness
  const len = (story.content?.length ?? 0) + (story.snippet?.length ?? 0);
  score += Math.min(10, len / 100);
  return Math.round(score);
}

function storyId(story: RawStory): string {
  return createHash("md5").update(story.url).digest("hex").slice(0, 8);
}

async function summarizeOne(story: RawStory): Promise<string> {
  const bodyText = (story.content ?? story.snippet ?? "").slice(0, 1500);
  const prompt = bodyText
    ? `Summarize this LA Dodgers news story in exactly 2–3 clear, factual sentences. Be specific with names, stats, and outcomes.\n\nTitle: ${story.title}\n\nArticle excerpt:\n${bodyText}`
    : `Summarize what this LA Dodgers news story is likely about based on its headline in exactly 2–3 sentences.\n\nTitle: ${story.title}`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text.trim() : "";
}

export async function summarizeStories(raw: RawStory[]): Promise<Story[]> {
  // Process in parallel batches of 5 to respect rate limits
  const BATCH = 5;
  const stories: Story[] = [];

  for (let i = 0; i < raw.length; i += BATCH) {
    const batch = raw.slice(i, i + BATCH);
    const summaries = await Promise.allSettled(batch.map(summarizeOne));

    for (let j = 0; j < batch.length; j++) {
      const s = batch[j];
      const result = summaries[j];
      const summary =
        result.status === "fulfilled" && result.value
          ? result.value
          : s.snippet?.slice(0, 200) ?? "Summary unavailable.";

      const category = categorize(s.title, s.snippet ?? "");

      stories.push({
        id: storyId(s),
        title: s.title,
        url: s.url,
        source: s.source,
        publishedAt: s.publishedAt.toISOString(),
        summary,
        category,
        relevanceScore: computeRelevance(s, category),
      });
    }
  }

  // Sort by relevance descending
  stories.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return stories.slice(0, 10);
}
