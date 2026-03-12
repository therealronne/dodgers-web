import { fetchAllStories } from "./fetcher";
import { deduplicateStories } from "./deduplicator";
import { summarizeStories } from "./summarizer";
import type { Story } from "./types";

export async function buildDigest(): Promise<Story[]> {
  console.log("[digest] Fetching RSS feeds...");
  const raw = await fetchAllStories();
  console.log(`[digest] Fetched ${raw.length} raw stories`);
  const deduped = deduplicateStories(raw);
  console.log(`[digest] After dedup: ${deduped.length} stories`);
  const stories = await summarizeStories(deduped);
  console.log(`[digest] Final: ${stories.length} stories`);
  return stories;
}
