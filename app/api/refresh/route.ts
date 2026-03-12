import { NextResponse } from "next/server";
import { buildDigest } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const stories = await buildDigest();
    return NextResponse.json({ success: true, count: stories.length });
  } catch (err) {
    console.error("[api/refresh] Error:", err);
    return NextResponse.json(
      { error: "Refresh failed", details: String(err) },
      { status: 500 }
    );
  }
}
