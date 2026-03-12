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
  const len = (story.content?.length ?? 0) + (story.snippet?.length ?? 0);
  score += Math.min(10, len / 100);
  return Math.round(score);
}

function storyId(story: RawStory): string {
  return createHash("md5").update(story.url).digest("hex").slice(0, 8);
}

async function summarizeOne(story: RawStory): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null as unknown as string;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
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
  } catch {
    return null as unknown as string;
  }
}

export async function summarizeStories(raw: RawStory[]): Promise<Story[]> {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  const top = raw.slice(0, 12);

  let summaries: (string | null)[] = top.map(() => null);

  if (hasApiKey) {
    // Batch AI summarization — best-effort, fallback to snippet on failure
    const BATCH = 5;
    for (let i = 0; i < top.length; i += BATCH) {
      const batch = top.slice(i, i + BATCH);
      const results = await Promise.allSettled(batch.map(summarizeOne));
      for (let j = 0; j < batch.length; j++) {
        const r = results[j];
        summaries[i + j] = r.status === "fulfilled" ? r.value : null;
      }
    }
  }

  const stories: Story[] = top.map((s, i) => {
    const summary =
      summaries[i] ||
      s.snippet?.slice(0, 250) ||
      "Read the full story for details.";

    const category = categorize(s.title, s.snippet ?? "");

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
  return stories;
}
