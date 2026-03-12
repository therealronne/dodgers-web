/**
 * Vercel Cron Job — runs every day at 7 AM ET (12:00 UTC).
 * Pre-warms the digest cache so the first visitor of the day
 * gets an instant response instead of waiting for a cold fetch.
 *
 * Vercel calls this with a secret header to prevent public access.
 * Set CRON_SECRET in your Vercel environment variables.
 */

import { NextRequest, NextResponse } from "next/server";
import { invalidateDigestCache, getCachedDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Only enforce secret check when one is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Daily pre-warm started");
    invalidateDigestCache();
    const stories = await getCachedDigest();
    console.log(`[cron] Pre-warm complete: ${stories.length} stories cached`);
    return NextResponse.json({
      success: true,
      count: stories.length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] Pre-warm failed:", err);
    return NextResponse.json(
      { error: "Cron failed", details: String(err) },
      { status: 500 }
    );
  }
}
