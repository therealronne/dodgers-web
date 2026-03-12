/**
 * Cache layer using Next.js Data Cache (unstable_cache).
 * Works on Vercel without any external storage — the cache persists
 * across serverless invocations via Vercel's Data Cache.
 *
 * revalidate: 86400 = 24-hour stale-while-revalidate window.
 * tag: "digest" lets /api/refresh bust the cache on demand.
 */

import { unstable_cache, revalidatePath } from "next/cache";
import { fetchAllStories } from "./fetcher";
import { deduplicateStories } from "./deduplicator";
import { summarizeStories } from "./summarizer";
import type { Story } from "./types";

const REVALIDATE_SECONDS = 86_400; // 24 hours

async function buildDigest(): Promise<Story[]> {
  console.log("[cache] Building fresh digest...");
  const raw = await fetchAllStories();
  console.log(`[cache] Fetched ${raw.length} raw stories`);
  const deduped = deduplicateStories(raw);
  console.log(`[cache] After dedup: ${deduped.length} stories`);
  const stories = await summarizeStories(deduped);
  console.log(`[cache] Summarized ${stories.length} stories`);
  return stories;
}

export const getCachedDigest = unstable_cache(
  buildDigest,
  ["dodgers-digest"],
  { revalidate: REVALIDATE_SECONDS }
);

/** Bust the cache so the next getCachedDigest call re-fetches. */
export function invalidateDigestCache(): void {
  // Revalidate the root layout's data cache, which covers unstable_cache entries.
  revalidatePath("/", "layout");
}
