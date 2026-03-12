import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/cache";
import { fetchAllStories } from "@/lib/fetcher";
import { deduplicateStories } from "@/lib/deduplicator";
import { summarizeStories } from "@/lib/summarizer";
import { writeCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    await invalidateCache();

    const raw = await fetchAllStories();
    const deduped = deduplicateStories(raw);
    const stories = await summarizeStories(deduped);
    await writeCache(stories);

    return NextResponse.json({ success: true, count: stories.length });
  } catch (err) {
    console.error("[api/refresh] Error:", err);
    return NextResponse.json(
      { error: "Refresh failed", details: String(err) },
      { status: 500 }
    );
  }
}
