import { NextResponse } from "next/server";
import { invalidateDigestCache, getCachedDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    // Bust the cache tag so the next getCachedDigest call re-fetches
    invalidateDigestCache();
    const stories = await getCachedDigest();
    return NextResponse.json({ success: true, count: stories.length });
  } catch (err) {
    console.error("[api/refresh] Error:", err);
    return NextResponse.json(
      { error: "Refresh failed", details: String(err) },
      { status: 500 }
    );
  }
}
