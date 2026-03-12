import { NextResponse } from "next/server";
import { readCache, writeCache } from "@/lib/cache";
import { fetchAllStories } from "@/lib/fetcher";
import { deduplicateStories } from "@/lib/deduplicator";
import { summarizeStories } from "@/lib/summarizer";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    // Return cached digest if available for today
    const cached = await readCache();
    if (cached) {
      return NextResponse.json({ stories: cached, cached: true });
    }

    // Fetch → deduplicate → summarize
    console.log("[api/digest] Fetching fresh stories...");
    const raw = await fetchAllStories();
    console.log(`[api/digest] Fetched ${raw.length} raw stories`);

    const deduped = deduplicateStories(raw);
    console.log(`[api/digest] After dedup: ${deduped.length} stories`);

    const stories = await summarizeStories(deduped);
    console.log(`[api/digest] Summarized ${stories.length} stories`);

    await writeCache(stories);

    return NextResponse.json({ stories, cached: false });
  } catch (err) {
    console.error("[api/digest] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch digest", details: String(err) },
      { status: 500 }
    );
  }
}
