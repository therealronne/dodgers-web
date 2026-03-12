import Anthropic from "@anthropic-ai/sdk";
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

async function aiSummary(client: Anthropic, story: RawStory): Promise<string> {
  const text = story.snippet?.slice(0, 800) ?? "";
  const prompt = text
    ? `Summarize this Dodgers news in 2 sentences. Be specific.\n\nTitle: ${story.title}\n\n${text}`
    : `Summarize this Dodgers headline in 2 sentences.\n\nTitle: ${story.title}`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{ role: "user", content: prompt }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text.trim() : "";
}

export async function summarizeStories(raw: RawStory[]): Promise<Story[]> {
  // Sort by relevance first so we only summarize the stories we'll actually show
  const top = raw.slice(0, 20).map((s) => ({
    story: s,
    category: categorize(s.title, s.snippet ?? ""),
    relevanceScore: computeRelevance(s, categorize(s.title, s.snippet ?? "")),
  }));
  top.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const picked = top.slice(0, 10);

  // Try AI summarization — all in parallel with a 10s hard deadline
  const apiKey = process.env.ANTHROPIC_API_KEY;
  let summaries: (string | null)[] = picked.map(() => null);

  if (apiKey) {
    const client = new Anthropic({ apiKey });
    const results = await Promise.race([
      Promise.allSettled(picked.map(({ story }) => aiSummary(client, story))),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
    ]);

    if (results) {
      summaries = results.map((r) =>
        r.status === "fulfilled" && r.value ? r.value : null
      );
    }
  }

  return picked.map(({ story, category, relevanceScore }, i) => ({
    id: storyId(story),
    title: story.title,
    url: story.url,
    source: story.source,
    publishedAt: story.publishedAt.toISOString(),
    summary: summaries[i] ?? story.snippet?.trim().slice(0, 300) ?? "Click to read the full story.",
    category,
    relevanceScore,
  }));
}
