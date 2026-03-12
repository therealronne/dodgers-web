import { NextRequest, NextResponse } from "next/server";
import { buildDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron] Daily refresh started");
    const stories = await buildDigest();
    console.log(`[cron] Done: ${stories.length} stories`);
    return NextResponse.json({
      success: true,
      count: stories.length,
      at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron] Failed:", err);
    return NextResponse.json(
      { error: "Cron failed", details: String(err) },
      { status: 500 }
    );
  }
}
