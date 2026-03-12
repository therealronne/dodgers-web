import { fetchAllStories } from "./fetcher";
import { deduplicateStories } from "./deduplicator";
import { summarizeStories } from "./summarizer";
import type { Story } from "./types";

export async function buildDigest(): Promise<Story[]> {
  const raw = await fetchAllStories();
  const deduped = deduplicateStories(raw);
  return summarizeStories(deduped);
}
