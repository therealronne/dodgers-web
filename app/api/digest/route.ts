import { NextResponse } from "next/server";
import { buildDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const start = Date.now();
  try {
    const stories = await buildDigest();
    console.log(`[api/digest] OK — ${stories.length} stories in ${Date.now() - start}ms`);
    if (stories.length === 0) {
      return NextResponse.json(
        { error: "No stories found. RSS feeds may be unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json({ stories });
  } catch (err) {
    console.error(`[api/digest] Error after ${Date.now() - start}ms:`, err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
