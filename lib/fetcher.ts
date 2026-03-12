import Parser from "rss-parser";
import type { RawStory } from "./types";

const parser = new Parser({ timeout: 6000 });

// Google News RSS is reliably accessible from serverless environments
const FEED_SOURCES = [
  {
    name: "Google News",
    rssUrl:
      "https://news.google.com/rss/search?q=Los+Angeles+Dodgers&hl=en-US&gl=US&ceid=US:en",
    limit: 20,
  },
  {
    name: "MLB Trade Rumors",
    rssUrl: "https://www.mlbtraderumors.com/los-angeles-dodgers/feed",
    limit: 10,
  },
  {
    name: "Dodgers Nation",
    rssUrl: "https://dodgersnation.com/feed/",
    limit: 10,
  },
];

async function fetchFromSource(source: {
  name: string;
  rssUrl: string;
  limit: number;
}): Promise<RawStory[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl);
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days

    const stories: RawStory[] = [];
    for (const item of feed.items.slice(0, source.limit)) {
      const title = (item.title ?? "").replace(/\s+-\s+[\w\s]+$/, "").trim(); // strip " - Source Name" suffix
      const url = item.link ?? "";
      if (!title || !url) continue;

      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      if (pubDate.getTime() < cutoff) continue;

      const snippet =
        item.contentSnippet ??
        item.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400) ??
        "";

      stories.push({
        title,
        url,
        source: item.creator || source.name,
        publishedAt: pubDate,
        snippet: snippet.trim(),
      });
    }
    return stories;
  } catch (err) {
    console.warn(`[fetcher] ${source.name} failed:`, err);
    return [];
  }
}

export async function fetchAllStories(): Promise<RawStory[]> {
  // Hard 8s deadline for all feeds combined
  const timeout = new Promise<RawStory[]>((resolve) =>
    setTimeout(() => resolve([]), 8000)
  );

  const fetchAll = Promise.allSettled(
    FEED_SOURCES.map((src) => fetchFromSource(src))
  ).then((results) => {
    const all: RawStory[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") all.push(...r.value);
    }
    return all;
  });

  return Promise.race([fetchAll, timeout]);
}
