import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { RawStory } from "./types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; DodgersDigest/1.0; +https://dodgersdigest.app)",
  },
});

interface FeedSource {
  name: string;
  rssUrl: string;
  keywords: string[];
}

const FEED_SOURCES: FeedSource[] = [
  {
    name: "MLB.com",
    rssUrl: "https://www.mlb.com/feeds/news/rss.xml",
    keywords: ["dodger", "los angeles", "la dodger"],
  },
  {
    name: "ESPN",
    rssUrl: "https://www.espn.com/espn/rss/mlb/news",
    keywords: ["dodger", "los angeles dodgers"],
  },
  {
    name: "Dodgers Nation",
    rssUrl: "https://dodgersnation.com/feed/",
    keywords: [], // All stories are Dodgers-related
  },
  {
    name: "True Blue LA",
    rssUrl: "https://www.truebluela.com/rss/current",
    keywords: [],
  },
  {
    name: "MLB Trade Rumors",
    rssUrl: "https://www.mlbtraderumors.com/los-angeles-dodgers/feed",
    keywords: [],
  },
  {
    name: "AP Sports",
    rssUrl: "https://rsshub.app/ap/topics/sports",
    keywords: ["dodger", "los angeles dodgers"],
  },
];

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DodgersDigest/1.0)",
      },
    });
    if (!res.ok) return "";
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, header, aside, .ad, .advertisement, .sidebar").remove();

    // Try common article content selectors
    const selectors = [
      "article",
      '[class*="article-body"]',
      '[class*="story-body"]',
      '[class*="post-content"]',
      "main p",
      ".content p",
    ];
    for (const sel of selectors) {
      const text = $(sel).text().trim();
      if (text.length > 200) return text.slice(0, 2000);
    }

    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);
  } catch {
    return "";
  }
}

function isDodgersRelated(title: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = title.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

async function fetchFromSource(source: FeedSource): Promise<RawStory[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days

    const stories: RawStory[] = [];

    for (const item of feed.items.slice(0, 20)) {
      const title = item.title ?? "";
      const url = item.link ?? "";
      if (!title || !url) continue;

      if (!isDodgersRelated(title, source.keywords)) continue;

      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      if (pubDate.getTime() < cutoff) continue;

      const snippet =
        item.contentSnippet ??
        item.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 500) ??
        "";

      stories.push({
        title: title.trim(),
        url,
        source: source.name,
        publishedAt: pubDate,
        snippet: snippet.trim(),
      });
    }

    return stories;
  } catch (err) {
    console.warn(`[fetcher] Failed to fetch ${source.name}:`, err);
    return [];
  }
}

export async function fetchAllStories(): Promise<RawStory[]> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((src) => fetchFromSource(src))
  );

  const all: RawStory[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // Enrich top stories with article content (limit to avoid too many requests)
  const topStories = all.slice(0, 15);
  await Promise.allSettled(
    topStories.map(async (story) => {
      if (!story.snippet || story.snippet.length < 100) {
        story.content = await fetchArticleContent(story.url);
      }
    })
  );

  return all;
}
